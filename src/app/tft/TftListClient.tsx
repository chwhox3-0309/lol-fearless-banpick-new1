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

// 라이엇 내부 코드(DA_18_Yorick, DA_Karma18_AD 등)를 표준 챔피언명으로 정제
function parseChampionName(rawName: string): { cleanName: string; displayName: string } {
  if (!rawName) return { cleanName: '', displayName: '' };

  let name = rawName.trim();
  
  // 1. DA_18_, DA_, TFT13_, TFT_ 등의 접두사 제거
  name = name
    .replace(/^DA_\d+_?/i, '')
    .replace(/^DA_/i, '')
    .replace(/^TFT\d+_?/i, '')
    .replace(/^TFT_/i, '');

  // 2. trailing 숫자(18) 및 _AD, _AP 등 접미사 제거
  name = name
    .replace(/\d+$/g, '')
    .replace(/_(AD|AP|Tank|Carry)$/i, '');

  // 첫 글자 대문자화 (Data Dragon URL 대응)
  const cleanName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    cleanName,
    displayName: cleanName,
  };
}

export default function TftListClient({ initialItems }: { initialItems: TftMetaItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 챔피언 이미지 URL 생성
  const getChampionImageUrl = (cleanName: string) => {
    if (!cleanName) return '';
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${cleanName}.png`;
  };

  // 티어별 배지 컬러
  const getTierBadgeStyle = (tier: string) => {
    if (tier?.includes('1')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (tier?.includes('2')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (tier?.includes('3')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

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
          placeholder="덱 이름, 챔피언명(예: Karma, Yorick)으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-4 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-lg"
        />
        <svg
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
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
          const rawChamps = item.key_champions ? item.key_champions.split(',') : [];
          const parsedChamps = rawChamps.map(parseChampionName).filter((c) => c.cleanName !== '');

          // 정제된 이름 기반으로 카드 타이틀 재생성
          const displayTitle =
            parsedChamps.length > 0
              ? `${parsedChamps.slice(0, 3).map((c) => c.displayName).join(' ')} 덱`
              : item.comp_name;

          return (
            <Link
              key={item.id}
              href={`/tft/${item.id}`}
              className="group relative bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-5 hover:border-indigo-500/60 hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="space-y-4 min-w-0">
                {/* 상단 뱃지 영역 */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/50">
                    {item.season || '시즌 13'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getTierBadgeStyle(item.tier)}`}>
                    {item.tier || '1티어'}
                  </span>
                </div>

                {/* 타이틀 (말줄임표 및 정제된 이름 적용) */}
                <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                  {displayTitle}
                </h2>

                {/* 핵심 챔피언 썸네일 그리드 (줄바꿈 방지 및 오버플로우 보정) */}
                <div className="flex flex-wrap gap-2 pt-1 max-w-full">
                  {parsedChamps.slice(0, 5).map((champ, idx) => {
                    const imgUrl = getChampionImageUrl(champ.cleanName);

                    return (
                      <div key={idx} className="flex flex-col items-center space-y-1">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-800 shadow-md flex-shrink-0 group/img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={champ.displayName}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              // 이미지 로드 실패 시 텍스트 배지로 대체
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'text-[10px]', 'font-bold', 'text-slate-400');
                                target.parentElement.innerText = champ.displayName.slice(0, 3);
                              }
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 max-w-[46px] truncate text-center">
                          {champ.displayName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 추천 아이템 */}
                <div className="text-xs text-slate-300 bg-slate-950/50 border border-slate-800/60 rounded-xl p-3">
                  <span className="text-slate-400 font-semibold block mb-0.5">추천 아이템</span>
                  <span className="text-slate-200">{item.items}</span>
                </div>
              </div>

              {/* 하단 화살표 링크 */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold group-hover:text-indigo-300">
                <span>상세 공략 및 배치도</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
          검색 결과에 해당하는 메타 덱이 없습니다.
        </div>
      )}
    </div>
  );
}
