"use client";

import React, { useState } from "react";

// 임시 베이커리 데이터
const DUMMY_BAKERIES = [
  {
    id: 1,
    name: "아틀리에 폰테",
    category: "아르장 사워도우 · 베이커리",
    address: "서울 성동구 서울숲길 1",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "메종 드 르반",
    category: "프렌치 크루아상 전문점",
    address: "서울 강남구 도산대로 123",
    rating: 4.8,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    name: "오브 베이크샵",
    category: "컨템포러리 디저트 카페",
    address: "서울 마포구 연남로 45",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=800&auto=format&fit=crop&q=80",
  },
];

export default function BakeryApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredBakeries = DUMMY_BAKERIES.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-stone-900">
      {/* 1. 상단 내비게이션 */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3 cursor-pointer">
          <span className="text-lg font-semibold tracking-wider text-stone-900">
            MOMENT PASTRY
          </span>
        </div>

        {/* 미니멀한 검색 바 */}
        <div className="flex items-center bg-stone-100 rounded-full py-2.5 px-5 shadow-inner gap-3 w-96 border border-stone-200/60 focus-within:bg-white focus-within:border-stone-400 transition-all">
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
            placeholder="지역 또는 베이커리 이름 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm bg-transparent w-full text-stone-800 placeholder-stone-400"
          />
        </div>

        <div className="text-xs font-medium tracking-widest text-stone-500 uppercase cursor-pointer hover:text-stone-900 transition">
          Curated Archive
        </div>
      </header>

      {/* 2. 메인 컨텐츠 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 리스트 영역 */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-stone-50">
          {filteredBakeries.map((bakery) => (
            <div
              key={bakery.id}
              onClick={() => setSelectedId(bakery.id)}
              className={`group cursor-pointer flex flex-col gap-3 transition-all duration-300 ${
                selectedId === bakery.id ? "opacity-100 scale-[1.02]" : "opacity-90 hover:opacity-100"
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-200 shadow-sm">
                <img
                  src={bakery.image}
                  alt={bakery.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-500 ease-out"
                />
              </div>
              <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-base text-stone-900 tracking-tight">
                    {bakery.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-stone-700">
                    <span className="text-amber-600">★</span>
                    <span>{bakery.rating}</span>
                  </div>
                </div>
                <p className="text-stone-500 text-xs">{bakery.category}</p>
                <p className="text-stone-400 text-xs">{bakery.address}</p>
              </div>
            </div>
          ))}
          {filteredBakeries.length === 0 && (
            <div className="col-span-2 text-center py-20 text-stone-400 text-sm">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* 우측: 지도 영역 */}
        <div className="hidden lg:block lg:w-1/2 bg-stone-100 relative border-l border-stone-200">
          <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm font-light tracking-wide">
            Interactive Map Area
          </div>
        </div>
      </div>
    </div>
  );
}
