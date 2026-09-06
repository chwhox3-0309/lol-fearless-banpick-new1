import { NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY || '';
const REGION_ROUTING = 'asia'; // 한국 서버는 asia 라우팅 사용
const PLATFORM_ROUTING = 'kr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: '소환사 이름과 태그를 입력해주세요.' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: '서버에 라이엇 API Key가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    // 1. Riot ID로 PUUID 조회 (Account-V1)
    const accountRes = await fetch(
      `https://${REGION_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${RIOT_API_KEY}`
    );
    
    if (!accountRes.ok) {
      return NextResponse.json({ error: '소환사 계정을 찾을 수 없습니다. 이름과 태그를 확인해주세요.' }, { status: 404 });
    }
    
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. 최근 매치 ID 목록 조회 (Match-V5, 최근 5경기)
    const matchesRes = await fetch(
      `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5&api_key=${RIOT_API_KEY}`
    );
    
    if (!matchesRes.ok) {
      return NextResponse.json({ error: '매치 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
    
    const matchIds: string[] = await matchesRes.json();

    // 3. 각 매치의 상세 정보 조회 후 플레이한 챔피언 추출
    const matchHistories = [];
    
    for (let i = 0; i < matchIds.length; i++) {
      const matchId = matchIds[i];
      const detailRes = await fetch(
        `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_API_KEY}`
      );
      
      if (detailRes.ok) {
        const matchData = await detailRes.json();
        const participants = matchData.info.participants;
        
        // 해당 유저 찾기
        const userParticipant = participants.find((p: any) => p.puuid === puuid);
        
        if (userParticipant) {
          // 블루팀(100) 또는 레드팀(200) 구분 및 팀원 전체 챔피언 추출 구조화
          const teamId = userParticipant.teamId; // 100 or 200
          const teamParticipants = participants.filter((p: any) => p.teamId === teamId);
          const enemyParticipants = participants.filter((p: any) => p.teamId !== teamId);

          matchHistories.push({
            setNo: i + 1,
            matchId,
            // 블루/레드 팀 매핑 (임의로 내 팀을 블루, 상대 팀을 레드 또는 실제 진영 배분에 맞춤)
            bluePicks: teamParticipants.map((p: any) => p.championName),
            redPicks: enemyParticipants.map((p: any) => p.championName),
          });
        }
      }
    }

    return NextResponse.json({ success: true, matchHistories });
  } catch (error) {
    console.error('라이엇 API 호출 오류:', error);
    return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
