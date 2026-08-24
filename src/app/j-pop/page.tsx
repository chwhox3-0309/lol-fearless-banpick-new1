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

  // 페이징 및 보기 개수 상태
  const [itemsPerPage, setItemsPerPage] = useState<number>(10); // 기본 10개씩 보기
  const [currentPage, setCurrentPage] = useState<number>(1);

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
  const uniqueSeasons = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  );
  uniqueSeasons.sort((a, b) => b.localeCompare(a));
  const seasons = ["전체", ...uniqueSeasons];

  // 필터링 및 검색 로직
  const filteredItems = items.filter((item) => {
    const matchSeason = selectedSeason === "전체" || item.category === selectedSeason;
    const matchBroadcast = selectedBroadcast === "전체" || item.broadcast === selectedBroadcast;
    
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = 
      !query || 
      item.title.toLowerCase().includes(query) || 
      item.ost_title.toLowerCase().includes(query) || 
      item.artist.toLowerCase().includes(query);

    return matchSeason && matchBroadcast && matchQuery;
  });

  // 필터나 검색어가 바뀔 때 페이지를 1페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSeason, selectedBroadcast, searchQuery, itemsPerPage]);

  // 페이징 계산 로직
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

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
            {/* 1차 필터: 분기별 */}
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

        {/* 콘텐츠 카드 리스트 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-200">
            검색 결과 <span className="text-purple-400 text-sm font-normal">({totalItems}건)</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">보기 개수:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              <option value={10}>10개씩 보기</option>
              <option value={50}>50개씩 보기</option>
              <option value={100}>100개씩 보기</option>
            </select>
          </div>
        </div>

        {/* 콘텐츠 카드 리스트 */}
        {loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm">
            데이터를 불러오는 중입니다...
          </div>
        ) : currentItems.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm space-y-2">
            <p>조건에 일치하는 드라마 OST가 없습니다.</p>
            <p className="text-xs text-gray-500">검색어나 필터를 초기화해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => (
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
                    className="px-3 py-1.5 bg-gray-800 hover:bg-red-600 text-gray-200 hover:text-white text-xs font-medium rounded-xl transition-colors border border-gray-700 hover:border-red-500 shrink-0 shadow-sm"
                  >
                    유튜브 검색 ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 바 */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ◀ 이전
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-medium transition-colors ${
                    currentPage === page
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              다음 ▶
            </button>
          </div>
        )}

        {/* 광고 배너 */}
        <div className="flex justify-center pt-4">
          <KakaoAdFitBanner adUnit="DAN-s7ZfoKBcZ1QEap9Y" width="300" height="250" />
        </div>

      </div>
    </div>
  );
}
