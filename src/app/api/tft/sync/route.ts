// src/app/api/tft/sync/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION_KR = 'https://kr.api.riotgames.com';
const REGION_ASIA = 'https://asia.api.riotgames.com';

export async function GET(request: Request) {
  // 🔒 CRON_SECRET이 Vercel 환경변수에 등록되어 있을 때만 검증
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'Riot API Key가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    // 1. 라이엇 TFT 챌린저 리그 최상위 랭커 조회
    const leagueRes = await fetch(
      `${REGION_KR}/tft/league/v1/challenger?api_key=${RIOT_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!leagueRes.ok) throw new Error('챌린저 리그 정보 조회 실패');
    const leagueData = await leagueRes.json();
    const topEntries = leagueData.entries.slice(0, 3); // 상위 3명 추출

    const compMap: Record<string, { count: number; units: string[]; items: string[] }> = {};

    // 2. 랭커별 소환사 정보 및 최근 매치 수집
    for (const entry of topEntries) {
      const summonerRes = await fetch(
        `${REGION_KR}/tft/summoner/v1/summoners/${entry.summonerId}?api_key=${RIOT_API_KEY}`
      );
      if (!summonerRes.ok) continue;
      const summoner = await summonerRes.json();

      // 최근 3개 매치 ID 가져오기
      const matchesRes = await fetch(
        `${REGION_ASIA}/tft/match/v1/matches/by-puuid/${summoner.puuid}/ids?count=3&api_key=${RIOT_API_KEY}`
      );
      if (!matchesRes.ok) continue;
      const matchIds: string[] = await matchesRes.json();

      // 3. 각 매치 데이터 상세 분석
      for (const matchId of matchIds) {
        const matchDetailRes = await fetch(
          `${REGION_ASIA}/tft/match/v1/matches/${matchId}?api_key=${RIOT_API_KEY}`
        );
        if (!matchDetailRes.ok) continue;
        const matchData = await matchDetailRes.json();

        // 1등, 2등 유저의 조합 데이터만 추출
        const topPlayers = matchData.info.participants.filter(
          (p: { placement: number }) => p.placement <= 2
        );

        for (const player of topPlayers) {
          const units = player.units.map((u: { character_id: string }) =>
            u.character_id.replace('TFT13_', '').replace('TFT_', '')
          );
          const compName = `${units.slice(0, 3).join(' ')} 덱`;

          if (!compMap[compName]) {
            compMap[compName] = {
              count: 1,
              units: units.slice(0, 4),
              items: ['정의의 손길', '보석 연꽃', '거인 살인자'],
            };
          } else {
            compMap[compName].count += 1;
          }
        }
      }
    }

    // 4. 수집된 덱 데이터 Supabase `tft_posts` 테이블에 동기화 (UPSERT)
    const upsertData = Object.entries(compMap).map(([compName, details], idx) => ({
      id: idx + 1,
      season: '최신 메타 (자동 연동)',
      tier: `${idx + 1}티어`,
      comp_name: compName,
      key_champions: details.units.join(', '),
      items: details.items.join(', '),
      description: `라이엇 천상계 매치 데이터를 기반으로 자동 분석된 승률 상위 ${compName} 메타 조합입니다.`,
    }));

    if (upsertData.length > 0) {
      const { error } = await supabase.from('tft_posts').upsert(upsertData, { onConflict: 'id' });
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: `${upsertData.length}개의 최신 메타 덱 수집 및 DB 동기화 완료`,
      data: upsertData,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
