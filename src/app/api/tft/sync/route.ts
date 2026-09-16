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
    
    // 덱별 통계 누적을 위한 구조체
    const compMap: Record<string, {
      units: string[];
      totalPlacement: number;
      matchCount: number;
      wins: number;
      top4s: number;
    }> = {};

    let totalAnalyzedMatches = 0;

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

        const participants = matchData.info?.participants || [];
        totalAnalyzedMatches += participants.length;

        for (const player of participants) {
          const units = player.units?.map((u: { character_id: string }) =>
            u.character_id.replace('TFT13_', '').replace('TFT_', '')
          ) || [];

          if (units.length === 0) continue;
          
          // 핵심 기물 상위 3개를 키로 삼아 덱 분류
          const compName = `${units.slice(0, 3).join(' ')} 덱`;
          const placement = player.placement || 8;

          if (!compMap[compName]) {
            compMap[compName] = {
              units: units,
              totalPlacement: placement,
              matchCount: 1,
              wins: placement === 1 ? 1 : 0,
              top4s: placement <= 4 ? 1 : 0,
            };
          } else {
            compMap[compName].totalPlacement += placement;
            compMap[compName].matchCount += 1;
            if (placement === 1) compMap[compName].wins += 1;
            if (placement <= 4) compMap[compName].top4s += 1;
          }
        }
      }
    }

    const fetchedComps = Object.entries(compMap);
    if (fetchedComps.length === 0) {
      return NextResponse.json({ success: false, message: '추출된 매치 데이터가 없습니다.' }, { status: 400 });
    }

    // Supabase 저장 데이터 가공 (실제 통계 및 팀 코드 계산)
    const upsertData = fetchedComps.map(([compName, details], idx) => {
      const avgRank = (details.totalPlacement / details.matchCount).toFixed(2);
      const winRate = ((details.wins / details.matchCount) * 100).toFixed(1);
      const top4Rate = ((details.top4s / details.matchCount) * 100).toFixed(1);
      const pickRate = totalAnalyzedMatches > 0 
        ? ((details.matchCount / totalAnalyzedMatches) * 100).toFixed(1) 
        : '1.0';

      // 복사 가능한 고유 팀 코드 생성 (유닛 조합 기반)
      const teamCode = `TFT13_${details.units.slice(0, 8).join('_').toUpperCase()}`;

      return {
        id: idx + 1,
        season: '시즌 13',
        tier: `${idx + 1}티어`,
        comp_name: compName,
        key_champions: details.units.join(', '),
        items: '정의의 손길, 보석 연꽃, 거인 살인자',
        description: `라이엇 천상계 실시간 매치 데이터를 기반으로 자동 분석된 ${compName} 조합입니다.`,
        avg_rank: avgRank,
        win_rate: winRate,
        top4_rate: top4Rate,
        pick_rate: pickRate,
        team_code: teamCode,
      };
    });

    const { error: dbError } = await supabase.from('tft_posts').upsert(upsertData, { onConflict: 'id' });
    if (dbError) {
      return NextResponse.json({ error: `Supabase 저장 실패: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${upsertData.length}개 덱 통계 및 팀 코드 동기화 성공!`,
      data: upsertData,
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
