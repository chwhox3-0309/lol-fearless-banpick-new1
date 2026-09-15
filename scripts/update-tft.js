// scripts/update-tft.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RIOT_API_KEY) {
  console.error('❌ 필수 환경 변수가 누락되었습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const REGION = 'kr';
const ASIA_REGION = 'asia';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRiotApi(url) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY } });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(`[Riot API Key 만료/오류] status: ${res.status}`);
    }
    throw new Error(`[Riot API Error] status: ${res.status}`);
  }
  return await res.json();
}

async function getTop30WinnerDecks() {
  console.log('🔄 챌린저 1~30위 유저의 최신 우승(1등) 덱 조회 시작...');

  const challengerLeague = await fetchRiotApi(
    `https://${REGION}.api.riotgames.com/tft/league/v1/challenger`
  );

  const top30Players = challengerLeague.entries
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .slice(0, 30);

  const winningDecks = [];
  let deckId = 1;

  for (const [index, player] of top30Players.entries()) {
    if (winningDecks.length >= 12) break;

    try {
      await delay(120);
      const puuid = player.puuid;
      if (!puuid) continue;

      const matchIds = await fetchRiotApi(
        `https://${ASIA_REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=3`
      );

      for (const matchId of matchIds) {
        await delay(120);
        const matchDetail = await fetchRiotApi(
          `https://${ASIA_REGION}.api.riotgames.com/tft/match/v1/matches/${matchId}`
        );

        const winner = matchDetail.info?.participants?.find((p) => p.placement === 1);

        if (winner) {
          // 동적 세트 번호 파싱
          const rawSet = matchDetail.info?.tft_set_number;
          const coreName = matchDetail.info?.tft_set_core_name;
          const extractedSet = rawSet || (coreName ? coreName.match(/\d+/)?.[0] : null);
          const seasonTitle = extractedSet ? `시즌 ${extractedSet}` : '시즌 14';

          const keyUnits = winner.units
            ? winner.units
                .sort((a, b) => (b.rarity || 0) - (a.rarity || 0))
                .slice(0, 5)
                .map((u) => u.character_id)
            : [];

          if (keyUnits.length > 0) {
            winningDecks.push({
              id: deckId++,
              season: seasonTitle,
              tier: '1티어 (우승)',
              comp_name: `챌린저 ${index + 1}위 우승 덱`,
              key_champions: keyUnits.join(','),
              items: '최상위 랭커 우승 아이템 빌드',
              description: `한국 서버 랭킹 ${index + 1}위 랭커가 최근 1등을 달성한 실전 조합입니다.`,
            });
            break;
          }
        }
      }
    } catch (e) {
      console.warn(`스킵: ${e.message}`);
    }
  }

  return winningDecks;
}

async function runAutoSync() {
  try {
    const decks = await getTop30WinnerDecks();

    if (decks.length === 0) {
      console.log('⚠️ 수집된 덱이 없습니다.');
      return;
    }

    console.log(`📦 ${decks.length}개의 최신 덱 데이터를 Supabase에 저장합니다...`);
    
    // 기존 테이블의 이전 시즌 레코드가 남아있지 않도록 upsert 진행
    const { error } = await supabase.from('tft_posts').upsert(decks, { onConflict: 'id' });
    if (error) throw error;

    console.log('✅ 최신 우승 덱 DB 동기화 성공!');
  } catch (err) {
    console.error('❌ 동기화 실패:', err.message);
    process.exit(1);
  }
}

runAutoSync();
