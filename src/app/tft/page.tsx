// src/app/tft/page.tsx
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import TftListClient from './TftListClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '전략적 팀 전투(TFT) 메타 덱 조합 & 티어표 가이드 | LoL Fearless',
  description: '최신 패치 기준 승률 1위 TFT 덱, 핵심 챔피언 및 추천 아이템 빌드 완벽 정리 리포트입니다.',
};

export default async function TftFrontPage() {
  const { data } = await supabase
    .from('tft_posts')
    .select('*')
    .order('id', { ascending: true });

  const items = data || [];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            TFT META COMP
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
            전략적 팀 전투(TFT) 메타 조합 & 티어표
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            현재 패치에서 가장 강력한 승률을 자랑하는 1티어 덱 추천 리포트입니다.
          </p>
        </header>

        {/* 상단 광고 영역 */}
        <div className="w-full bg-gray-900/50 border border-gray-800/80 rounded-2xl p-4 text-center text-xs text-gray-500 min-h-[90px] flex items-center justify-center">
          <span>광고 영역 (320x90 / 728x90)</span>
        </div>

        {/* 검색 및 챔피언 썸네일 카드 컴포넌트 */}
        <TftListClient initialItems={items} />
      </div>
    </main>
  );
}
