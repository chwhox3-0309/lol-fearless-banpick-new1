"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TftMetaItem {
  id: number;
  season: string;
  tier: string;
  comp_name: string;
  key_champions: string;
  items: string;
  description: string;
}

export default function TftFrontPage() {
  const [items, setItems] = useState<TftMetaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTftData();
  }, []);

  const fetchTftData = async () => {
    const { data } = await supabase
      .from("tft_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  };

  const filteredItems = items.filter(
    (item) =>
      item.comp_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key_champions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 상단 타이틀 (관리자 관련 링크 및 버튼 일체 배제) */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            TFT META COMP
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">전략적 팀 전투(TFT) 메타 조합</h1>
          <p className="text-sm text-gray-400 mt-1">현재 패치에서 가장 강력한 승률을 자랑하는 추천 덱 모음입니다.</p>
        </div>

        {/* 검색바 */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="조합 이름 또는 챔피언 이름으로 검색해보세요 (예: 리븐, 카이사)..."
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 shadow-lg"
          />
        </div>

        {/* 덱 카드 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                    {item.season}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                    {item.tier || "일반"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{item.comp_name}</h3>
                <p className="text-xs text-gray-300">
                  <strong className="text-gray-400">핵심 챔피언:</strong> {item.key_champions}
                </p>
                <p className="text-xs text-gray-300">
                  <strong className="text-gray-400">추천 아이템:</strong> {item.items}
                </p>
              </div>

              {item.description && (
                <div className="bg-gray-950 border border-gray-800/80 rounded-xl p-3 text-xs text-gray-400">
                  💡 {item.description}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
