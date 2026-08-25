"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface BakeryItem {
  bplcnm: string; // 업소명
  rdnwhladdr: string; // 도로명주소
  trdstatenm: string; // 영업상태명
  tel?: string; // 전화번호
}

export default function BakeryArchivePage() {
  const [bakeries, setBakeries] = useState<BakeryItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBakeries = useCallback(async (searchKeyword = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bakery?keyword=${encodeURIComponent(searchKeyword)}&numOfRows=20`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "데이터 조회 실패");
      }

      const items = data?.response?.body?.items || data?.body?.items || [];
      
      // 영업 중인 곳만 필터링
      const activeBakeries = items.filter((item: BakeryItem) => item.trdstatenm === "영업/정상");
      setBakeries(activeBakeries);
    } catch (err) {
      console.error(err);
      setError("베이커리 정보를 가져오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBakeries();
  }, [fetchBakeries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBakeries(keyword);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
              BAKERY ARCHIVE
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              전국 빵집 지도 및 탐색
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              에어비앤비처럼 전국의 맛있는 베이커리를 지역별로 탐색해보세요.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700 shrink-0"
          >
            ← 메인으로
          </Link>
        </div>

        {/* 검색 필터 바 */}
        <form onSubmit={handleSearch} className="flex gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <input
            type="text"
            placeholder="지역 또는 도로명 입력 (예: 서울, 강남구, 부산...)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-pink-600/25 shrink-0"
          >
            검색하기
          </button>
        </form>

        {/* 에러 및 로딩 상태 */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center text-gray-500 text-sm">
            전국 베이커리 데이터를 불러오는 중입니다...
          </div>
        ) : bakeries.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center text-gray-500 text-sm space-y-2">
            <p>검색 결과가 없습니다.</p>
            <p className="text-xs text-gray-500">다른 지역명이나 검색어로 시도해 보세요.</p>
          </div>
        ) : (
          /* 에어비앤비 스타일 카드 그리드 레이아웃 */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bakeries.map((bakery, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all shadow-lg flex flex-col justify-between group"
              >
                <div className="h-40 bg-gray-800 relative flex items-center justify-center overflow-hidden">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🥐</span>
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    영업중
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white truncate">{bakery.bplcnm}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    📍 {bakery.rdnwhladdr || "주소 정보 없음"}
                  </p>
                  {bakery.tel && (
                    <p className="text-xs text-gray-500">📞 {bakery.tel}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
