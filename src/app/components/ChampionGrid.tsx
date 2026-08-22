'use client';

import React, { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { useDraft } from '../context/DraftContext';
import { getChampionThumbnailUrl } from '@/lib/riot-api';

export default function ChampionGrid() {
  const {
    version,
    searchTerm,
    setSearchTerm,
    filteredChampions,
    getAllSelectedChampions,
    handleChampionClick,
  } = useDraft();

  // 스크롤 위치를 기억하기 위한 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // 리렌더링 되기 직전/직후에 스크롤 위치 복원
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  });

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  };

  const handleClick = (championId: string) => {
    // 클릭 직전 현재 스크롤 위치 저장
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
    handleChampionClick(championId);
  };

  return (
    <div className="bg-gray-900/90 rounded-xl border border-gray-800 p-3.5 flex flex-col h-full space-y-3">
      {/* 검색창 */}
      <div className="flex justify-end items-center">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="챔피언 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 챔피언 그리드 (스크롤 이벤트 및 ref 연결) */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2 overflow-y-auto max-h-[480px] p-1 custom-scrollbar"
      >
        {filteredChampions.map((champion) => {
          const isSelected = getAllSelectedChampions.includes(champion.id);

          return (
            <button
              key={champion.id}
              onClick={() => handleClick(champion.id)}
              disabled={isSelected}
              className={`group relative flex flex-col items-center rounded-lg p-1.5 transition-all ${
                isSelected
                  ? 'opacity-30 grayscale cursor-not-allowed'
                  : 'hover:bg-gray-800 hover:scale-105 active:scale-95'
              }`}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-700/60 group-hover:border-blue-400 transition-colors">
                {version && (
                  <Image
                    src={getChampionThumbnailUrl(version, champion.id)}
                    alt={champion.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-300 mt-1 truncate w-full text-center group-hover:text-white">
                {champion.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
