// src/app/api/tft/collect/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const apiKey = process.env.RIOT_API_KEY; // .env.local에 저장된 라이엇 API 키

    if (!matchId) {
      return NextResponse.json({ error: 'matchId가 필요합니다.' }, { status: 400 });
    }

    // 1. 라이엇 TFT 매치 API 호출
    const matchRes = await fetch(
      `https://asia.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${apiKey}`
    );
    const matchData = await matchRes.json();

    // 2. 1등 플레이어 찾기
    const winner = matchData.info?.participants?.find((p: any) => p.placement === 1);

    if (!winner) {
      return NextResponse.json({ error: '1등 플레이어를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 3. units 전체(8~10개) 추출 (slice 없이 전체)
    const allChampions = winner.units.map((u: any) => u.character_id).join(', ');

    // 4. Supabase DB 저장
    const { data, error } = await supabase.from('tft_posts').insert([
      {
        season: '시즌 13',
        tier: '1티어',
        comp_name: '우승 덱',
        key_champions: allChampions, // 전체 기물 저장
        items: '추천 아이템 정보',
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true, champions: allChampions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
