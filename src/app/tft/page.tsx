'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// 챔피언 한글명 매핑
const CHAMPION_KO_MAP: Record<string, string> = {
  Rakan: '라칸', Rammus: '람머스', Rengar: '렝가', Vi: '바이', Tristana: '트리스티나',
  Lillia: '릴리아', Sivir: '시비르', Gnar: '나르', Ashe: '애쉬', Alistar: '알리스타',
  Amumu: '아무무', Ezreal: '이즈리얼', Draven: '드레이븐', Maokai: '마오카이',
  Ivern: '아이번', Kennen: '케넨', Taric: '타릭', Talon: '탈론', Ahri: '아리',
  Akali: '아칼리', Jinx: '징크스', LeeSin: '리 신', Lulu: '룰루', Lux: '럭스',
  Morgana: '모르가나', Poppy: '뽀삐', Pyke: '파이크', Sett: '세트', Shen: '쉔',
  Teemo: '티모', Veigar: '베이가', Zed: '제드', Zoe: '조이',
};

// 코스트별 테두리 색상
const COST_BORDER_COLORS: Record<number, string> = {
  1: 'border-slate-400',
  2: 'border-emerald-500',
  3: 'border-blue-500',
  4: 'border-purple-500',
  5: 'border-amber-400',
};

interface DeckItem {
  id: string;
  tier: string; // 'S', 'A', 'B'
  comp_name: string;
  traits?: string[]; // 시너지 리스트
  key_champions: string; // "DA_18_Kennen, DA_18_ElderDragon, ..."
  avg_rank?: string;
  pick_rate?: string;
  win_rate?: string;
  top4_rate?: string;
  team_code?: string;
}

