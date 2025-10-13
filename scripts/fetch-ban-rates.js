import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES Module에서는 __dirname을 직접 사용할 수 없으므로, 아래 코드로 대체합니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'kr'; // Target region (e.g., kr, na1)
const API_HOST = `https://${REGION}.api.riotgames.com`;
const ASIA_HOST = `https://asia.api.riotgames.com`;

const MATCH_COUNT = 100; // Number of matches to analyze

if (!RIOT_API_KEY || RIOT_API_KEY === 'YOUR_RIOT_API_KEY') {
  console.error('Error: RIOT_API_KEY is not set in .env.local file.');
  console.error('Please get your key from https://developer.riotgames.com/ and add it to .env.local');
  process.exit(1);
}

const apiHeaders = {
  "X-Riot-Token": RIOT_API_KEY,
};

// Helper to handle rate limits with delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRateLimit(url, headers) {
  const response = await fetch(url, { headers });
  if (response.status === 429) { // Rate limit exceeded
    const retryAfter = parseInt(response.headers.get('Retry-After') || '10');
    console.log(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
    await sleep(retryAfter * 1000);
    return fetchWithRateLimit(url, headers);
  }
  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}: ${url}`);
  }
  return response.json();
}

async function main() {
  try {
    console.log('Fetching latest champion data...');
    const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(res => res.json());
    const latestVersion = versionsRes[0];
    const championsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`).then(res => res.json());
    const championDataById = {}; // Map champion key (numeric) to name
    for (const champName in championsRes.data) {
        const champ = championsRes.data[champName];
        championDataById[champ.key] = { id: champ.id, name: champ.name };
    }

    console.log('Fetching Challenger league players...');
    const leagueUrl = `${API_HOST}/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`;
    const challengerLeague = await fetchWithRateLimit(leagueUrl, apiHeaders);

    const summoners = challengerLeague.entries.slice(0, 50); // Get top 50 players for a larger match pool

    console.log('Collecting PUUIDs...');
    const puuids = summoners.map(summoner => summoner.puuid);

    console.log('Fetching match IDs...');
    const matchIds = new Set();
    for (const puuid of puuids) {
        if (matchIds.size >= MATCH_COUNT) break;
        await sleep(100);
        const matchlistUrl = `${ASIA_HOST}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=10`; // Ranked Solo queue
        const playerMatchIds = await fetchWithRateLimit(matchlistUrl, apiHeaders);
        playerMatchIds.forEach(id => matchIds.add(id));
    }

    const uniqueMatchIds = Array.from(matchIds).slice(0, MATCH_COUNT);
    console.log(`Collected ${uniqueMatchIds.length} unique match IDs.`);

    console.log('Analyzing matches for ban data...');
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
        process.stdout.write(`Analyzed ${analyzedCount}/${uniqueMatchIds.length} matches\r`);
    }

    console.log('\nCalculation complete. Formatting data...');

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

    const outputPath = path.resolve(process.cwd(), 'src/data/ban-rates.json');
    fs.writeFileSync(outputPath, JSON.stringify({ 
        lastUpdated: new Date().toISOString(),
        totalMatchesAnalyzed: uniqueMatchIds.length,
        data: banRates 
    }, null, 2));

    console.log(`Successfully saved ban rate data to ${outputPath}`);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
