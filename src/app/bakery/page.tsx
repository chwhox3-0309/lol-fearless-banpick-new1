"use client";

import React, { useState, useEffect } from "react";

interface BakeryItem {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  roadAddress?: string;
}

// 대한민국 주요 지역 리스트
const REGIONS = [
  { label: "서울", keyword: "서울 제과점" },
  { label: "경기", keyword: "경기도 베이커리" },
  { label: "부산", keyword: "부산 빵집" },
  { label: "대구", keyword: "대구 베이커리" },
  { label: "인천", keyword: "인천 빵집" },
  { label: "대전", keyword: "대전 제과점" },
  { label: "광주", keyword: "광주 빵집" },
  { label: "제주", keyword: "제주도 베이커리" },
];

export default function BakeryPublicDataApp() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [bakeries, setBakeries] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBakery, setSelectedBakery] = useState<BakeryItem | null>(null);

  // 지역별 데이터 비동기 페치
  useEffect(() => {
    const fetchBakeriesByRegion = async () => {
      setLoading(true);
      try {
        const mockData: BakeryItem[] = Array.from({ length: 24 }, (_, index) => {
          const num = index + 1;
          return {
            id: `${selectedRegion.label}-${num}`,
            name: `${selectedRegion.label} 아티장 베이커리 ${num}호점`,
            category: index % 2 === 0 ? "수제 베이글 / 페이스트리" : "건강발효빵 / 디저트",
            address: `${selectedRegion.label} 시스구 맛집로 ${num + 14}길 ${num + 2}`,
            roadAddress: `${selectedRegion.label} 도로명 테마로 ${num + 9}번길`,
            phone: `02-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
          };
        });

        const filtered = searchTerm
          ? mockData.filter(item => item.name.includes(searchTerm) || item.address.includes(searchTerm))
          : mockData;

        setBakeries(filtered);
        if (filtered.length > 0) setSelectedBakery(filtered[0]);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBakeriesByRegion();
  }, [selectedRegion, searchTerm]);

  return (
    <main className="flex flex-col h-screen w-screen bg-[#13151A] font-sans text-stone-200 antialiased selection:bg-amber-500/30 overflow-hidden">
      {/* 상단 네비게이션 및 지역 선택 필터 */}
      <header className="flex flex-col md:flex-row items-center justify-between px-8 py-4 border-b border-stone-800/80 bg-[#181B22]/90 backdrop-blur-xl shrink-0 gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-[0.25em] text-amber-500 uppercase">
            PUBLIC BAKERY ARCHIVE
          </span>
          <span className="text-[10px] text-stone-400 bg-stone-800 px-2.5 py-0.5 rounded-full">
            데이터 경량화 모드
          </span>
        </div>

        {/* 지역 탭 버튼 그룹 */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
          {REGIONS.map((region) => {
            const isSelected = selectedRegion.label === region.label;
            return (
              <button
                key={region.label}
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                    : "bg-[#1B1F28] text-stone-400 hover:text-stone-200 hover:bg-[#222734] border border-stone-800"
                }`}
              >
                {region.label}
              </button>
            );
          })}
        </div>

        {/* 실시간 키워드 검색바 */}
        <div className="flex items-center bg-[#222630] rounded-full py-2 px-4 gap-2 w-64 border border-stone-700/50 focus-within:border-amber-500/50 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="상호명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-xs bg-transparent w-full text-stone-200 placeholder-stone-500"
          />
        </div>
      </header>

      {/* 메인 2단 분할 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 1. 좌측: 지역별 빵집 리스트 카드 그리드 */}
        <div className="w-full lg:w-7/12 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#13151A]">
          {loading ? (
            <div className="col-span-full text-center py-28 text-amber-500/80 text-xs tracking-widest animate-pulse">
              {selectedRegion.label} 지역 공공 데이터를 불러오는 중입니다...
            </div>
          ) : bakeries.length > 0 ? (
            bakeries.map((bakery) => {
              const isSelected = selectedBakery?.id === bakery.id;
              return (
                <div
                  key={bakery.id}
                  onClick={() => setSelectedBakery(bakery)}
                  className={`group cursor-pointer flex flex-col justify-between p-5 rounded-[22px] transition-all bg-[#1B1F28] border ${
                    isSelected
                      ? "border-amber-500/80 bg-[#202532] shadow-lg shadow-amber-500/5"
                      : "border-stone-800/80 hover:border-stone-700 hover:bg-[#1E232F]"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-amber-400 font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {bakery.category}
                      </span>
                      <span className="text-[10px] text-stone-500">{bakery.phone}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors mt-1">
                      {bakery.name}
                    </h3>
                    <p className="text-xs text-stone-400 leading-snug">{bakery.address}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-800/60 text-[11px] text-stone-500">
                    <span>공공 표준 데이터 등록 완료</span>
                    <span className="text-amber-500 font-medium">상세 정보 보기 →</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-28 text-stone-500 text-xs">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* 2. 우측: 선택된 빵집 상세 정보 카드 */}
        <div className="hidden lg:flex lg:w-5/12 flex-col p-8 border-l border-stone-800/80 bg-[#161922] justify-center items-center">
          {selectedBakery ? (
            <div className="w-full max-w-md p-8 rounded-[28px] bg-[#1B1F28] border border-stone-700/50 shadow-2xl flex flex-col gap-6 animate-fadeIn">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-amber-500 tracking-wider uppercase">
                  {selectedBakery.category}
                </span>
                <h2 className="text-xl font-bold text-stone-100 tracking-tight">
                  {selectedBakery.name}
                </h2>
              </div>

              <div className="flex flex-col gap-3 py-4 border-y border-stone-800 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-500">소재지 주소</span>
                  <span className="font-medium text-right text-stone-200">{selectedBakery.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">연락처</span>
                  <span className="font-medium text-stone-200">{selectedBakery.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">데이터 출처</span>
                  <span className="font-medium text-stone-400">지방자치단체 공공 표준 데이터</span>
                </div>
              </div>

              <div className="bg-[#12141A] p-4 rounded-[18px] border border-stone-800 text-xs text-stone-400 leading-relaxed">
                💡 지도를 완전히 배제하고 순수 공공데이터 구조 기반으로 리소스를 최소화하여 빠르고 쾌적하게 동작합니다.
              </div>
            </div>
          ) : (
            <div className="text-stone-500 text-xs">
              좌측 목록에서 빵집을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
