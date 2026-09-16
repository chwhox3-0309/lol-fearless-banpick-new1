import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION_KR = 'https://kr.api.riotgames.com';
const REGION_ASIA = 'https://asia.api.riotgames.com';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json(
      { error: 'Riot API Key가 Vercel 환경변수에 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    // 1. 최신 데이터 드래곤 버전 및 챔피언 데이터 로드 (현재 시즌 자동 감지용)
    const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionRes.json();
    const ver = versions[0] || '14.24.1';

    const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/tft-champion.json`);
    const champData = await champRes.json();

    // 챔피언 ID에서 동적으로 세트 접미사 추출 (예: TFT18_Ahri -> TFT18_)
    let detectedPrefix = 'TFT18_';
    let currentSeasonName = '시즌 18';
    
    if (champData?.data) {
      const firstChampKey = Object.keys(champData.data)[0] || '';
      const matchPrefix = firstChampKey.match(/^(TFT\d+_)?/i);
      if (matchPrefix && matchPrefix[1]) {
        detectedPrefix = matchPrefix[1];
        const setNum = detectedPrefix.replace(/[^0-9]/g, '');
        if (setNum) currentSeasonName = `시즌 ${setNum}`;
      }
    }

    // 2. 천상계 랭커 리스트 조회
    const leagueRes = await fetch(
      `${REGION_KR}/tft/league/v1/challenger?api_key=${RIOT_API_KEY}`,
      { cache: 'no-store' }
    );
    if (!leagueRes.ok) {
      return NextResponse.json(
        { error: `Riot API 호출 실패 (${leagueRes.status})` },
        { status: 400 }
      );
    }

    const leagueData = await leagueRes.json();
    const topEntries = leagueData.entries?.slice(0, 5) || [];
    
    const compMap: Record<string, {
      units: string[];
      gameDatetime: number;
    }> = {};

    for (const entry of topEntries) {
      let puuid = entry.puuid;
      if (!puuid && entry.summonerId) {
        const sumRes = await fetch(
          `${REGION_KR}/tft/summoner/v1/summoners/${entry.summonerId}?api_key=${RIOT_API_KEY}`,
          { cache: 'no-store' }
        );
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          puuid = sumData.puuid;
        }
      }
      if (!puuid) continue;

      const matchesRes = await fetch(
        `${REGION_ASIA}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=3&api_key=${RIOT_API_KEY}`,
        { cache: 'no-store' }
      );
      if (!matchesRes.ok) continue;
      const matchIds: string[] = await matchesRes.json();

      for (const matchId of matchIds) {
        const matchDetailRes = await fetch(
          `${REGION_ASIA}/tft/match/v1/matches/${matchId}?api_key=${RIOT_API_KEY}`,
          { cache: 'no-store' }
        );
        if (!matchDetailRes.ok) continue;
        const matchData = await matchDetailRes.json();

        const gameDatetime = matchData.info?.game_datetime || Date.now();
        const participants = matchData.info?.participants || [];

        for (const player of participants) {
          // 감지된 동적 접미사(예: TFT18_)를 깔끔하게 제거
          const units = player.units?.map((u: { character_id: string }) => {
            let id = u.character_id;
            if (detectedPrefix) {
              id = id.replace(new RegExp(`^${detectedPrefix}`, 'i'), '');
            }
            return id.replace('TFT_', '');
          }) || [];

          if (units.length === 0) continue;
          
          const compName = `${units.slice(0, 3).join(' ')} 덱`;

          if (!compMap[compName]) {
            compMap[compName] = {
              units: units,
              gameDatetime: gameDatetime,
            };
          }
        }
      }
    }

    const fetchedComps = Object.entries(compMap);
    if (fetchedComps.length === 0) {
      return NextResponse.json({ success: false, message: '추출된 매치 데이터가 없습니다.' }, { status: 400 });
    }

    const upsertData = fetchedComps.map(([compName, details], idx) => {
      const teamCode = `${detectedPrefix}${details.units.slice(0, 8).join('_').toUpperCase()}`;

      return {
        id: idx + 1,
        season: currentSeasonName,
        tier: '최신 메타',
        comp_name: compName,
        key_champions: details.units.join(', '),
        items: '정의의 손길, 보석 연꽃, 거인 살인자',
        description: `라이엇 천상계 실시간 매치 데이터를 기반으로 자동 분석된 ${currentSeasonName} ${compName} 조합입니다.`,
        game_datetime: details.gameDatetime,
        team_code: teamCode,
      };
    });

    const { error: dbError } = await supabase.from('tft_posts').upsert(upsertData, { onConflict: 'id' });
    if (dbError) {
      return NextResponse.json({ error: `Supabase 저장 실패: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${currentSeasonName} (${fetchedComps.length}개 덱) 자동 추적 및 동기화 성공!`,
      data: upsertData,
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
