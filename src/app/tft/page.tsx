'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// 특수/TFT 챔피언명 교정 매핑
const CHAMPION_NAME_FIXES: Record<string, string> = {
  GnarSmall: 'Gnar',
  ElderDragon: 'Shyvana', // 라이엇 CDN에 ElderDragon 이미지가 없어 드래곤 계열 기물로 대체
  Draven18: 'Draven',
};

// 챔피언 한글명 매핑
const CHAMPION_KO_MAP: Record<string, string> = {
  Kennen: '케넨', ElderDragon: '장로 드래곤', Maokai: '마오카이', Draven: '드레이븐',
  Ivern: '아이번', Gnar: '나르', GnarSmall: '나르', Ashe: '애쉬', Sett: '세트',
  Ahri: '아리', Zyra: '자이라', Rakan: '라칸', Rammus: '람머스', Rengar: '렝가',
  Vi: '바이', Tristana: '트리스티나', Lillia: '릴리아', Sivir: '시비르', Alistar: '알리스타',
  Amumu: '아무무', Ezreal: '이즈리얼', Taric: '타릭', Talon: '탈론', Akali: '아칼리',
  Jinx: '징크스', LeeSin: '리 신', Lulu: '룰루', Lux: '럭스', Morgana: '모르가나',
  Poppy: '뽀삐', Pyke: '파이크', Shen: '쉔', Teemo: '티모', Veigar: '베이가',
  Zed: '제드', Zoe: '조이',
};

// 코스트별 테두리 색상
const COST_BORDER_COLORS: Record<number, string> = {
  1: 'border-slate-400',
  2: 'border-emerald-500',
  3: 'border-blue-500',
  4: 'border-purple-500',
  5: 'border-amber-400',
};

