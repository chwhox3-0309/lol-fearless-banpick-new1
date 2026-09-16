'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 챔피언 비용별 테두리 색상 매핑
const COST_BORDER_COLORS: Record<number, string> = {
  1: 'border-slate-500',
  2: 'border-emerald-500',
  3: 'border-blue-500',
  4: 'border-purple-500',
  5: 'border-amber-400',
};

interface DeckPost {
  id: number;
  season?: string;
  tier?: string;
  comp_name?: string;
  key_champions?: string;
  traits?: string; // 시너지 정보 컬럼 (선택)
}

export default function TftMainPage() {
  const [decks, setDecks] = DeckState();
  const [championMap, setChampionMap] = useState<Record<string, { name: string; iconUrl: string }>>({});
  const [traitMap, setTraitMap] = useState<Record<string, { name: string; iconUrl: string }>>({});
  const [loading, setLoading] = useState(true);

  // 1. 데이터 불러오기 (Supabase DB + Riot DDragon 챔피언/시너지 데이터)
  useEffect(() => {
    async function loadData() {
      try {
        // Supabase 덱 목록 조회
        const { data: dbDecks, error } = await supabase
          .from('tft_posts')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.error('DB 로드 에러:', error);
        } else if (dbDecks) {
          setDecks(dbDecks);
        }

        // 라이엇 데이터 드래곤 (최신 버전 정보 획득)
        const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionRes.json();
        const ver = versions[0] || '14.24.1';

        // 챔피언 매핑 데이터 로드
        const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/tft-champion.json`);
        const champData = await champRes.json();
        const newChampMap: Record<string, { name: string; iconUrl: string }> = {};

        if (champData?.data) {
          Object.values(champData.data).forEach((champ: any) => {
            const rawId = champ.id || '';
            const cleanedId = rawId.replace('TFT13_', '').replace('TFT_', '').toLowerCase();
            const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/tft-champion/${champ.image?.full || `${rawId}.png`}`;
            
            newChampMap[cleanedId] = { name: champ.name, iconUrl: imgUrl };
            newChampMap[rawId.toLowerCase()] = { name: champ.name, iconUrl: imgUrl };
          });
        }
        setChampionMap(newChampMap);

        // 시너지(특성) 매핑 데이터 로드
        const traitRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/tft-trait.json`);
        const traitData = await traitRes.json();
        const newTraitMap: Record<string, { name: string; iconUrl: string }> = {};

        if (traitData?.data) {
          Object.values(traitData.data).forEach((trait: any) => {
            const rawId = trait.id || '';
            const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/tft-trait/${trait.image?.full || `${rawId}.png`}`;
            newTraitMap[rawId.toLowerCase()] = { name: trait.name, iconUrl: imgUrl };
          });
        }
        setTraitMap(newTraitMap);

      } catch (err) {
        console.error('초기화 에러:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 챔피언 문자열 파싱 함수
  const parseChampions = (keyChampionsStr?: string) => {
    if (!keyChampionsStr) return [];
    return String(keyChampionsStr)
      .split(/[,;\n/]+/)
      .map((c) => c.trim())
      .filter(Boolean);
  };

  const getChampionInfo = (champRaw: string) => {
    const cleanKey = champRaw.replace('TFT13_', '').replace('TFT_', '').toLowerCase();
    const info = championMap[cleanKey] || championMap[champRaw.toLowerCase()];
    return {
      displayName: info?.name || champRaw.replace('TFT13_', ''),
      imageUrl: info?.iconUrl || 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#13141a] text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">메타 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13141a] text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 상단 타이틀 및 탭 메뉴 영역 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#282a32] pb-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">TFT 천상계 메타 덱</h1>
            <p className="text-xs text-slate-400 mt-0.5">실시간 천상계 매치 데이터 기반 조합 분석</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#1b1c22] p-1 rounded-xl border border-[#282a32]">
            <button className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold shadow">메타 덱</button>
          </div>
        </div>

        {/* 덱 카드 리스트 컨테이너 */}
        <div className="space-y-3">
          {decks.length === 0 ? (
            <div className="text-center py-20 bg-[#1b1c22] border border-[#282a32] rounded-xl">
              <p className="text-sm text-slate-400">등록된 덱 데이터가 없습니다.</p>
            </div>
          ) : (
            decks.map((deck) => {
              const champions = parseChampions(deck.key_champions);
              const tierText = deck.tier || '1티어';
              const isShort = tierText.length <= 3;
              const title = deck.comp_name || '추천 조합';

              return (
                <Link
                  key={deck.id}
                  href={`/tft/${deck.id}`}
                  className="block bg-[#1b1c22] hover:bg-[#20222a] border border-[#282a32] border-l-4 border-l-red-500 rounded-xl p-5 transition shadow-lg group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    
                    {/* 카드 상단: 티어 뱃지 & 덱 이름 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-md bg-red-500/20 text-red-400 font-black text-xs flex items-center justify-center border border-red-500/40 shrink-0 ${
                          isShort ? 'w-6 h-6' : 'px-2 py-0.5'
                        }`}>
                          {tierText}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition">
                          {title}
                        </h3>
                      </div>
                    </div>

                    {/* 챔피언 초상화 목록 */}
                    <div className="flex flex-wrap items-end gap-2 pt-1 max-w-full">
                      {champions.map((champRaw: string, idx: number) => {
                        const { displayName, imageUrl } = getChampionInfo(champRaw);
                        const isCarry = idx < 2; // 상위 2개 기물 핵심 캐리 표시
                        const costBorder = COST_BORDER_COLORS[(idx % 5) + 1] || 'border-slate-500';

                        return (
                          <div key={idx} className="flex flex-col items-center shrink-0">
                            {/* 캐리 기물 별표 */}
                            <div className="h-3 text-[9px] text-cyan-400 font-bold tracking-tighter">
                              {isCarry ? '★★★' : ''}
                            </div>

                            {/* 초상화 이미지 */}
                            <div
                              className={`relative w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden border-2 ${costBorder} bg-slate-950 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center`}
                            >
                              <img
                                src={imageUrl}
                                alt={displayName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png';
                                }}
                              />
                            </div>

                            {/* 아이템 슬롯 뱃지 (캐리 유닛만) */}
                            {isCarry ? (
                              <div className="flex -mt-2 z-10 gap-0.5">
                                <div className="w-3 h-3 bg-amber-500 border border-slate-900 rounded-xs" />
                                <div className="w-3 h-3 bg-blue-500 border border-slate-900 rounded-xs" />
                                <div className="w-3 h-3 bg-purple-500 border border-slate-900 rounded-xs" />
                              </div>
                            ) : (
                              <div className="h-1" />
                            )}

                            {/* 한글 이름 */}
                            <span className="text-[10px] text-slate-400 mt-1 max-w-[44px] truncate text-center">
                              {displayName}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* 하단 시너지 영역 */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#282a32]/60">
                      <span className="text-[10px] text-slate-500 font-semibold mr-1">주요 특성:</span>
                      {champions.slice(0, 3).map((champRaw: string, tIdx: number) => {
                        // 예시 시너지 매핑 표현 (필요시 DB 트레이트 데이터와 연동 가능)
                        const sampleTraits = ['Set13_Fighter', 'Set13_Sorcerer', 'Set13_Visionary'];
                        const traitKey = sampleTraits[tIdx % sampleTraits.length];
                        const traitInfo = traitMap[traitKey.toLowerCase()] || { name: '시너지', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png' };

                        return (
                          <div key={tIdx} className="flex items-center gap-1 bg-[#242630] border border-[#333745] px-2 py-0.5 rounded-md">
                            <img src={traitInfo.iconUrl} alt={traitInfo.name} className="w-3.5 h-3.5 object-contain" />
                            <span className="text-[10px] text-slate-300 font-medium">{traitInfo.name}</span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

// 상태 타입 유틸 (간이 선언)
function DeckState(): [DeckPost[], React.Dispatch<React.SetStateAction<DeckPost[]>>] {
  return useState<DeckPost[]>([]);
}
