// src/app/tft/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1시간마다 정적 페이지 자동 갱신 (ISR)

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. 구글 검색엔진 동적 메타데이터 자동화 (SEO)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return { title: '잘못된 접근 | LoL Fearless' };
  }

  const { data: item } = await supabase
    .from('tft_posts')
    .select('*')
    .eq('id', numericId)
    .single();

  if (!item) {
    return { title: 'TFT 덱 정보를 찾을 수 없습니다 | LoL Fearless' };
  }

  return {
    title: `${item.comp_name} 덱 공략 - TFT ${item.season} 메타 빌드업 & 아이템 | LoL Fearless`,
    description: `${item.comp_name} 덱의 핵심 챔피언(${item.key_champions}), 추천 아이템(${item.items}), 리롤 타이밍 및 운영법 완벽 가이드입니다.`,
    openGraph: {
      title: `${item.comp_name} 덱 완벽 공략 가이드`,
      description: `${item.season} ${item.tier || '1티어'} 메타 덱 공략 및 아이템 빌드`,
    },
  };
}

// 2. SSG 정적 경로 사전 생성
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('tft_posts').select('id');
    return (data || []).map((item) => ({ id: String(item.id) }));
  } catch {
    return [];
  }
}

// 3. 상세 페이지 메인 컴포넌트
export default async function TftDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    notFound();
  }

  const { data: item } = await supabase
    .from('tft_posts')
    .select('*')
    .eq('id', numericId)
    .single();

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* 1. 상단 네비게이션 & 헤더 */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <Link href="/tft" className="text-xs text-indigo-400 font-bold hover:underline">
          &larr; TFT 전체 메타 목록으로 돌아가기
        </Link>
        <span className="text-xs font-mono px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
          {item.season}
        </span>
      </div>

      {/* 2. 덱 타이틀 요약 정보 */}
      <header className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
            {item.tier || '1티어'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white">{item.comp_name}</h1>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
      </header>

      {/* 상단 애드센스 디스플레이 광고 영역 */}
      <div className="w-full bg-gray-900/40 border border-gray-800/80 rounded-xl p-4 text-center text-xs text-gray-500 min-h-[90px] flex items-center justify-center">
        <span>광고 영역 (300x250 / 728x90)</span>
      </div>

      {/* 3. 정밀 공략 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 핵심 챔피언 및 시너지 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
            <span>👑</span> 핵심 캐리 챔피언
          </h2>
          <p className="text-base font-bold text-white font-mono">{item.key_champions}</p>
          <span className="text-[11px] text-gray-400 block pt-1">
            * 메인 3성(혹은 2성)작 우선순위 챔피언입니다.
          </span>
        </div>

        {/* 핵심 추천 아이템 (BiS) */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <span>⚔️</span> 종결 아이템 빌드 (BiS)
          </h2>
          <p className="text-base font-bold text-white font-mono">{item.items}</p>
          <span className="text-[11px] text-gray-400 block pt-1">
            * 대체 가능 아이템: 정손, 거인 살인자, 밤의 끝자락
          </span>
        </div>
      </div>

      {/* 4. 빌드업 운영법 및 리롤 타이밍 가이드 */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📈</span> 레벨업 & 리롤 타이밍 운영 가이드
        </h2>
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800">
            <strong className="text-indigo-300 block mb-1">초반 빌드업 (2~3단계)</strong>
            연승/연패 이자 관리 위주로 진행하며, 최종 딜러의 아이템을 받아먹을 수 있는 임시 기물에 아이템을 선장착합니다.
          </div>
          <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800">
            <strong className="text-teal-300 block mb-1">핵심 리롤 구간 (6~8레벨)</strong>
            4코스트 캐리 덱의 경우 8레벨 롤쳐서 덱을 완성하며, 2~3코스트 3성작 덱은 6~7레벨에서 50골드 이자를 유지하며 슬로우 리롤을 진행합니다.
          </div>
        </div>
      </section>

      {/* 하단 연관 덱 추천 (PV 연쇄 상승 유도) */}
      <div className="bg-gray-900/60 border border-indigo-500/20 rounded-xl p-5 text-center space-y-3">
        <p className="text-xs text-gray-300">
          다른 1티어 덱의 아이템 빌드와 운영법이 궁금하신가요?
        </p>
        <Link
          href="/tft"
          className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition"
        >
          실시간 TFT 최신 메타 티어표 전체보기
        </Link>
      </div>
    </main>
  );
}
