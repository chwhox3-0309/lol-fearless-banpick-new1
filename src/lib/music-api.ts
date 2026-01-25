// src/lib/music-api.ts
// fs나 jsonwebtoken은 iTunes RSS 피드에 필요 없으므로 제거했습니다.

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
}

/**
 * iTunes Japan Top Songs RSS 피드에서 J-Pop 차트 데이터를 가져오는 함수입니다.
 */
export const getJPopChart = async (): Promise<Track[]> => {
  try {
    const response = await fetch('https://itunes.apple.com/jp/rss/topsongs/limit=100/json', {
      cache: 'no-store', // 최신 데이터를 가져오기 위해 캐시 사용 안 함
    });

    if (!response.ok) {
      console.error("iTunes RSS API Error:", response.status, response.statusText);
      throw new Error('Failed to fetch J-Pop chart from iTunes RSS.');
    }

    const data = await response.json();
    
    // iTunes RSS 피드 구조에 맞춰 데이터를 파싱합니다.
    const entries = data.feed.entry;

    if (!entries) {
      return [];
    }

    return entries.map((entry: any) => {
      // 앨범 아트 중 가장 큰 이미지를 사용합니다.
      const albumArt = entry['im:image'].find((img: any) => img.attributes.height === "170")?.label || 
                       entry['im:image'][0]?.label || '';

      return {
        id: entry.id.attributes['im:id'],
        name: entry['im:name'].label,
        artist: entry['im:artist'].label,
        album: entry['im:collection'] ? entry['im:collection'].label : 'Unknown Album',
        albumArt: albumArt,
      };
    }).filter(Boolean); // 유효하지 않은 항목 필터링

  } catch (error) {
    console.error("Error in getJPopChart:", error);
    console.warn("Returning empty array due to an error. Please check the iTunes RSS feed URL or your network connection.");
    return [];
  }
};
