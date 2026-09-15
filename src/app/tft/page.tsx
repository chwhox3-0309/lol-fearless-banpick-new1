// src/app/tft/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600; // 1시간마다 정적 페이지 자동 갱신 (ISR)

export const metadata: Metadata = {
  title: "전략적 팀 전투(TFT) 메타 덱 조합 & 티어표 가이드 | LoL Fearless",
  description: "최신 패치 기준 승률 1위 TFT 덱, 핵심 챔피언 및 추천 아이템 빌드 완벽 정리 리포트입니다.",
  openGraph: {
    title: "TFT 최신 메타 덱 조합 및 티어 가이드",
    description: "현재 패치 승률 높은 TFT 추천 덱 모음 및 아이템 가이드",
  },
};

interface TftMetaItem {
  id: number;
  season: string;
  tier: string;
  comp_name: string;
  key_champions: string;
  items: string;
  description: string;
}

export default async function TftFrontPage() {
  const { data } = await supabase
    .from("tft_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const items: TftMetaItem[] = data || [];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 상단 SEO 타이틀 헤더 */}
        <header className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            TFT META COMP
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">전략적 팀 전투(TFT) 메타 조합 & 티어표</h1>
          <p className="text-sm text-gray-400 mt-1">현재 패치에서 가장 강력한 승률을 자랑하는 1티어 덱 추천 리포트입니다.</p>
        </header>

        {/* 상단 디스플레이 광고 영역 */}
        <div className="w-full bg-gray-900/50 border border-gray-800/80 rounded-2xl p-4 text-center text-xs text-gray-500 min-h-[90px] flex items-center justify-center">
          <span>광고 영역 (320x90 / 728x90)</span>
        </div>

        {/* 덱 카드 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div key={item.id} className="contents">
              {/* 클릭 시 상세 공략 페이지(/tft/[id])로 이동하여 PV 상승 유도 */}
              <Link
                href={`/tft/${item.id}`}
                className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                      {item.season}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                      {item.tier || "1티어"}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2 group-hover:text-indigo-400 transition-colors">
                    {item.comp_name}
                  </h2>
                  <p className="text-xs text-gray-300">
                    <strong className="text-gray-400">핵심 챔피언:</strong> {item.key_champions}
                  </p>
                  <p className="text-xs text-gray-300">
                    <strong className="text-gray-400">추천 아이템:</strong> {item.items}
                  </p>
                </div>

                {item.description && (
                  <div className="bg-gray-950 border border-gray-800/80 rounded-xl p-3 text-xs text-gray-400 line-clamp-2">
                    💡 {item.description}
                  </div>
                )}
                
                <span className="text-xs text-indigo-400 font-bold flex items-center justify-end gap-1 pt-2">
                  상세 공략 및 배치도 보기 &rarr;
                </span>
              </Link>

              {/* 카드가 3개마다 1개씩 인피드 광고 영역 배치 */}
              {(index + 1) % 3 === 0 && (
                <div className="bg-gray-900/60 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-2 min-h-[250px]">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Sponsor</span>
                  <span className="text-xs text-gray-400">TFT 게이머를 위한 추천 콘텐츠</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
