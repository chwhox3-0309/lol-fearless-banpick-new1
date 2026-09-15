// src/app/tft/[id]/TftBoardClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TftPostDetail {
  id: number;
  season: string;
  tier: string;
  comp_name: string;
  key_champions: string;
  items: string;
  description: string;
}

// 라이엇 유닛 ID(DA_18_Yorick 등)를 DDragon 챔피언명으로 정제
function parseChampionName(rawName: string): { cleanName: string; displayName: string } {
  if (!rawName) return { cleanName: '', displayName: '' };

  let name = rawName.trim();
  name = name
    .replace(/^DA_\d+_?/i, '')
    .replace(/^DA_/i, '')
    .replace(/^TFT\d+_?/i, '')
    .replace(/^TFT_/i, '');

  name = name
    .replace(/\d+$/g, '')
    .replace(/_(AD|AP|Tank|Carry)$/i, '');

  const cleanName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    cleanName,
    displayName: cleanName,
  };
}

// 28칸 전장 기본 배치 포지션 (0~6: 1열 전방, 21~27: 4열 후방)
const DEFAULT_POSITIONS = [2, 4, 24, 22, 10, 18, 1, 5];

export default function TftBoardClient({ post }: { post: TftPostDetail }) {
  const [activeChamp, setActiveChamp] = useState<string | null>(null);

  const rawChamps = post.key_champions ? post.key_champions.split(',') : [];
  const parsedChamps = rawChamps.map(parseChampionName).filter((c) => c.cleanName !== '');

  const itemsList = post.items ? post.items.split(',').map((i) => i.trim()) : [];

  // 28칸 타일 맵 생성 (챔피언 배치 매핑)
  const boardTiles = Array.from({ length: 28 }, (_, index) => {
    const champIdx = DEFAULT_POSITIONS.indexOf(index);
    if (champIdx !== -1 && parsedChamps[champIdx]) {
      return {
        slotIndex: index,
        champion: parsedChamps[champIdx],
        isCarry: champIdx === 0 || champIdx === 3,
      };
    }
    return { slotIndex: index, champion: null, isCarry: false };
  });

  const getChampionImageUrl = (cleanName: string) => {
    if (!cleanName) return '';
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${cleanName}.png`;
  };

  return (
    <div className="space-y-8">
      {/* 뒤로 가기 및 상단 헤더 */}
      <div className="flex items-center justify-between">
        <Link
          href="/tft"
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-colors"
        >
          &larr; TFT 메타 덱 목록으로
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
            {post.season || '시즌 13'}
          </span>
          <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg">
            {post.tier || '1티어'}
          </span>
        </div>
      </div>

      {/* 덱 제목 및 개요 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {parsedChamps.slice(0, 3).map((c) => c.displayName).join(' ') || post.comp_name} 덱
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          {post.description || '라이엇 천상계 매치 데이터를 기반으로 자동 분석된 최신 추천 메타 배치입니다.'}
        </p>
      </div>

      {/* TFT 28칸 전장 배치도 (Hex Grid) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              전장 추천 배치도 (4 x 7)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">상단(전방 탱커) / 하단(후방 딜러)</p>
          </div>
          {activeChamp && (
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
              선택된 챔피언: {activeChamp}
            </span>
          )}
        </div>

        {/* 28칸 보드 그리드 */}
        <div className="flex flex-col items-center justify-center py-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 md:gap-3 min-w-[340px]">
            {boardTiles.map((tile, idx) => {
              const rowIndex = Math.floor(idx / 7);
              // 지그재그 hexagonal 느낌을 위한 행별 오프셋
              const isEvenRow = rowIndex % 2 === 1;

              return (
                <div
                  key={idx}
                  onClick={() => tile.champion && setActiveChamp(tile.champion.displayName)}
                  className={`relative w-11 h-11 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                    isEvenRow ? 'translate-x-2 md:translate-x-3' : ''
                  } ${
                    tile.champion
                      ? tile.isCarry
                        ? 'border-amber-500/80 bg-amber-950/30 shadow-lg shadow-amber-500/10 hover:scale-105'
                        : 'border-indigo-500/80 bg-indigo-950/30 shadow-lg shadow-indigo-500/10 hover:scale-105'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  {tile.champion ? (
                    <div className="relative w-full h-full p-1 flex flex-col items-center justify-center">
                      <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getChampionImageUrl(tile.champion.cleanName)}
                          alt={tile.champion.displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'text-[10px]', 'font-bold', 'text-slate-300');
                              target.parentElement.innerText = tile.champion?.displayName.slice(0, 3) || '';
                            }
                          }}
                        />
                      </div>
                      <span className="absolute -bottom-1.5 bg-slate-950/90 text-white text-[9px] font-bold px-1 rounded border border-slate-700 truncate max-w-full">
                        {tile.champion.displayName}
                      </span>
                    </div>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 핵심 챔피언 및 추천 아이템 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 핵심 챔피언 목록 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">주요 챔피언 구성</h3>
          <div className="grid grid-cols-2 gap-3">
            {parsedChamps.map((champ, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getChampionImageUrl(champ.cleanName)}
                    alt={champ.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'text-xs', 'font-bold', 'text-slate-300');
                        target.parentElement.innerText = champ.displayName.slice(0, 2);
                      }
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{champ.displayName}</p>
                  <span className="text-[10px] text-slate-500">
                    {idx === 0 ? '핵심 캐리' : idx === 1 ? '메인 탱커' : '서브 기물'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 아이템 빌드 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">추천 아이템 빌드</h3>
          <div className="flex flex-wrap gap-2">
            {itemsList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs font-medium text-indigo-200"
              >
                <span>⚔️</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">💡 초반 운영 팁</p>
            <p>메인 딜러 아이템 조합을 우선 완성 후 2성 탱커에 방어 아이템을 채워주는 빌드업을 추천합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
