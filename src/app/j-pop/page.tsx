"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import KakaoAdFitBanner from "../components/KakaoAdFitBanner";

interface DramaOstItem {
  id: number;
  title: string;
  category: string;
  broadcast: string;
  ost_title: string;
  artist: string;
  description: string;
  created_at: string;
}

export default function JPopClientPage() {
  const [items, setItems] = useState<DramaOstItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  // Supabase에서 데이터 불러오기
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jpop_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("데이터 로드 실패:", error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  // 고유 카테고리 추출 (필터 탭용)
  const categories = ["전체", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = selectedCategory === "전체" 
    ? items 
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                J-DRAMA OST ARCHIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              분기별 일본 드라마 & OST 아카이브
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              관리자가 직접 엄선하고 등록하는 화제작 드라마와 명품 OST 모음입니다.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700 shrink-0"
          >
            ← 메인 (밴픽)으로
          </Link>
        </div>

        {/* 카테고리 필터 탭 */}
        {categories.length > 1 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-2 flex-wrap shadow-xl">
            <span className="text-xs text-gray-400 font-medium mr-2">카테고리:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-gray-950 text-gray-400 hover:text-white border border-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 콘텐츠 카드 리스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            등록된 아카이브 목록 <span className="text-purple-400 text-sm font-normal">({filteredItems.length}건)</span>
          </h2>

          {loading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm">
              데이터를 불러오는 중입니다...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm">
              등록된 게시물이 없습니다. 관리자 페이지에서 새 글을 추가해보세요!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.broadcast && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {item.broadcast}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white pt-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-300 font-semibold">🎵 {item.ost_title}</p>
                      <p className="text-[11px] text-gray-400">아티스트: {item.artist}</p>
                    </div>
                    <button 
                      onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.ost_title + ' ' + item.artist)}`, '_blank')}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-xl transition-colors border border-gray-700 shrink-0"
                    >
                      유튜브 검색 ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 광고 배너 */}
        <div className="flex justify-center pt-4">
          <KakaoAdFitBanner adUnit="DAN-s7ZfoKBcZ1QEap9Y" width="300" height="250" />
        </div>

      </div>
    </div>
  );
}
