// scripts/update-tft.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RIOT_API_KEY) {
  console.error('❌ 환경 변수를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const REGION = 'kr';
const ASIA_REGION = 'asia';

// API 호출 제한(Rate Limit) 방지용 딜레이 함수
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRiotApi(url) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY } });
  if (!res.ok) throw new Error(`Riot API Error: ${res.status}`);
  return await res.json();
}

async function getTop30WinnerDecks() {
  console.log('🔄 챌린저 1~30위 유저의 최신 우승(1등) 덱 조회 시작...');

  const challengerLeague = await fetchRiotApi(
    `https://${REGION}.api.riotgames.com/tft/league/v1/challenger`
  );

  // 1. LP(리그 포인트) 기준 상위 30명 정렬
  const top30Players = challengerLeague.entries
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .slice(0, 30);

  const winningDecks = [];
  let deckId = 1;

  for (const [index, player] of top30Players.entries()) {
    if (winningDecks.length >= 12) break; // 메타 카드 12개 채워지면 종료

    try {
      await delay(200); // API 과호출 방지

      const summoner = await fetchRiotApi(
        `https://${REGION}.api.riotgames.com/tft/summoner/v1/summoners/${player.summonerId}`
      );

      // 최근 3경기의 Match ID 가져오기
      const matchIds = await fetchRiotApi(
        `https://${ASIA_REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${summoner.puuid}/ids?count=3`
      );

      for (const matchId of matchIds) {
        await delay(150);
        const matchDetail = await fetchRiotApi(
          `https://${ASIA_REGION}.api.riotgames.com/tft/match/v1/matches/${matchId}`
        );

        // 2. placement === 1 (무조건 1등/우승한 덱만 추출)
        const winner = matchDetail.info.participants.find((p) => p.placement === 1);

        if (winner) {
          // 라이엇 API 세트 번호 자동 추출 (없을 경우 기본값 세트)
          const setNumber = matchDetail.info.tft_set_number || 13;
          const seasonTitle = `시즌 ${setNumber}`;

          // 코스트/티어가 높은 순으로 핵심 기물 5개 추출
          const keyUnits = winner.units
            .sort((a, b) => (b.rarity || 0) - (a.rarity || 0))
            .slice(0, 5)
            .map((u) => u.character_id);

          winningDecks.push({
            id: deckId++,
            season: seasonTitle,
            tier: '1티어 (우승)',
            comp_name: `챌린저 ${index + 1}위 우승 덱`,
            key_champions: keyUnits.join(','),
            items: '최상위 랭커 우승 아이템 빌드',
            description: `한국 서버 랭킹 ${index + 1}위 랭커가 최근 1등을 달성한 실전 조합입니다.`,
          });

          break; // 한 랭커당 최신 우승 덱 1개만 챙기고 다음 랭커로 이동
        }
      }
    } catch (e) {
      console.warn(`랭커 ${index + 1}위 데이터 조회 스킵: ${e.message}`);
    }
  }

  return winningDecks;
}

async function runAutoSync() {
  try {
    const decks = await getTop30WinnerDecks();

    if (decks.length === 0) {
      console.log('⚠️ 우승 덱을 찾지 못했습니다.');
      return;
    }

    console.log(`📦 수집된 ${decks.length}개의 챌린저 우승 덱을 Supabase에 동기화합니다...`);
    const { error } = await supabase.from('tft_posts').upsert(decks, { onConflict: 'id' });
    if (error) throw error;

    console.log('✅ 최신 우승 덱 DB 업데이트 성공!');
  } catch (err) {
    console.error('❌ 동기화 실패:', err.message);
    process.exit(1);
  }
}

runAutoSync();
