// 예시 개념 코드 (Next.js API Route)
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const RIOT_API_KEY = process.env.RIOT_API_KEY; // 환경 변수로 관리

  try {
    // 1. PUUID 조회
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY! } }
    );
    const account = await accountRes.json();
    const puuid = account.puuid;

    // 2. 최근 매치 ID 목록 조회 (queue 설정 등을 통해 커스텀/일반 게임 필터링 가능)
    const matchesRes = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY! } }
    );
    const matchIds = await matchesRes.json();

    // 3. 가장 최근의 '정상 종료된' 매치 상세 데이터 탐색
    let targetMatchData = null;
    for (const matchId of matchIds) {
      const matchRes = await fetch(
        `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY! } }
      );
      const matchData = await matchRes.json();
      
      // 조건: 게임 시간이 너무 짧지 않고(다시하기 방지), 커스텀 게임이거나 원하는 모드일 경우
      // gameDuration은 초 단위 (예: 300초 이상)
      if (matchData.info && matchData.info.gameDuration > 300) {
        targetMatchData = matchData;
        break; // 가장 최근의 유효한 게임을 찾으면 중단
      }
    }

    if (!targetMatchData) {
      return NextResponse.json({ error: '유효한 최근 게임 기록을 찾지 못했습니다.' }, { status: 404 });
    }

    // 4. 블루/레드 팀 픽 정보 파싱
    const participants = targetMatchData.info.participants;
    const blueTeamPicks = participants.filter((p: any) => p.teamId === 100).map((p: any) => p.championName);
    const redTeamPicks = participants.filter((p: any) => p.teamId === 200).map((p: any) => p.championName);

    return NextResponse.json({
      success: true,
      bluePicks: blueTeamPicks,
      redPicks: redTeamPicks,
      gameDuration: targetMatchData.info.gameDuration,
    });

  } catch (error) {
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
