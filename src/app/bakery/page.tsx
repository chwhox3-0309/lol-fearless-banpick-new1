"use client";

import React, { useState, useEffect } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function BakeryApp() {
  // 1. 카카오 맵 SDK 로드 상태 안전하게 관리
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || "",
    libraries: ["services", "clusterer"],
  });

  const [searchTerm, setSearchTerm] = useState("서울 베이커리 맛집");
  const [inputVal, setInputVal] = useState("");
  const [selectedBakery, setSelectedBakery] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.566826, lng: 126.978656 });

  // 예시 베이커리 데이터 (카카오 로컬 API 연동 전 UI 확인용 및 폴백 데이터)
  const bakeries = [
    {
      id: "1",
      name: "아우어베이커리 도산점",
      category: "프리미엄 베이커리 / 빨미까레",
      address: "서울 강남구 도산대로45길 10-11",
      lat: 37.5242,
      lng: 127.0375,
      rating: 4.8,
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
      description: "고소한 버터 향이 가득한 갓 구운 페이스트리와 시그니처 빨미까레가 유명한 베이커리 핫플레이스입니다."
    },
    {
      id: "2",
      name: "효자베이커리",
      category: "동네 명장 빵집 / 콘브레드",
      address: "서울 종로구 필운대로 54",
      lat: 37.5791,
      lng: 126.9692,
      rating: 4.7,
      img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop",
      description: "통통한 옥수수 콘브레드와 갓 튀긴 시식 인심이 넘쳐나는 오랜 전통의 서촌 명소입니다."
    },
    {
      id: "3",
      name: "런던 베이글 뮤지엄 안국",
      category: "베이글 전문점 / 웨이팅 성지",
      address: "서울 종로구 북촌로 4",
      lat: 37.5796,
      lng: 126.9850,
      rating: 4.9,
      img: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop",
      description: "영국 감성의 이국적인 인테리어와 쫄깃한 식감의 수십 가지 베이글을 만나볼 수 있는 곳입니다."
    }
  ];

  useEffect(() => {
    if (bakeries.length > 0) {
      setSelectedBakery(bakeries[0]);
    }
  }, []);

  // 로딩 가드
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#13151A] text-stone-400 font-light tracking-widest text-xs">
        베이커리 지도를 불러오는 중입니다...
      </div>
    );
  }

  // 에러 가드
  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#13151A] text-stone-300 gap-3">
        <p className="font-medium text-rose-400 text-sm">카카오 지도 스크립트 로드 실패</p>
        <p className="text-xs text-stone-500">.env.local 파일의 카카오 지도 API 키와 도메인 설정을 확인해주세요.</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen w-screen bg-[#13151A] font-sans text-stone-200 antialiased selection:bg-amber-500/30 overflow-hidden">
      {/* 상단 네비게이션 바 */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-stone-800/80 bg-[#181B22]/90 backdrop-blur-xl shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-[0.25em] text-amber-500 uppercase">
            ARTISAN BAKERY MAP
          </span>
        </div>

        {/* 검색바 */}
        <div className="flex items-center bg-[#222630] rounded-full py-2.5 px-6 gap-3 w-96 border border-stone-700/50 focus-within:border-amber-500/50 transition-all shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="동네 베이커리 검색 (예: 성수동 빵집)"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="outline-none text-xs bg-transparent w-full text-stone-200 placeholder-stone-500 tracking-tight"
          />
        </div>

        <div className="text-[11px] font-medium tracking-[0.15em] text-amber-400/90 uppercase bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/25">
          Curated Map
        </div>
      </header>

      {/* 메인 스플릿 뷰 (좌측: 빵집 리스트 및 상세, 우측: 카카오 맵) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 1. 좌측 빵집 정보 및 카드 리스트 */}
        <div className="w-full lg:w-5/12 overflow-y-auto p-8 flex flex-col gap-6 bg-[#13151A]">
          {selectedBakery && (
            <div className="p-6 rounded-[28px] bg-[#1B1F28] border border-amber-500/30 shadow-xl flex flex-col gap-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                <img src={selectedBakery.img} alt={selectedBakery.name} className="object-cover w-full h-full" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-400 border border-stone-700/50">
                  ★ {selectedBakery.rating}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-amber-500 font-semibold tracking-wider uppercase">{selectedBakery.category}</span>
                <h2 className="text-base font-bold text-stone-100">{selectedBakery.name}</h2>
                <p className="text-xs text-stone-400">{selectedBakery.address}</p>
                <p className="text-xs text-stone-300 leading-relaxed mt-2 bg-[#12141A] p-3.5 rounded-[16px] border border-stone-800">
                  {selectedBakery.description}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold tracking-widest text-stone-400 uppercase px-1">추천 베이커리 아카이브</h3>
            {bakeries.map((bakery) => (
              <div
                key={bakery.id}
                onClick={() => {
                  setSelectedBakery(bakery);
                  setMapCenter({ lat: bakery.lat, lng: bakery.lng });
                }}
                className={`group cursor-pointer flex items-center justify-between p-4 rounded-[20px] transition-all bg-[#1B1F28] border ${
                  selectedBakery?.id === bakery.id ? "border-amber-500/80 bg-[#202532]" : "border-stone-800/80 hover:border-stone-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] overflow-hidden bg-stone-800 shrink-0">
                    <img src={bakery.img} alt={bakery.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-200 group-hover:text-amber-400 transition-colors">{bakery.name}</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">{bakery.category}</p>
                  </div>
                </div>
                <span className="text-xs text-amber-500 font-medium px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                  보기
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 우측 카카오 맵 영역 */}
        <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden bg-[#161922]">
          <Map
            center={mapCenter}
            style={{ width: "100%", height: "100%" }}
            level={3}
          >
            {bakeries.map((bakery) => (
              <MapMarker
                key={bakery.id}
                position={{ lat: bakery.lat, lng: bakery.lng }}
                onClick={() => setSelectedBakery(bakery)}
              />
            ))}
          </Map>
        </div>
      </div>
    </main>
  );
}
