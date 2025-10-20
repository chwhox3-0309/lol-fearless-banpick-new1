// This file is designed to be run in a serverless environment like Vercel.
// It fetches ban rates from the Riot Games API.

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'kr'; // Target region (e.g., kr, na1)
const API_HOST = `https://${REGION}.api.riotgames.com`;
const ASIA_HOST = `https://asia.api.riotgames.com`;

const apiHeaders = {
    "X-Riot-Token": RIOT_API_KEY,
};

const MATCH_COUNT = 100; // Number of matches to analyze

// Helper to handle rate limits with delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRateLimit(url, headers) {
  const response = await fetch(url, { headers });
  if (response.status === 429) { // Rate limit exceeded
    const retryAfter = parseInt(response.headers.get('Retry-After') || '10');
    console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
    await sleep(retryAfter * 1000);
    return fetchWithRateLimit(url, headers);
  }
  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}: ${url}`);
  }
  return response.json();
}

export async function getBanRates() {
  if (!RIOT_API_KEY || RIOT_API_KEY === 'YOUR_RIOT_API_KEY') {
    throw new Error('RIOT_API_KEY is not set. Please set it in your Vercel environment variables.');
  }

  try {
    console.log('[getBanRates] Fetching latest champion data...');
    const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(res => res.json());
    const latestVersion = versionsRes[0];
    const championsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`).then(res => res.json());
    const championDataById = {}; // Map champion key (numeric) to name
    for (const champName in championsRes.data) {
        const champ = championsRes.data[champName];
        championDataById[champ.key] = { id: champ.id, name: champ.name };
    }

    console.log('[getBanRates] Fetching Challenger league players...');
    const leagueUrl = `${API_HOST}/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`;
    const challengerLeague = await fetchWithRateLimit(leagueUrl, apiHeaders);

    const summoners = challengerLeague.entries.slice(0, 50); // Get top 50 players for a larger match pool

    console.log('[getBanRates] Collecting PUUIDs...');
    const puuids = summoners.map(summoner => summoner.puuid);

    console.log('[getBanRates] Fetching match IDs...');
    const matchIds = new Set();
    for (const puuid of puuids) {
        if (matchIds.size >= MATCH_COUNT) break;
        await sleep(100);
        const matchlistUrl = `${ASIA_HOST}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=10`; // Ranked Solo queue
        const playerMatchIds = await fetchWithRateLimit(matchlistUrl, apiHeaders);
        playerMatchIds.forEach(id => matchIds.add(id));
    }

    const uniqueMatchIds = Array.from(matchIds).slice(0, MATCH_COUNT);
    console.log(`[getBanRates] Collected ${uniqueMatchIds.length} unique match IDs.`);

    console.log('[getBanRates] Analyzing matches for ban data...');
    const banCounts = {};
    let analyzedCount = 0;

    for (const matchId of uniqueMatchIds) {
        await sleep(100);
        const matchUrl = `${ASIA_HOST}/lol/match/v5/matches/${matchId}`;
        const matchData = await fetchWithRateLimit(matchUrl, apiHeaders);

        if (matchData.info && matchData.info.teams) {
            matchData.info.teams.forEach(team => {
                team.bans.forEach(ban => {
                    if (ban.championId !== -1) { // -1 is no ban
                        banCounts[ban.championId] = (banCounts[ban.championId] || 0) + 1;
                    }
                });
            });
        }
        analyzedCount++;
    }

    console.log('[getBanRates] Calculation complete. Formatting data...');

    const banRates = Object.entries(banCounts).map(([championKey, count]) => {
        const champion = championDataById[championKey] || { id: 'Unknown', name: 'Unknown Champion' };
        return {
            championId: champion.id,
            championName: champion.name,
            banCount: count,
            banRate: ((count / uniqueMatchIds.length) * 100).toFixed(2),
        };
    });

    banRates.sort((a, b) => b.banCount - a.banCount);

    const finalBanData = { 
        lastUpdated: new Date().toISOString(),
        totalMatchesAnalyzed: uniqueMatchIds.length,
        data: banRates 
    };

    console.log('[getBanRates] Ban rate data generated.');
    return finalBanData;

  } catch (error) {
    console.error('[getBanRates] An error occurred:', error);
    throw error; // Re-throw to be caught by the API route
  }
}