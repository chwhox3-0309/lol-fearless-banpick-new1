'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import rawTftData from '@/data/tft-stats.json';

interface TftItem {
  id: string;
  name: string;
  image: string | null;
}

interface TftUnit {
  id: string;
  name: string;
  image?: string;
  tier?: number; // 1, 2, 3성
  items?: TftItem[];
}

interface TftDeck {
  id: string;
  name: string;
  tier: string;
  winRate: number;
  pickRate: number;
  avgPlacement: number;
  traits: string[];
  units?: (string | TftUnit)[];
}

interface RecentWinner {
  matchId: string;
  units: (string | TftUnit)[];
  traits: string[];
  time: string;
}

interface TftStats {
  patchVersion: string;
  lastUpdated: string;
  decks: TftDeck[];
  recentWinners?: RecentWinner[];
}

type SortKey = 'tier' | 'name' | 'winRate' | 'pickRate' | 'avgPlacement';
type SortOrder = 'asc' | 'desc';
type TabType = 'meta' | 'winners';

const TftPage = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('meta');
  const [sortKey, setSortKey] = useState<SortKey>('avgPlacement');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Next.js에서 JSON 임포트 시 타입 단언
  const tftData = rawTftData as TftStats;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 유닛 렌더링 도우미
  const renderUnit = (unit: string | TftUnit, showItems: boolean = false) => {
    const isObject = typeof unit !== 'string';
    const name = isObject ? (unit as TftUnit).name : (unit as string);
    const imageFilename = isObject ? (unit as TftUnit).image : null;
    const tier = isObject ? (unit as TftUnit).tier : 1;
    const items = isObject ? (unit as TftUnit).items : [];
    
    // ddragon URL 구성 (patchVersion 사용)
    const fullVersion = tftData.patchVersion + '.1'; // 간이 버전 구성
    const imageUrl = imageFilename 
      ? `https://ddragon.leagueoflegends.com/cdn/${fullVersion}/img/tft-champion/${imageFilename}` 
      : null;

    // 성급 아이콘 생성 (별 모양)
    const renderStars = () => {
      if (!tier || tier < 1) return null;
      const stars = [];
      for (let i = 0; i < tier; i++) {
        stars.push(
          <span key={i} className={`text-[10px] leading-none ${
            tier === 3 ? 'text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]' : 
            tier === 2 ? 'text-gray-300' : 'text-orange-700'
          }`}>
            ★
          </span>
        );
      }
      return <div className="flex justify-center mt-1 h-3 items-center">{stars}</div>;
    };

    // 아이템 렌더링 (최근 우승 덱 탭에서만 활성화)
    const renderItems = () => {
      if (!showItems) return null;
      
      return (
        <div className="flex justify-center gap-0.5 mt-1 min-h-[16px]">
          {items && items.length > 0 ? (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="w-4 h-4 bg-gray-950 border border-gray-700 rounded-sm overflow-hidden shadow-md group/item relative">
                {item.image ? (
                  <img 
                    src={`https://ddragon.leagueoflegends.com/cdn/${fullVersion}/img/tft-item/${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
                {/* 아이템 툴팁 */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/item:block z-50">
                  <div className="bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded border border-gray-600 whitespace-nowrap shadow-xl">
                    {item.name}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-4 h-4" /> // 아이템이 없어도 높이 유지
          )}
        </div>
      );
    };

    return (
      <div key={name} className="flex flex-col items-center group relative py-1">
        <div className={`w-10 h-10 bg-gray-900 border ${
          tier === 3 ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 
          tier === 2 ? 'border-gray-400' : 'border-blue-900/50'
        } rounded overflow-hidden shadow-lg group-hover:border-blue-400 transition-colors relative`}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className={`w-full h-full object-cover scale-110 ${tier === 3 ? 'brightness-110' : ''}`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold">?</div>
          )}
        </div>
        
        {/* 성급 (이미지 바로 아래) */}
        {renderStars()}
        
        {/* 아이템 (성급 아래) */}
        {renderItems()}

        <span className={`text-[10px] ${tier === 3 ? 'text-yellow-400 font-bold' : 'text-blue-100'} max-w-[50px] truncate text-center leading-tight mt-1`}>
          {name}
        </span>
        
        {/* 유닛 툴팁 효과 */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-950 text-white text-[10px] px-2 py-1 rounded border border-gray-700 whitespace-nowrap shadow-2xl">
            {name} ({tier}성)
          </div>
        </div>
      </div>
    );
  };

  // 정렬 로직
  const sortedDecks = useMemo(() => {
    if (!tftData || !tftData.decks) return [];
    const decks = [...tftData.decks];
    return decks.sort((a, b) => {
      let aValue: string | number = a[sortKey];
      let bValue: string | number = b[sortKey];

      if (sortKey === 'tier') {
        const tierOrder = { 'S': 1, 'A': 2, 'B': 3, 'C': 4 };
        aValue = tierOrder[a.tier as keyof typeof tierOrder] || 99;
        bValue = tierOrder[b.tier as keyof typeof tierOrder] || 99;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tftData, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder(key === 'name' || key === 'tier' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Hydration 오류 방지: 마운트 전에는 로딩 표시
  if (!mounted) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">로딩 중...</div>;
  }

  // 데이터가 없을 경우 처리
  if (!tftData || !tftData.decks) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 pt-24 text-center">
        <h1 className="text-2xl font-bold mb-4">데이터를 불러올 수 없습니다.</h1>
        <Link href="/" className="text-blue-400 hover:underline">홈으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-block mb-6 text-gray-400 hover:text-white transition-colors">
          &larr; LOL 홈으로
        </Link>
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            TFT 메타 트래커
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            최신 챌린저 매치 데이터 기반 실시간 분석
          </p>
          <div className="flex flex-col items-center mt-3">
            <div className="px-4 py-1.5 bg-blue-900/30 border border-blue-500/30 rounded-full">
              <p className="text-blue-400 text-sm font-semibold">
                최종 업데이트: {new Date(tftData.lastUpdated).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-semibold">헤더를 클릭하여 정렬할 수 있습니다.</p>
          </div>
        </header>

        {/* 탭 메뉴 */}
        <div className="flex justify-center mb-8 border-b border-gray-700">
          <button 
            className={`px-8 py-3 font-bold transition-all ${activeTab === 'meta' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => setActiveTab('meta')}
          >
            메타 통계
          </button>
          <button 
            className={`px-8 py-3 font-bold transition-all ${activeTab === 'winners' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => setActiveTab('winners')}
          >
            최근 우승 덱 (10경기)
          </button>
        </div>

        <div className="grid gap-6">
          {activeTab === 'meta' ? (
            <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700/50">
                    <th 
                      className="p-4 font-bold uppercase text-sm text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('tier')}
                    >
                      티어 {getSortIcon('tier')}
                    </th>
                    <th className="p-4 font-bold uppercase text-sm text-gray-300 text-center">핵심 기물 및 시너지</th>
                    <th 
                      className="p-4 font-bold uppercase text-sm text-gray-300 text-center cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('winRate')}
                    >
                      승률 {getSortIcon('winRate')}
                    </th>
                    <th 
                      className="p-4 font-bold uppercase text-sm text-gray-300 text-center cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('pickRate')}
                    >
                      픽률 {getSortIcon('pickRate')}
                    </th>
                    <th 
                      className="p-4 font-bold uppercase text-sm text-gray-300 text-center cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('avgPlacement')}
                    >
                      평균 순위 {getSortIcon('avgPlacement')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDecks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">데이터가 없습니다.</td>
                    </tr>
                  ) : (
                    sortedDecks.map((deck) => (
                      <tr key={deck.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                        <td className="p-4 text-center">
                          <span className={`inline-block w-8 h-8 leading-8 text-center rounded-full font-bold ${
                            deck.tier === 'S' ? 'bg-yellow-500 text-black' : 
                            deck.tier === 'A' ? 'bg-gray-300 text-black' : 'bg-orange-600'
                          }`}>
                            {deck.tier}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-3 items-center">
                            <div className="flex flex-wrap gap-3 justify-center">
                              {deck.units?.map(unit => renderUnit(unit))}
                            </div>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                              {deck.traits.map(trait => (
                                <span key={trait} className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px] text-gray-300 uppercase">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center text-blue-400 font-mono font-bold text-lg">{deck.winRate.toFixed(1)}%</td>
                        <td className="p-4 text-center text-purple-400 font-mono">{deck.pickRate}%</td>
                        <td className="p-4 text-center text-gray-300 font-mono">{deck.avgPlacement}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4">
              {!tftData.recentWinners || tftData.recentWinners.length === 0 ? (
                <div className="bg-gray-800 p-8 text-center rounded-xl text-gray-400">우승 기록이 없습니다.</div>
              ) : (
                tftData.recentWinners.map((winner, index) => (
                  <div key={`${winner.matchId}-${index}`} className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col gap-4 hover:border-blue-500/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold uppercase shadow-[0_0_10px_rgba(234,179,8,0.3)]">1st Place</span>
                        <span className="text-gray-500 text-xs">{winner.time}</span>
                      </div>
                      <span className="text-xs text-gray-600 font-mono">{winner.matchId}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-4">
                        {winner.units.map(unit => renderUnit(unit, true))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {winner.traits.map(trait => (
                          <span key={trait} className="px-2 py-0.5 bg-gray-900 border border-gray-600 rounded text-[10px] text-gray-400 uppercase">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <p className="text-center text-gray-500 text-sm mt-4 italic">※ 챌린저 상위 유저들의 실제 매치에서 1위를 차지한 최종 스쿼드입니다.</p>
            </div>
          )}
        </div>

        <section className="mt-12 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">데이터 분석 안내</h2>
          <p className="text-gray-300 leading-relaxed">
            위 데이터는 한국 서버 챌린저 상위 유저들의 최근 매치 기록을 실시간으로 분석한 결과입니다. 
            시너지 조합의 완성도와 최종 순위를 기반으로 성능을 측정하며, <strong>평균 순위가 낮을수록(1위에 가까울수록)</strong> 강력한 덱으로 간주됩니다.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TftPage;