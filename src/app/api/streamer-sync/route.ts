import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: '소환사명과 태그를 입력해주세요.' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: '서버에 라이엇 API 키가 설정되어 있지 않습니다.' }, { status: 500 });
  }

  try {
    // 1. Account V1 API로 PUUID 조회 (아시아 서버 기준)
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );

    if (!accountRes.ok) {
      return NextResponse.json({ error: '해당 소환사를 찾을 수 없습니다. (Riot ID를 확인해주세요)' }, { status: 404 });
    }

    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. Match V5 API로 최근 매치 ID 목록 조회 (최근 5경기)
    const matchesRes = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );

    if (!matchesRes.ok) {
      return NextResponse.json({ error: '매치 기록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    const matchIds: string[] = await matchesRes.json();

    if (!matchIds || matchIds.length === 0) {
      return NextResponse.json({ error: '최근 게임 기록이 없습니다.' }, { status: 404 });
    }

    // 3. 최근 매치들을 순회하며 다시하기가 아닌 정상 종료된 게임 탐색 (gameDuration 300초 이상)
    let targetMatchData = null;
    for (const matchId of matchIds) {
      const matchRes = await fetch(
        `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        // 5분(300초) 이상 진행된 게임만 유효한 게임으로 간주
        if (matchData.info && matchData.info.gameDuration > 300) {
          targetMatchData = matchData;
          break;
        }
      }
    }

    if (!targetMatchData) {
      return NextResponse.json({ error: '다시하기를 제외한 정상 종료된 최근 게임을 찾지 못했습니다.' }, { status: 404 });
    }

    // 4. 블루팀(100) / 레드팀(200) 픽 정보 추출
    const participants = targetMatchData.info.participants;
    const bluePicks = participants
      .filter((p: any) => p.teamId === 100)
      .map((p: any) => p.championName);
    
    const redPicks = participants
      .filter((p: any) => p.teamId === 200)
      .map((p: any) => p.championName);

    return NextResponse.json({
      success: true,
      gameDuration: targetMatchData.info.gameDuration,
      bluePicks,
      redPicks,
    });

  } qcatch (error) {
    return ({ error: 'API 연동 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
