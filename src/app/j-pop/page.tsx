"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import KakaoAdFitBanner from "../components/KakaoAdFitBanner";

interface DramaOstItem {
  id: number;
  title: string;
  category: string;    // 연도/분기 (예: "2026년 - 3분기")
  broadcast: string;   // 방송사 (예: "TBS", "후지TV", "넷플릭스" 등)
  ost_title: string;
  artist: string;
  description: string;
  created_at: string;
}

export default function JPopClientPage() {
  const [items, setItems] = useState<DramaOstItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 및 검색 상태
  const [selectedSeason, setSelectedSeason] = useState<string>("전체");
  const [selectedBroadcast, setSelectedBroadcast] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // 1. 방송사 목록 동적 추출 (가나다 순 정렬)
  const broadcasts = [
    "전체",
    ...Array.from(new Set(items.map((item) => item.broadcast).filter(Boolean))).sort(),
  ];

  // 2. 분기 카테고리 목록 추출 후 최신순(내림차순) 자동 정렬
  // 예: "2026년 - 3분기", "2026년 - 1분기", "2024년 - 1분기" 형태로 입력하면 역순으로 정렬됩니다.
  const uniqueSeasons = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  );
  uniqueSeasons.sort((a, b) => b.localeCompare(a)); // 문자열 역순 정렬 (최신 연도/분기가 앞으로 옴)
  const seasons = ["전체", ...uniqueSeasons];

  // 필터링 및 검색 로직
  const filteredItems = items.filter((item) => {
    const matchSeason = selectedSeason === "전체" || item.category === selectedSeason;
    const matchBroadcast = selectedBroadcast === "전체" || item.broadcast === selectedBroadcast;
    
    // 검색어 매칭 (드라마 제목, 곡 제목, 아티스트 이름 대상)
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = 
      !query || 
      item.title.toLowerCase().includes(query) || 
      item.ost_title.toLowerCase().includes(query) || 
      item.artist.toLowerCase().includes(query);

    return matchSeason && matchBroadcast && matchQuery;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 헤더 영역 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              J-DRAMA OST ARCHIVE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            분기별 일본 드라마 & OST 아카이브
          </h1>
          <p className="text-sm text-gray-400">
            시즌별 화제작 드라마와 명품 OST를 방송사와 분기별로 찾아보세요.
          </p>
        </div>

        {/* 검색창 및 이중 필터 박스 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-xl">
          
          {/* 검색 바 */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="드라마 제목, OST 곡명, 아티스트로 검색해보세요..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs text-gray-400 hover:text-white"
              >
                지우기 ✕
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-800/80">
            {/* 1차 필터: 분기별 (최신순 자동 정렬 적용) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium w-16 shrink-0">분기별:</span>
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedSeason === season
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-gray-950 text-gray-400 hover:text-white border border-gray-800"
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>

            {/* 2차 필터: 방송사별 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium w-16 shrink-0">방송사:</span>
              {broadcasts.map((bc) => (
                <button
                  key={bc}
                  onClick={() => setSelectedBroadcast(bc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedBroadcast === bc
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-gray-950 text-gray-400 hover:text-white border border-gray-800"
                  }`}
                >
                  {bc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 콘텐츠 카드 리스트 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-200">
              검색 결과 <span className="text-purple-400 text-sm font-normal">({filteredItems.length}건)</span>
            </h2>
          </div>

          {loading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm">
              데이터를 불러오는 중입니다...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm space-y-2">
              <p>조건에 일치하는 드라마 OST가 없습니다.</p>
              <p className="text-xs text-gray-500">검색어 브라우저나 필터를 초기화해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {item.broadcast && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {item.broadcast}
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.category}
                        </span>
                      )}
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
