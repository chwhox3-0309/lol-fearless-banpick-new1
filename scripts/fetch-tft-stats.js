import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'kr';
const API_HOST = `https://${REGION}.api.riotgames.com`;
const ASIA_HOST = `https://asia.api.riotgames.com`;

if (!RIOT_API_KEY) {
  console.error('Error: RIOT_API_KEY가 .env.local에 설정되지 않았습니다.');
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRateLimit(url) {
  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = `${url}${separator}api_key=${RIOT_API_KEY}`;
  
  const response = await fetch(finalUrl);
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '10');
    console.log(`Rate limit 초과. ${retryAfter}초 대기 중...`);
    await sleep(retryAfter * 1000);
    return fetchWithRateLimit(url);
  }
  if (!response.ok) {
    console.error(`Error at URL: ${url}`);
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

const traitNames = {
  // 시즌 11 & 17 통합 매핑
  'DarkStar': '암흑의 별',
  'Assassin': '암살자',
  'Primordian': '태고',
  'ShieldTank': '수호자',
  'HPTank': '난동꾼',
  'MeleeTrait': '근접',
  'Mecha': '메카',
  'Fateweaver': '운명 술사',
  'Astronaut': '우주 비행사',
  'PsyOps': '기동타격대',
  'SpaceGroove': '우주 그루브',
  'Altruist': '이타주의자',
  'Arcanist': '비전 마법사',
  'Behemoth': '거대괴수',
  'Bruiser': '난동꾼',
  'Duelist': '결투가',
  'Invoker': '기원자',
  'Reaper': '사신',
  'Sage': '현자',
  'Sniper': '저격수',
  'Warden': '파수꾼',
  'Inkshadow': '먹그림자',
  'Storyweaver': '이야기꾼',
  'Umbral': '암영'
};

async function main() {
  try {
    console.log('0. 최신 패치 및 챔피언 정보 확인 중...');
    const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionsRes.json();
    const latestVersion = versions[0].split('.').slice(0, 2).join('.'); 
    const fullVersion = versions[0];

    // 챔피언(유닛) 이름 및 이미지 매핑 가져오기
    const unitDataRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${fullVersion}/data/ko_KR/tft-champion.json`);
    const unitDataJson = await unitDataRes.json();
    const unitNames = {};
    const unitImages = {};
    Object.values(unitDataJson.data).forEach(unit => {
      unitNames[unit.id] = unit.name;
      unitImages[unit.id] = unit.image.full;
    });

    // 아이템 이름 및 이미지 매핑 가져오기
    const itemDataRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${fullVersion}/data/ko_KR/tft-item.json`);
    const itemDataJson = await itemDataRes.json();
    const itemNames = {};
    const itemImages = {};
    Object.values(itemDataJson.data).forEach(item => {
      itemNames[item.id] = item.name;
      itemImages[item.id] = item.image.full;
    });

    // 증강(Augment) 이름 및 이미지 매핑 가져오기
    console.log('0.1. 증강 정보 가져오는 중...');
    const augmentDataRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${fullVersion}/data/ko_KR/tft-augments.json`);
    const augmentDataJson = await augmentDataRes.json();
    const augmentNames = {};
    const augmentImages = {};
    Object.values(augmentDataJson.data).forEach(augment => {
      augmentNames[augment.id] = augment.name;
      augmentImages[augment.id] = augment.image.full;
    });

    console.log(`1. ${latestVersion} 패치 챌린저 리그 정보 가져오는 중...`);
    const leagueData = await fetchWithRateLimit(`${API_HOST}/tft/league/v1/challenger?queue=RANKED_TFT`);
    console.log('샘플 데이터:', leagueData.entries[0]);
    const topPlayers = leagueData.entries.slice(0, 15); 

    const deckStats = {};
    let totalMatches = 0;

    console.log(`2. ${topPlayers.length}명의 최근 매치 분석 시작...`);

    const recentWinners = [];

    for (const player of topPlayers) {
      const puuid = player.puuid;
      const matchIds = await fetchWithRateLimit(`${ASIA_HOST}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=5`);
      
      for (const matchId of matchIds) {
        await sleep(50); 
        const match = await fetchWithRateLimit(`${ASIA_HOST}/tft/match/v1/matches/${matchId}`);
        const participant = match.info.participants.find(p => p.puuid === puuid);
        
        if (!participant) continue;

        const activeTraits = participant.traits
          .filter(t => t.tier_current >= 2)
          .map(t => {
            const rawName = t.name.replace(/TFT[0-9]+_/, '').replace('Trait_', '');
            return traitNames[rawName] || rawName;
          })
          .sort();

        const units = participant.units
          .map(u => {
            const rawId = u.character_id;
            const items = (u.itemNames || []).map(itemName => {
              const itemId = itemName; // u.itemNames contains the ID/string
              return {
                id: itemId,
                name: itemNames[itemId] || itemId,
                image: itemImages[itemId] || null
              };
            });

            return {
              name: unitNames[rawId] || rawId.replace(/TFT[0-9]+_/, ''),
              id: rawId,
              image: unitImages[rawId] || null,
              tier: u.tier, // 성급 (1, 2, 3성)
              items: items
            };
          });

          const augments = (participant.augments || []).map(augId => ({
          id: augId,
          name: augmentNames[augId] || augId.replace(/TFT[0-9]+_Augment_/, ''),
          image: augmentImages[augId] || null
        }));

        // 1등 덱 기록
        if (participant.placement === 1 && recentWinners.length < 10) {
          recentWinners.push({
            matchId,
            units,
            traits: activeTraits,
            augments,
            time: new Date(match.info.game_datetime).toLocaleString('ko-KR')
          });
        }

        if (activeTraits.length === 0) continue;

        const deckKey = activeTraits.join(' ');
        if (!deckStats[deckKey]) {
          deckStats[deckKey] = { 
            name: deckKey, 
            winCount: 0, 
            totalCount: 0, 
            sumPlacement: 0, 
            traits: activeTraits,
            units: units 
          };
        } else if (units.length > deckStats[deckKey].units.length) {
          // 더 많은 기물이 포함된 스쿼드로 대표 유닛 구성 업데이트 (9, 10레벨 및 왕관 효과 반영)
          deckStats[deckKey].units = units;
        }

        deckStats[deckKey].totalCount++;
        deckStats[deckKey].sumPlacement += participant.placement;
        if (participant.placement === 1) deckStats[deckKey].winCount++;
        totalMatches++;
        
        process.stdout.write(`분석 중... 매치 수: ${totalMatches}\r`);
      }
    }

    // 통계 계산 및 포맷팅
    const formattedDecks = Object.values(deckStats)
      .filter(d => d.totalCount >= 2) 
      .map(d => ({
        id: d.name.toLowerCase().replace(/ /g, '-'),
        name: d.name,
        tier: d.sumPlacement / d.totalCount <= 3.2 ? 'S' : 'A',
        winRate: parseFloat(((d.winCount / d.totalCount) * 100).toFixed(1)),
        pickRate: parseFloat(((d.totalCount / totalMatches) * 100).toFixed(1)),
        avgPlacement: parseFloat((d.sumPlacement / d.totalCount).toFixed(2)),
        traits: d.traits,
        units: d.units
      }))
      .sort((a, b) => a.avgPlacement - b.avgPlacement)
      .slice(0, 10);

    const result = {
      patchVersion: latestVersion,
      lastUpdated: new Date().toISOString(),
      decks: formattedDecks,
      recentWinners: recentWinners
    };

    const outputPath = path.resolve(process.cwd(), 'src/data/tft-stats.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n성공! ${formattedDecks.length}개의 덱 데이터를 저장했습니다.`);

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

main();