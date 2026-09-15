import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PageProps {
  params: Promise<{ id: string }>;
}

// 챔피언 ID 변환 및 이미지 URL 추출 헬퍼
function getChampionInfo(rawChampId: string) {
  // 'TFT14_Talon' -> 'Talon' 형식으로 이름 정제
  const cleanName = rawChampId.replace(/^TFT\d+_/, '').replace(/^TFT_/, '');
  
  // Data Dragon 이미지 URL (Riot CDN)
  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/tft-champion/${rawChampId}.png`;

  return { cleanName, imageUrl };
}

export default async function TftDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: deck, error } = await supabase
    .from('tft_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !deck) {
    notFound();
  }

  const rawChampions = deck.key_champions
    ? deck.key_champions.split(',').map((champ: string) => champ.trim())
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-5xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <Link
        href="/tft"
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 transition"
      >
        ← 목록으로 돌아가기
      </Link>

      {/* 메인 덱 카운트 & 메타 정보 카드 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8">
        
        {/* 헤더 영역 */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {deck.season || '시즌 14'}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {deck.tier || '1티어 (우승)'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {deck.comp_name}
            </h1>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400 text-sm font-semibold">
            🥇 1등 달성 우승 덱
          </div>
        </div>

        {/* 핵심 챔피언 조합 (초상화 & 별표 포함) */}
        <div>
          <h2 className="text-base font-bold text-slate-300 mb-4 flex items-center gap-2">
            <span>🛡️</span> 핵심 기물 스쿼드
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {rawChampions.map((champId: string, idx: number) => {
              const { cleanName, imageUrl } = getChampionInfo(champId);
              // 기본 2성(★★) 표시 (핵심 기물 강조용)
              const starRating = idx < 2 ? '⭐⭐' : '⭐⭐';

              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 flex flex-col items-center transition group shadow-md"
                >
                  {/* 성급 (별표) */}
                  <div className="text-xs text-amber-400 mb-1 font-bold tracking-widest">
                    {starRating}
                  </div>

                  {/* 챔피언 섬네일 */}
                  <div className="relative w-16 h-16 mb-2 rounded-lg overflow-hidden border-2 border-amber-500/60 shadow-lg group-hover:scale-105 transition-transform">
                    <img
                      src={imageUrl}
                      alt={cleanName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 챔피언 아이콘 처리
                        e.currentTarget.src =
                          'https://ddragon.leagueoflegends.com/cdn/14.5.1/img/tft-champion/TFT_TrainingDummy.png';
                      }}
                    />
                  </div>

                  {/* 챔피언 이름 */}
                  <span className="text-xs font-semibold text-slate-200 text-center truncate w-full">
                    {cleanName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추천 아이템 & 덱 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
            <h2 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
              <span>⚔️</span> 주요 추천 아이템
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {deck.items || '핵심 캐리 챔피언 위주의 3코어 완제 아이템 빌드'}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
            <h2 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
              <span>💡</span> 운영 가이드 & 팁
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {deck.description || '최상위 랭커의 실전 우승 운영법입니다.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
