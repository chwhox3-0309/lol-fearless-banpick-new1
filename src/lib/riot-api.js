const DATA_DRAGON_URL = 'https://ddragon.leagueoflegends.com/cdn';

export async function getLatestVersion() {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await response.json();
  return versions[0];
}

export async function getChampionData(version, locale = 'en_US') {
  const response = await fetch(`${DATA_DRAGON_URL}/${version}/data/${locale}/champion.json`);
  const data = await response.json();
  return data.data;
}

export function getChampionThumbnailUrl(version, championId) {
  return `${DATA_DRAGON_URL}/${version}/img/champion/${championId}.png`;
}