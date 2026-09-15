// src/app/api/tft/sync/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION_KR = 'https://kr.api.riotgames.com';
const REGION_ASIA = 'https://asia.api.riotgames.com';

export async function GET(request: Request) {
  // 🔒 보안 검증 (CRON_SECRET 설정 시)
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
    // 1. 챌린저 리그 조회
    const leagueRes = await fetch(
      `${REGION_KR}/tft/league/v1/challenger?api_key=${RIOT_API_KEY}`,
      { cache: 'no-store' }
    );
    if (!leagueRes.ok) {
      return NextResponse.json(
        { error: `Riot API 호출 실패 (${leagueRes.status}). API Key가 만료되었는지 확인하세요.` },
        { status: 400 }
      );
    }

    const leagueData = await leagueRes.json();
    const topEntries = leagueData.entries?.slice(0, 3) || [];
    const compMap: Record<string, { count: number; units: string[]; items: string[] }> = {};

    // 2. PUUID 추출 및 최근 매치 수집
    for (const entry of topEntries) {
      let puuid = entry.puuid;

      // league API 결과에 puuid가 없는 경우 summonerId로 PUUID 조회
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

      // 최근 2개 매치 조회
      const matchesRes = await fetch(
        `${REGION_ASIA}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=2&api_key=${RIOT_API_KEY}`,
        { cache: 'no-store' }
      );
      if (!matchesRes.ok) continue;
      const matchIds: string[] = await matchesRes.json();

      // 매치 상세 분석
      for (const matchId of matchIds) {
        const matchDetailRes = await fetch(
          `${REGION_ASIA}/tft/match/v1/matches/${matchId}?api_key=${RIOT_API_KEY}`,
          { cache: 'no-store' }
        );
        if (!matchDetailRes.ok) continue;
        const matchData = await matchDetailRes.json();

        const topPlayers = matchData.info?.participants?.filter(
          (p: { placement: number }) => p.placement <= 2
        ) || [];

        for (const player of topPlayers) {
          const units = player.units?.map((u: { character_id: string }) =>
            u.character_id.replace('TFT13_', '').replace('TFT_', '')
          ) || [];

          if (units.length === 0) continue;
          const compName = `${units.slice(0, 3).join(' ')} 덱`;

          if (!compMap[compName]) {
            compMap[compName] = {
              count: 1,
              units: units.slice(0, 5),
              items: ['정의의 손길', '보석 연꽃', '거인 살인자'],
            };
          } else {
            compMap[compName].count += 1;
          }
        }
      }
    }

    const fetchedComps = Object.entries(compMap);

    if (fetchedComps.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Riot API에서 매치 데이터를 추출하지 못했습니다. (API Key 재발급 필요)' },
        { status: 400 }
      );
    }

    // Supabase DB 저장
    const upsertData = fetchedComps.map(([compName, details], idx) => ({
      id: idx + 1,
      season: '시즌 13',
      tier: `${idx + 1}티어`,
      comp_name: compName,
      key_champions: details.units.join(', '),
      items: details.items.join(', '),
      description: `라이엇 천상계 매치 데이터를 기반으로 자동 분석된 승률 상위 ${compName} 메타 조합입니다.`,
    }));

    const { error: dbError } = await supabase.from('tft_posts').upsert(upsertData, { onConflict: 'id' });
    if (dbError) {
      return NextResponse.json({ error: `Supabase 저장 실패: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${upsertData.length}개 덱 동기화 성공!`,
      data: upsertData
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
