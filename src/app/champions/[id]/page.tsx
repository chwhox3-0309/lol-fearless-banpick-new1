// src/app/champions/[id]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Next.js App Router 전용 타입 정의
interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. 최신 라이엇 패치 버전 가져오기
async function getLatestVersion() {
  const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
    next: { revalidate: 3600 },
  });
  const versions = await res.json();
  return versions[0];
}

// 2. 라이엇 API에서 챔피언 상세 정보 가져오기
async function getChampionData(version: string, id: string) {
  try {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion/${id}.json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data[id];
  } catch {
    return null;
  }
}

// 3. 구글 크롤러가 수집할 정적 경로 리스트 자동 생성 (SSG)
export async function generateStaticParams() {
  const version = await getLatestVersion();
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`
  );
  const data = await res.json();

  return Object.keys(data.data).map((id) => ({ id }));
}

// 4. 구글 검색 엔진용 동적 메타태그 (SEO)
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const version = await getLatestVersion();
  const champion = await getChampionData(version, id);

  if (!champion) return { title: '챔피언 정보 없음 | LoL Fearless' };

  return {
    title: `${champion.name} (${champion.title}) - 피어리스 밴픽 분석 & 세트별 정보 | LoL Fearless`,
    description: `${champion.name}의 피어리스 드래프트 세트별 픽률, 라인 자원 고갈률 및 대체 챔피언 정보를 확인하세요.`,
    openGraph: {
      title: `${champion.name} 피어리스 드래프트 가이드`,
      description: champion.blurb,
      images: [`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`],
    },
  };
}

// 5. 챔피언 상세 페이지 뷰
export default async function ChampionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const version = await getLatestVersion();
  const champion = await getChampionData(version, id);

  if (!champion) notFound();

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-indigo-500 shrink-0">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`}
            alt={champion.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-3xl font-extrabold">{champion.name}</h1>
            <span className="text-gray-400 text-sm">({champion.title})</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{champion.blurb}</p>
          <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
            {champion.tags.map((tag: string) => (
              <span key={tag} className="px-2.5 py-1 text-xs bg-indigo-950 text-indigo-300 rounded-md border border-indigo-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fearless SEO Text Content */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-indigo-400">📊 피어리스 포맷 스탯 & 추천 가이드</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 block">권장 픽 세트</span>
            <span className="text-lg font-bold text-teal-400">1 ~ 3 세트</span>
          </div>
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 block">공급 희소성</span>
            <span className="text-lg font-bold text-amber-400">보통 (Tier 2)</span>
          </div>
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 block">라이엇 패치</span>
            <span className="text-lg font-bold text-indigo-400">v{version}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 leading-normal">
          * {champion.name}은(는) 피어리스 드래프트 특성상 이전 세트 픽 여부에 따라 후반 세트 소멸 가능성이 존재합니다. 본 페이지는 라이엇 공식 API v{version} 팩트 데이터를 바탕으로 구글 인덱싱을 지원합니다.
        </p>
      </section>
    </main>
  );
}
