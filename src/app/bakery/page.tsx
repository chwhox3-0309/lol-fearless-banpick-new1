"use client";

import React, { useState, useEffect } from "react";

interface BakeryItem {
  bplcNm?: string;           
  rdnWhlAddr?: string;       
  siteWhlAddr?: string;      
  bplcInfoTelno?: string;    
  dtlStateNm?: string;       
  [key: string]: any;
}

export default function BakeryArchivePage() {
  const [inputRegion, setInputRegion] = useState<string>("서울"); // 검색할 지역어
  const [searchQuery, setSearchQuery] = useState<string>("서울"); // 실제 적용된 검색어
  const [bakeries, setBakeries] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBakery, setSelectedBakery] = useState<BakeryItem | null>(null);

  useEffect(() => {
    const fetchBakeries = async () => {
      setLoading(true);
      try {
        // 전체 데이터를 넉넉히 가져온 뒤 서버/클라이언트에서 검색어 반영
        const res = await fetch(`/api/bakery?keyword=${encodeURIComponent(searchQuery)}&numOfRows=1000`);
        const json = await res.json();
        
        if (json.items && Array.isArray(json.items)) {
          setBakeries(json.items);
          setSelectedBakery(json.items[0] || null);
        } else {
          setBakeries([]);
          setSelectedBakery(null);
        }
      } catch (err) {
        console.error("데이터 패치 오류:", err);
        setBakeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBakeries();
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputRegion.trim());
  };

  return (
    <main className="flex flex-col h-screen w-full bg-[#13151A] font-sans text-stone-200 antialiased overflow-hidden select-none">
      {/* 상단 네비게이션 및 지역 검색바 */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-3.5 border-b border-stone-800 bg-[#181B22] shrink-0 gap-3 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black tracking-[0.2em] text-amber-500 uppercase">
            PUBLIC BAKERY ARCHIVE
          </span>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
            공공데이터포털 실시간 연동
          </span>
        </div>

        {/* 지역명 직접 검색 Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-[#222630] rounded-full py-1.5 px-3.5 gap-2 w-full md:w-72 border border-stone-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="지역명 또는 매장명 검색 (예: 서울, 강남구, 뚜레쥬르)"
              value={inputRegion}
              onChange={(e) => setInputRegion(e.target.value)}
              className="outline-none text-xs bg-transparent w-full text-stone-200 placeholder-stone-500"
            />
          </div>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0"
          >
            검색
          </button>
        </form>
      </header>

      {/* 메인 2단 분할 레이아웃 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 1. 좌측 리스트 그리드 */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-[#13151A] content-start">
          {loading ? (
            <div className="col-span-full text-center py-24 text-amber-500 text-xs tracking-widest animate-pulse">
              공공데이터 서버에서 데이터를 안전하게 불러오는 중입니다...
            </div>
          ) : bakeries.length > 0 ? (
            bakeries.map((bakery, idx) => {
              const name = bakery.bplcNm || bakery.BPLC_NM || "상호명 미등록";
              const addr = bakery.rdnWhlAddr || bakery.ROAD_NM_ADDR || bakery.siteWhlAddr || bakery.SITE_WHL_ADDR || "주소 정보 없음";
              const tel = bakery.bplcInfoTelno || bakery.BPLC_INFO_TELNO || "번호없음";
              const state = bakery.dtlStateNm || bakery.DTL_STATE_NM || "영업중";

              const isSelected = selectedBakery === bakery;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedBakery(bakery)}
                  className={`group cursor-pointer flex flex-col justify-between p-4 rounded-2xl transition-all bg-[#1B1F28] border ${
                    isSelected
                      ? "border-amber-500 bg-[#212633] shadow-lg shadow-amber-500/5"
                      : "border-stone-800 hover:border-stone-700 hover:bg-[#1E232F]"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-amber-400 font-medium px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                        {state}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{tel}</span>
                    </div>
                    <h3 className="text-xs font-bold text-stone-100 group-hover:text-amber-400 transition-colors mt-1 truncate">
                      {name}
                    </h3>
                    <p className="text-[11px] text-stone-400 truncate">
                      {addr}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-800/80 text-[10px] text-stone-500">
                    <span>공공데이터포털 실시간 연동</span>
                    <span className="text-amber-500 font-medium">상세보기 →</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-24 text-stone-500 text-xs">
              검색 결과가 없습니다. 다른 지역명이나 상호명으로 검색해 보세요.
            </div>
          )}
        </div>

        {/* 2. 우측 상세 패널 */}
        <aside className="w-[380px] shrink-0 hidden xl:flex flex-col p-6 border-l border-stone-800 bg-[#161922] justify-center items-center">
          {selectedBakery ? (
            <div className="w-full p-6 rounded-3xl bg-[#1B1F28] border border-stone-700/60 shadow-2xl flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase">
                    공공데이터 표준 인증 업소
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                    {selectedBakery.dtlStateNm || selectedBakery.DTL_STATE_NM || "영업"}
                  </span>
                </div>
                <h2 className="text-base font-bold text-stone-100 tracking-tight break-keep">
                  {selectedBakery.bplcNm || selectedBakery.BPLC_NM}
                </h2>
              </div>

              <div className="flex flex-col gap-3 py-3 border-y border-stone-800 text-xs text-stone-300">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500">도로명 주소</span>
                  <span className="font-medium text-stone-200 break-keep">
                    {selectedBakery.rdnWhlAddr || selectedBakery.ROAD_NM_ADDR || "도로명 주소 없음"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500">지번 주소</span>
                  <span className="font-medium text-stone-400 break-keep">
                    {selectedBakery.siteWhlAddr || selectedBakery.SITE_WHL_ADDR || "지번 주소 없음"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500">매장 연락처</span>
                  <span className="font-medium text-stone-200 font-mono">
                    {selectedBakery.bplcInfoTelno || selectedBakery.BPLC_INFO_TELNO || "정보 없음"}
                  </span>
                </div>
              </div>

              <div className="bg-[#12141A] p-3.5 rounded-2xl border border-stone-800 text-[11px] text-stone-400 leading-relaxed">
                🛡️ 본 서비스는 공공데이터포털의 공식 오픈데이터를 직접 연동하여 제공하므로, 이용자들에게 신뢰도 높은 정보를 전달합니다.
              </div>
            </div>
          ) : (
            <div className="text-stone-500 text-xs text-center">
              목록에서 베이커리를 선택하면<br />상세 정보가 표시됩니다.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
