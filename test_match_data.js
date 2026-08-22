import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const ASIA_HOST = 'https://asia.api.riotgames.com';

async function test() {
  const puuid = 'cMz6OqPXVJLfElGJnDAWV-IBIMxTPqhLxdlkdyl0y7H7Ty5VLB862Q9G6-S2FCZNfb0wpkqmHX7a5w';
  const matchIdsUrl = `${ASIA_HOST}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=1&api_key=${RIOT_API_KEY}`;
  const matchIdsRes = await fetch(matchIdsUrl);
  const matchIds = await matchIdsRes.json();
  const matchId = matchIds[0];
  console.log('Testing matchId:', matchId);
  
  const url = `${ASIA_HOST}/tft/match/v1/matches/${matchId}?api_key=${RIOT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const participant = data.info.participants.find(p => p.puuid === puuid);
  console.log('Participant keys:', Object.keys(participant));
  console.log('Augments field:', participant.augments);
}

test();