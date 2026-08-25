"use client";

import React, { useState, useEffect } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

// 베이커리 데이터 인터페이스
interface BakeryItem {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  lat: number;
  lng: number;
  phone: string;
  placeUrl: string;
}

export default function BakeryApp() {
  // 1. 카카오 맵 SDK 로드 (services 라이브러리 필수)
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || "",
    libraries: ["services", "clusterer"],
  });

  const [searchTerm, setSearchTerm] = useState("서울 베이커리");
  const [inputVal, setInputVal] = useState("");
  const [bakeries, setBakeries] = useState<BakeryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 지도 중심 좌표 (기본: 서울역 / 강남 등 원하는 위치로 조정 가능)
  const [mapCenter, setMapCenter] = useState({ lat: 37.566826, lng: 126.978656 });
  const [mapInstance, setMapInstance] = useState<any>(null);

  // 2. 카카오 Places API를 이용한 실시간 베이커리 검색
  useEffect(() => {
    if (!loading && window.kakao && window.kakao.maps) {
      const ps = new window.kakao.maps.services.Places();

      ps.keywordSearch(searchTerm, (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const formattedData: BakeryItem[] = data.map((place: any) => ({
            id: place.id,
            name: place.place_name,
            category: place.category_name.split(">").pop()?.trim() || "베이커리",
            address: place.address_name,
            roadAddress: place.road_address_name || place.address_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            phone: place.phone || "정보 없음",
            placeUrl: place.place_url,
          }));
          setBakeries(formattedData);
          
          // 검색 결과가 있다면 첫 번째 장소로 지도 중심 이동
          if (formattedData.length > 0) {
            setMapCenter({ lat: formattedData[0].lat, lng: formattedData[0].lng });
          }
        } else {
          setBakeries([]);
        }
      });
    }
  }, [loading, searchTerm]);

  // 검색어 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchTerm(inputVal + " 베이커리");
    }
  };

  // 선택된 빵집
  const selectedBakery = bakeries.find((b) => b.id === selectedId);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FBF9F5] text-stone-400 font-light tracking-wide">
        공간을 준비하는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FBF9F5] text-stone-700 gap-3">
        <p className="font-medium text-rose-500">지도를 불러오지 못했습니다.</p>
        <p className="text-xs text-stone-400">.env.local 파일의 카카오 자바스크립트 키를 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FBF9F5] font-sans text-stone-800 antialiased selection:bg-stone-200">
      {/* 부드러운 곡선과 블러가 적용된 상단 내비게이션 바 */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-stone-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3 cursor-pointer">
          <span className="text-base font-semibold tracking-[0.2em] text-stone-900">
            MOMENT PASTRY
          </span>
        </div>

        {/* 둥글고 부드러운 검색바 */}
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-stone-100/80 rounded-full py-2.5 px-6 gap-3 w-[420k] w-96 border border-stone-200/50 focus-within:bg-white focus-within:border-stone-300 focus-within:shadow-sm transition-all duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="지역 또는 동 이름을 입력하세요 (예: 성수동, 한남동)"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="outline-none text-xs bg-transparent w-full text-stone-800 placeholder-stone-400 tracking-tight"
          />
        </form>

        <div className="text-[11px] font-medium tracking-[0.15em] text-stone-400 uppercase">
          Curated Archive
        </div>
      </header>

      {/* 메인 스플릿 뷰 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 리스트 영역 (각진 느낌을 없애고 둥근 캡슐/카드 형태 적용) */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-7 bg-[#FBF9F5]">
          {bakeries.map((bakery) => {
            const isSelected = selectedId === bakery.id;
            return (
              <div
                key={bakery.id}
                onClick={() => {
                  setSelectedId(bakery.id);
                  setMapCenter({ lat: bakery.lat, lng: bakery.lng });
                }}
                className={`group cursor-pointer flex flex-col gap-3.5 p-4 rounded-[28px] transition-all duration-500 bg-white border ${
                  isSelected
                    ? "border-stone-400 shadow-lg shadow-stone-200/50 scale-[1.02]"
                    : "border-stone-100 shadow-2xs hover:shadow-md hover:border-stone-200"
                }`}
              >
                {/* 둥근 모서리가 강조된 이미지 프레임 */}
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[20px] bg-stone-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <img
                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80"
                    alt={bakery.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-wide text-stone-700 shadow-xs">
                    {bakery.category}
                  </div>
                </div>

                {/* 텍스트 정보 영역 */}
                <div className="flex flex-col gap-1.5 px-1 pb-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-sm text-stone-900 tracking-tight">
                      {bakery.name}
                    </h3>
                    <span className="text-[11px] text-stone-400 font-light">
                      {bakery.phone}
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs font-light leading-relaxed line-clamp-1">
                    {bakery.roadAddress}
                  </p>
                </div>
              </div>
            );
          })}

          {bakeries.length === 0 && (
            <div className="col-span-2 text-center py-28 text-stone-400 text-xs font-light tracking-wide">
              검색 결과가 없습니다. 다른 지역을 검색해보세요.
            </div>
          )}
        </div>

        {/* 우측: 카카오 맵 영역 (부드러운 모서리와 감성적인 여백) */}
        <div className="hidden lg:block lg:w-1/2 relative border-l border-stone-200/60 bg-stone-100">
          <Map
            center={mapCenter}
            style={{ width: "100%", height: "100%" }}
            level={4}
            onCreate={(map) => setMapInstance(map)}
          >
            {bakeries.map((bakery) => (
              <MapMarker
                key={bakery.id}
                position={{ lat: bakery.lat, lng: bakery.lng }}
                onClick={() => setSelectedId(bakery.id)}
              />
            ))}
          </Map>
        </div>
      </div>
    </div>
  );
}
