// src/app/tft/TftListClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TftMetaItem {
  id: number;
  season: string;
  tier: string;
  comp_name: string;
  key_champions: string;
  items: string;
  description: string;
}

export default function TftListClient({ initialItems }: { initialItems: TftMetaItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 라이엇 Data Dragon CDN URL 생성 (챔피언 초상화)
  const getChampionImageUrl = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return '';
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${formattedName}.png`;
  };

  // 실시간 필터링 (덱 이름, 챔피언, 티어)
  const filteredItems = initialItems.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.comp_name.toLowerCase().includes(query) ||
      item.key_champions.toLowerCase().includes(query) ||
      item.tier.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* 검색 입력창 */}
      <div className="relative">
        <input
          type="text"
          placeholder="덱 이름, 핵심 챔피언(예: Akali, Kaisa)으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 pl-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-lg"
        />
        <svg
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* 덱 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const champions = item.key_champions ? item.key_champions.split(',') : [];

          return (
            <Link
              key={item.id}
              href={`/tft/${item.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                    {item.season}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                    {item.tier || '1티어'}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {item.comp_name}
                </h2>

                {/* 대표 챔피언 썸네일 아바타 영역 */}
                <div className="flex items-center gap-2 pt-1">
                  {champions.map((champ, idx) => {
                    const champName = champ.trim();
                    const imgUrl = getChampionImageUrl(champName);

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-700 bg-gray-800 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={champName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 max-w-[48px] truncate text-center">
                          {champName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-300">
                  <strong className="text-gray-400">추천 아이템:</strong> {item.items}
                </p>
              </div>

              {item.description && (
                <div className="bg-gray-950 border border-gray-800/80 rounded-xl p-3 text-xs text-gray-400 line-clamp-2">
                  💡 {item.description}
                </div>
              )}

              <span className="text-xs text-indigo-400 font-bold flex items-center justify-end gap-1 pt-2">
                상세 공략 및 배치도 보기 &rarr;
              </span>
            </Link>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800">
          검색 결과에 해당하는 TFT 메타 덱이 없습니다.
        </div>
      )}
    </div>
  );
}