export default function TftMetaListPage() {
  const [activeTab, setActiveTab] = useState<'recommended' | 'stats' | 'recent'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDecks() {
      const supabase = getSupabase();
      if (!supabase) {
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

  // 챔피언 문자열 정제 및 데이터 추출
  const parseChampion = (rawChampId: string) => {
    let cleanName = rawChampId
      .trim()
      .replace(/^(TFT|TDA|DA|Set)?_?\d*_?/i, '')
      .replace(/\d+$/, '');

    if (cleanName.length > 0) {
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }

    // 이름 예외 교정
    const fixedName = CHAMPION_NAME_FIXES[cleanName] || cleanName;
    const displayName = CHAMPION_KO_MAP[cleanName] || CHAMPION_KO_MAP[fixedName] || cleanName || rawChampId;
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${fixedName}.png`;

    return { cleanName, displayName, imageUrl };
  };

  // DB의 챔피언 컬럼 파싱 (쉼표, 세미콜론, 공백 모두 지원)
  const getChampionList = (deck: any): string[] => {
    const rawStr = deck.key_champions || deck.champions || deck.units || '';
    if (!rawStr) return [];
    return rawStr
      .split(/[,;/]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  };

  // 티어 뱃지 텍스트 정제 ("1티어 (우승)" -> "S", "2티어" -> "A")
  const formatTierBadge = (rawTier?: string) => {
    if (!rawTier) return { text: 'S', isShort: true };
    if (rawTier.includes('1') || rawTier.toUpperCase().includes('S')) return { text: 'S', isShort: true };
    if (rawTier.includes('2') || rawTier.toUpperCase().includes('A')) return { text: 'A', isShort: true };
    if (rawTier.includes('3') || rawTier.toUpperCase().includes('B')) return { text: 'B', isShort: true };
    return { text: rawTier, isShort: rawTier.length <= 2 };
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
  const filteredDecks = decks.filter((deck) => {
    const title = deck.comp_name || deck.title || deck.name || '';
    const champStr = deck.key_champions || deck.champions || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      champStr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#121318] text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. 상단 탭 네비게이션 */}
        <div className="flex justify-center my-4">
          <div className="bg-[#1b1c22] p-1.5 rounded-full inline-flex gap-1 border border-[#282a32] shadow-inner">
            {(['recommended', 'stats', 'recent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'recommended' && '추천 메타'}
                {tab === 'stats' && '메타 통계'}
                {tab === 'recent' && '최근 1위 덱'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 필터 드롭다운 & 검색바 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select className="bg-[#1f2128] border border-[#2d303b] text-slate-200 px-3 py-2 rounded-lg font-medium outline-none">
              <option>최근 2일 (18.2)</option>
              <option>최근 7일</option>
            </select>
            <select className="bg-[#1f2128] border border-[#2d303b] text-slate-200 px-3 py-2 rounded-lg font-medium outline-none">
              <option>평균 등수</option>
              <option>승률순</option>
              <option>픽률순</option>
            </select>
            <select className="bg-[#1f2128] border border-[#2d303b] text-slate-200 px-3 py-2 rounded-lg font-medium outline-none">
              <option>🔮 마스터+</option>
              <option>💎 다이아+</option>
              <option>🥇 플래티넘+</option>
            </select>
            <span className="text-[#62687a] text-[11px] ml-1">최종 업데이트: 방금 전</span>
          </div>

          {/* 검색창 */}
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="챔피언, 시너지 검색"
              className="w-full bg-[#1b1c22] border border-[#2d303b] focus:border-amber-500/80 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        {/* 3. 메타 덱 리스트 영역 */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-20 text-slate-500 text-sm">Supabase에서 실제 데이터를 불러오는 중...</div>
          ) : filteredDecks.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">검색 결과가 없습니다.</div>
          ) : (
            filteredDecks.map((deck) => {
              const champions = getChampionList(deck);
              const title = deck.comp_name || deck.title || deck.name || '우승 덱';
              const { text: tierText, isShort } = formatTierBadge(deck.tier);

              return (
                <Link
                  key={deck.id}
                  href={`/tft/${deck.id}`}
                  className="block bg-[#1b1c22] hover:bg-[#20222a] border border-[#282a32] border-l-4 border-l-red-500 rounded-xl p-4 transition shadow-lg group relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* 좌측: 티어, 덱 이름, 챔피언 목록 */}
                    <div className="space-y-3 flex-1 w-full">
                      {/* 카드 상단: 깔끔한 티어 뱃지 & 제목 & 복사 버튼 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-md bg-red-500/20 text-red-400 font-black text-xs flex items-center justify-center border border-red-500/40 shrink-0 ${
                            isShort ? 'w-6 h-6' : 'px-2 py-0.5'
                          }`}>
                            {tierText}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition">
                            {title}
                          </h3>
                        </div>

                        {/* 우측 상단 팀 코드 복사 버튼 */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleCopyCode(deck.team_code || deck.deck_code || '', deck.id, e)}
                            className="bg-[#242630] hover:bg-[#2e313e] text-[11px] font-semibold text-slate-300 px-2.5 py-1 rounded border border-[#333745] flex items-center gap-1 transition"
                          >
                            📋 {copiedId === deck.id ? '복사됨!' : '팀 코드 복사'}
                          </button>
                          <button className="bg-[#242630] hover:bg-[#2e313e] p-1.5 rounded border border-[#333745] text-slate-400 hover:text-slate-200 transition">
                            🛒
                          </button>
                        </div>
                      </div>

                      {/* 챔피언 초상화 목록 */}
                      <div className="flex flex-wrap items-end gap-2 pt-1">
                        {champions.map((champRaw: string, idx: number) => {
                          const { displayName, imageUrl } = parseChampion(champRaw);
                          const isCarry = idx < 2; // 주요 캐리 기물 3성 표시
                          const costBorder = COST_BORDER_COLORS[(idx % 5) + 1] || 'border-slate-500';

                          return (
                            <div key={idx} className="flex flex-col items-center">
                              {/* 별표 (핵심 캐리 2개만 3성 표시) */}
                              <div className="h-3 text-[9px] text-cyan-400 font-bold tracking-tighter">
                                {isCarry ? '★★★' : ''}
                              </div>

                              {/* 초상화 이미지 (엑박 발생 시 대체 아이콘 적용) */}
                              <div
                                className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 ${costBorder} bg-slate-900 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center`}
                              >
                                <img
                                  src={imageUrl}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // 이미지 로드 실패 시 라이엇 공식 기본 아이콘 또는 플레이스홀더로 교체
                                    (e.target as HTMLImageElement).src =
                                      'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png';
                                  }}
                                />
                              </div>

                              {/* 아이템 뱃지 예시 */}
                              {isCarry ? (
                                <div className="flex -mt-2 z-10 gap-0.5">
                                  <div className="w-3 h-3 bg-amber-500 border border-slate-900 rounded-xs shadow-xs" />
                                  <div className="w-3 h-3 bg-blue-500 border border-slate-900 rounded-xs shadow-xs" />
                                  <div className="w-3 h-3 bg-purple-500 border border-slate-900 rounded-xs shadow-xs" />
                                </div>
                              ) : (
                                <div className="h-1" />
                              )}

                              {/* 한글 챔피언 이름 */}
                              <span className="text-[10px] text-slate-400 mt-0.5 max-w-[48px] truncate text-center">
                                {displayName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 우측: 실제 통계 지표 (없을 경우 기본값 표기) */}
                    <div className="w-full lg:w-auto border-t lg:border-t-0 border-[#282a32] pt-3 lg:pt-0">
                      <div className="grid grid-cols-4 gap-4 md:gap-6 text-center items-center px-2 min-w-[260px]">
                        <div>
                          <div className="text-sm md:text-base font-black text-red-400">
                            {deck.avg_rank || deck.avg_place ? `#${deck.avg_rank || deck.avg_place}` : '#3.95'}
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
                            {deck.win_rate ? `${deck.win_rate}%` : '22.9%'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">승률</div>
                        </div>
                        <div>
                          <div className="text-xs md:text-sm font-bold text-slate-200">
                            {deck.top4_rate ? `${deck.top4_rate}%` : '59.2%'}
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

// Supabase 데이터가 전혀 없을 때 비상용 샘플 데이터
const MOCK_DECKS = [
  {
    id: '1',
    tier: 'S',
    comp_name: '[상징] 요정 트리스타나',
    key_champions: 'Rakan, Rammus, Rengar, Vi, Tristana, Lillia, Sivir, Gnar, Ashe',
    avg_rank: '3.95',
    pick_rate: '0.10',
    win_rate: '22.9',
    top4_rate: '59.2',
    team_code: '0x01_TFT_Fairy_Tristana_Build_Code',
  },
  {
    id: '2',
    tier: 'S',
    comp_name: '고밸류 드레이븐 이즈리얼',
    key_champions: 'Alistar, Amumu, Ezreal, Gnar, Draven, Maokai, Ivern, Kennen, Taric',
    avg_rank: '4.07',
    pick_rate: '0.70',
    win_rate: '25.6',
    top4_rate: '54.4',
    team_code: '0x02_TFT_HighValue_Draven_Ezreal_Code',
  },
];
