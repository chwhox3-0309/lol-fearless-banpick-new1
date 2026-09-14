import { MetadataRoute } from 'next';
import { getAllPostIds } from '@/lib/posts';
import guidesData from '@/data/guides.json';
import { getLatestVersion, getChampionData } from '@/lib/riot-api';

const URL = 'https://lol-fearless-banpick.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // 1. 정적 페이지 경로 추가
  const staticRoutes = [
    '/',
    '/about',
    '/blog',
    '/contact',
    '/guides',
    '/notices',
    '/privacy',
    '/recommended-bans',
    '/statistics',
    '/tft',
    '/terms',
    '/tier-lists',
    '/wos',
    '/wos/calculator',
    '/wos/notices',
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: route === '/' ? 1.0 : 0.7,
  }));

  // 2. 동적 블로그 포스트 경로 추가
  const blogPosts = getAllPostIds().map(({ params }) => ({
    url: `${URL}/blog/${params.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. 동적 가이드 경로 추가
  const guides = guidesData.map((guide) => ({
    url: `${URL}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 4. 동적 챔피언 상세(/champions) 및 평점(/ratings) 페이지 경로 추가
  let championRoutes: MetadataRoute.Sitemap = [];
  try {
    const latestVersion = await getLatestVersion();
    const championData = await getChampionData(latestVersion);
    const championIds = Object.keys(championData);

    // 신규 SEO 피어리스 페이지(/champions/[id])와 기존 평점 페이지(/ratings/[id]) 함께 수집
    championRoutes = championIds.flatMap((championId) => [
      {
        url: `${URL}/champions/${championId}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8, // 새로 생성한 피어리스 SEO 페이지에 높은 검색 가중치 부여
      },
      {
        url: `${URL}/ratings/${championId}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      },
    ]);
  } catch (error) {
    console.error("Failed to fetch champion data for sitemap:", error);
    // 챔피언 데이터 fetch에 실패하더라도 다른 경로들은 정상적으로 포함시키기 위함
  }

  // 모든 경로를 합쳐서 반환
  return [...staticRoutes, ...blogPosts, ...guides, ...championRoutes];
}
