const DATA_DRAGON_URL = 'https://ddragon.leagueoflegends.com/cdn';

export async function getLatestVersion(): Promise<string> {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions: string[] = await response.json();
  return versions[0];
}

interface ChampionData {
  [key: string]: { id: string; name: string; }; // Simplified for now
}

export async function getChampionData(version: string, locale: string = 'en_US'): Promise<ChampionData> {
  const response = await fetch(`${DATA_DRAGON_URL}/${version}/data/${locale}/champion.json`);
  const data: { data: ChampionData } = await response.json();
  return data.data;
}

export function getChampionThumbnailUrl(version: string, championId: string): string {
  return `${DATA_DRAGON_URL}/${version}/img/champion/${championId}.png`;
}