export default function TftMetaListPage() {
  const [activeTab, setActiveTab] = useState<'recommended' | 'stats' | 'recent'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDecks() {
      const supabase = getSupabase();
      if (!supabase) {
        // Supabase 연동 전 시뮬레이션용 데이터
        setDecks(MOCK_DECKS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from('tft_posts').select('*');
      if (error || !data || data.length === 0) {
        setDecks(MOCK_DECKS);
      } else {
        setDecks(data);
      }
      setLoading(false);
    }

    fetchDecks();
  }, []);

  // 챔피언 이름 및 이미지 URL 정제
  const parseChampion = (rawChampId: string) => {
    let cleanName = rawChampId
      .trim()
      .replace(/^(TFT|TDA|DA|Set)?_?\d*_?/i, '')
      .replace(/\d+$/, '');

    if (cleanName.length > 0) {
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }

    const displayName = CHAMPION_KO_MAP[cleanName] || cleanName || rawChampId;
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${cleanName}.png`;

    return { cleanName, displayName, imageUrl };
  };

  // 팀 코드 복사
  const handleCopyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code || 'TFT_Deck_Code_Example');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 검색 필터링
  const filteredDecks = decks.filter((deck) =>
    deck.comp_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.key_champions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121318] text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. 상단 탭 네비게이션 */}
        <div className="flex justify-center my-4">
          <div className="bg-[#1b1c22] p-1.5 rounded-full inline-flex gap-1 border border-[#282a32] shadow-inner">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'recommended'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              추천 메타
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              메타 통계
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'recent'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              최근 1위 덱
            </button>
          </div>
        </div>

        {/* 2. 필터 드롭다운 & 검색바 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select className="bg-[#1f2128] border border-[#2d303b] text-slate-200 px-3 py-2 rounded-lg font-medium outline-none focus:border-blue-500">
              <option>최근 2일 (18.2)</option>
              <option>최근 7일</option>
            </select>
            <select className="bg-[#1f2128] border border-[#2d303b] text-slate-200 px-3 py-2 rounded-lg font-medium outline-none focus:border-blue-500">
              <option>평균 등수</option>
              <option>승률순</option>
              <option>픽률순</option>
            </select>
            <select className="bg-[#1f2128] border border-[#2d303b] text-slate-200 px-3 py-2 rounded-lg font-medium outline-none focus:border-blue-500">
              <option>🔮 마스터+</option>
              <option>💎 다이아+</option>
              <option>🥇 플래티넘+</option>
            </select>
            <span className="text-[#62687a] text-[11px] ml-1">최종 업데이트: 7분 전</span>
          </div>

          {/* 검색창 */}
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="챔피언, 시너지 검색"
              className="w-full bg-[#1b1c22] border border-[#2d303b] focus:border-amber-500/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        {/* 3. 메타 덱 리스트 영역 */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-20 text-slate-500 text-sm">덱 정보를 불러오는 중입니다...</div>
          ) : filteredDecks.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">검색 결과가 없습니다.</div>
          ) : (
            filteredDecks.map((deck) => {
              const champions = deck.key_champions.split(',').map((c) => c.trim()).filter(Boolean);
              const tierColor =
                deck.tier === 'S' ? 'border-l-red-500' : deck.tier === 'A' ? 'border-l-blue-500' : 'border-l-slate-600';

              return (
                <Link
                  key={deck.id}
                  href={`/tft/${deck.id}`}
                  className={`block bg-[#1b1c22] hover:bg-[#20222a] border border-[#282a32] border-l-4 ${tierColor} rounded-xl p-4 transition shadow-lg group relative overflow-hidden`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* 좌측: 티어, 덱 이름, 시너지 & 챔피언 목록 */}
                    <div className="space-y-3 flex-1 w-full">
                      {/* 카드 상단: 티어 & 제목 & 우측 기능버튼 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-black text-xs flex items-center justify-center border border-red-500/40">
                            {deck.tier || 'S'}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition">
                            {deck.comp_name}
                          </h3>
                        </div>

                        {/* 우측 상단 팀 코드 복사 버튼 */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleCopyCode(deck.team_code || '', deck.id, e)}
                            className="bg-[#242630] hover:bg-[#2e313e] text-[11px] font-semibold text-slate-300 px-2.5 py-1 rounded border border-[#333745] flex items-center gap-1 transition"
                          >
                            📋 {copiedId === deck.id ? '복사됨!' : '팀 코드 복사'}
                          </button>
                          <button className="bg-[#242630] hover:bg-[#2e313e] p-1.5 rounded border border-[#333745] text-slate-400 hover:text-slate-200 transition">
                            🛒
                          </button>
                        </div>
                      </div>

                      {/* 챔피언 라인업 & 시너지 */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {/* 챔피언 초상화 스쿼드 */}
                        <div className="flex flex-wrap items-end gap-1.5">
                          {champions.map((champRaw, idx) => {
                            const { displayName, imageUrl } = parseChampion(champRaw);
                            const isThreeStar = idx >= 1 && idx <= 4; // 시뮬레이션용 3성 표시
                            const costBorder = COST_BORDER_COLORS[(idx % 5) + 1] || 'border-slate-500';

                            return (
                              <div key={idx} className="flex flex-col items-center">
                                {/* 별표 (3성인 경우) */}
                                <div className="h-3 text-[9px] text-cyan-400 font-bold tracking-tighter">
                                  {isThreeStar ? '★★★' : ''}
                                </div>

                                {/* 초상화 박스 */}
                                <div
                                  className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 ${costBorder} bg-slate-900 shadow-md group-hover:scale-105 transition-transform`}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* 착용 아이템 예시 (하단 중첩 아이콘) */}
                                {idx === 1 || idx === 3 ? (
                                  <div className="flex -mt-2.5 z-10 gap-0.5">
                                    <div className="w-3.5 h-3.5 bg-amber-500 border border-slate-900 rounded-sm shadow-sm" />
                                    <div className="w-3.5 h-3.5 bg-blue-500 border border-slate-900 rounded-sm shadow-sm" />
                                    <div className="w-3.5 h-3.5 bg-purple-500 border border-slate-900 rounded-sm shadow-sm" />
                                  </div>
                                ) : (
                                  <div className="h-1.5" />
                                )}

                                {/* 한글 이름 */}
                                <span className="text-[10px] text-slate-400 mt-0.5 max-w-[44px] truncate text-center">
                                  {displayName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 우측: 통계 지표 4개 (평균 등수, 픽률, 승률, TOP 4) */}
                    <div className="w-full lg:w-auto border-t lg:border-t-0 border-[#282a32] pt-3 lg:pt-0">
                      <div className="grid grid-cols-4 gap-4 md:gap-6 text-center items-center px-2 min-w-[260px]">
                        <div>
                          <div className="text-sm md:text-base font-black text-red-400">
                            {deck.avg_rank || '#3.95'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">평균 등수</div>
                        </div>
                        <div>
                          <div className="text-xs md:text-sm font-bold text-slate-200">
                            {deck.pick_rate || '0.10'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">픽률</div>
                        </div>
                        <div>
                          <div className="text-xs md:text-sm font-bold text-slate-200">
                            {deck.win_rate || '22.9%'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">승률</div>
                        </div>
                        <div>
                          <div className="text-xs md:text-sm font-bold text-slate-200">
                            {deck.top4_rate || '59.2%'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">TOP 4</div>
                        </div>
                      </div>
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

// Supabase 데이터가 아직 없을 때 보여줄 샘플 데이터
const MOCK_DECKS: DeckItem[] = [
  {
    id: '1',
    tier: 'S',
    comp_name: '[상징] 요정 트리스타나',
    key_champions: 'Rakan, Rammus, Rengar, Vi, Tristana, Lillia, Sivir, Gnar, Ashe',
    avg_rank: '#3.95',
    pick_rate: '0.10',
    win_rate: '22.9%',
    top4_rate: '59.2%',
    team_code: '0x01_TFT_Fairy_Tristana_Build_Code',
  },
  {
    id: '2',
    tier: 'S',
    comp_name: '고밸류 드레이븐 이즈리얼',
    key_champions: 'Alistar, Amumu, Ezreal, Gnar, Draven, Maokai, Ivern, Kennen, Taric',
    avg_rank: '#4.07',
    pick_rate: '0.70',
    win_rate: '25.6%',
    top4_rate: '54.4%',
    team_code: '0x02_TFT_HighValue_Draven_Ezreal_Code',
  },
];
