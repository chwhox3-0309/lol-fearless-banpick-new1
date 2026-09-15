// scripts/update-tft.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// 1. 환경 변수 체크
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RIOT_API_KEY) {
  console.error('❌ 필수 환경 변수가 누락되었습니다.');
  console.error(`- SUPABASE_URL: ${SUPABASE_URL ? 'OK' : '누락'}`);
  console.error(`- SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? 'OK' : '누락'}`);
  console.error(`- RIOT_API_KEY: ${RIOT_API_KEY ? 'OK' : '누락'}`);
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
      throw new Error(`[Riot API Key 만료/오류] status: ${res.status}. developer.riotgames.com 에서 키를 재발급받아 GitHub Secrets를 갱신하세요.`);
    }
    throw new Error(`[Riot API Error] status: ${res.status} (${res.statusText})`);
  }
  return await res.json();
}

async function getTop30WinnerDecks() {
  console.log('🔄 챌린저 1~30위 유저의 최신 우승(1등) 덱 조회 시작...');

  const challengerLeague = await fetchRiotApi(
    `https://${REGION}.api.riotgames.com/tft/league/v1/challenger`
  );

  if (!challengerLeague?.entries) {
    throw new Error('챌린저 리그 데이터를 불러오지 못했습니다.');
  }

  // LP 기준 상위 30명 정렬
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

      // 최근 3경기의 Match ID 가져오기
      const matchIds = await fetchRiotApi(
        `https://${ASIA_REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=3`
      );

      for (const matchId of matchIds) {
        await delay(120);
        const matchDetail = await fetchRiotApi(
          `https://${ASIA_REGION}.api.riotgames.com/tft/match/v1/matches/${matchId}`
        );

        // placement === 1 (우승한 덱)
        const winner = matchDetail.info?.participants?.find((p) => p.placement === 1);

        if (winner) {
          const setNumber = matchDetail.info.tft_set_number || 13;
          const seasonTitle = `시즌 ${setNumber}`;

          // 코스트/티어 순 핵심 기물 5개 추출
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
      console.warn(`랭커 ${index + 1}위 데이터 조회 중 스킵: ${e.message}`);
      if (e.message.includes('Key 만료')) {
        throw e;
      }
    }
  }

  return winningDecks;
}

async function runAutoSync() {
  try {
    const decks = await getTop30WinnerDecks();

    if (decks.length === 0) {
      console.log('⚠️ 조건에 맞는 우승 덱을 찾지 못했습니다.');
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
