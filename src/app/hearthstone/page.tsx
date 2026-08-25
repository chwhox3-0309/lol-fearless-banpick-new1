"use client";

import React, { useState, useEffect } from "react";

interface HearthstoneCard {
  cardId: string;
  name: string;
  cardSet: string;
  type: string;
  rarity: string;
  cost?: number;
  attack?: number;
  health?: number;
  text?: string;
  img?: string;
  class?: string;
}

export default function HearthstoneDeckBuilder() {
  const [cards, setCards] = useState<HearthstoneCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("Lich King");
  const [inputVal, setInputVal] = useState("");
  
  // 덱 빌딩 상태 (담긴 카드 목록)
  const [deck, setDeck] = useState<HearthstoneCard[]>([]);

  // API 데이터 호출
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://omgvamp-hearthstone-v1.p.rapidapi.com/cards/search/${encodeURIComponent(searchTerm)}`, {
          headers: {
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY || "YOUR_RAPID_API_KEY",
            "X-RapidAPI-Host": "omgvamp-hearthstone-v1.p.rapidapi.com",
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          const validCards = data.filter((c: any) => c.img);
          setCards(validCards.slice(0, 24));
        } else {
          // API 키 미설정 시 Fallback 예시 데이터
          setCards([
            {
              cardId: "EX1_012",
              name: "이나리우스 (예시)",
              cardSet: "Classic",
              type: "Minion",
              rarity: "Legendary",
              cost: 6,
              attack: 6,
              health: 7,
              text: "전투의 함성: 무작위 적에게 피해를 6 줍니다.",
              img: "https://hearthstone.nos.blizzard.com/enUS_esports/hero_default.png",
              class: "Neutral"
            }
          ]);
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchTerm(inputVal);
    }
  };

  // 덱에 카드 추가 (최대 30장 제한)
  const addToDeck = (card: HearthstoneCard) => {
    if (deck.length >= 30) {
      alert("덱은 최대 30장까지만 구성할 수 있습니다.");
      return;
    }
    const existingCount = deck.filter((c) => c.cardId === card.cardId).length;
    const maxLimit = card.rarity === "Legendary" ? 1 : 2;
    
    if (existingCount >= maxLimit) {
      alert(`이 카드는 덱에 최대 ${maxLimit}장까지만 포함할 수 있습니다.`);
      return;
    }

    const updatedDeck = [...deck, card].sort((a, b) => (a.cost || 0) - (b.cost || 0));
    setDeck(updatedDeck);
  };

  // 덱에서 카드 제거
  const removeFromDeck = (indexToRemove: number) => {
    setDeck(deck.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-col h-screen bg-[#13151A] font-sans text-stone-200 antialiased selection:bg-amber-500/30">
      {/* 상단 네비게이션 바 */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-stone-800/80 bg-[#181B22]/80 backdrop-blur-xl sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-[0.25em] text-amber-500 uppercase">
            HEARTHSTONE DECK BUILDER
          </span>
        </div>

        {/* 둥근 검색바 */}
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#222630] rounded-full py-2.5 px-6 gap-3 w-96 border border-stone-700/50 focus-within:border-amber-500/50 focus-within:bg-[#1C2028] transition-all duration-300 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="카드 검색 (예: Ragnaros, Mage)"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="outline-none text-xs bg-transparent w-full text-stone-200 placeholder-stone-500 tracking-tight"
          />
        </form>

        <div className="text-[11px] font-medium tracking-[0.15em] text-amber-400/90 uppercase bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
          Deck: {deck.length} / 30
        </div>
      </header>

      {/* 메인 3단 분할 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 1. 카드 라이브러리 (검색 결과) */}
        <div className="w-full lg:w-7/12 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 gap-5 bg-[#13151A]">
          {cards.map((card) => (
            <div
              key={card.cardId}
              onClick={() => addToDeck(card)}
              className="group cursor-pointer flex flex-col items-center p-3 rounded-[24px] transition-all duration-300 bg-[#1B1F28] border border-stone-800/60 hover:border-amber-500/50 hover:bg-[#202532] hover:scale-[1.02]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[16px] bg-[#12141A] flex items-center justify-center p-2">
                <img src={card.img} alt={card.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md" />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 border border-stone-700/50">
                  {card.cost ?? 0}마나
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 mt-3 text-center">
                <h3 className="font-semibold text-xs text-stone-200 tracking-tight line-clamp-1">
                  {card.name}
                </h3>
                <span className="text-[10px] text-stone-400 font-medium">
                  {card.rarity || "Common"} · 클릭하여 덱에 추가
                </span>
              </div>
            </div>
          ))}

          {cards.length === 0 && !loading && (
            <div className="col-span-full text-center py-28 text-stone-500 text-xs font-light tracking-wide">
              검색된 카드가 없습니다.
            </div>
          )}

          {loading && (
            <div className="col-span-full text-center py-28 text-amber-500/70 text-xs tracking-widest animate-pulse">
              카드를 불러오는 중...
            </div>
          )}
        </div>

        {/* 2. 우측: 나만의 덱 리스트 빌더 영역 */}
        <div className="hidden lg:flex lg:w-5/12 flex-col border-l border-stone-800/80 bg-[#161922] overflow-hidden">
          <div className="p-6 border-b border-stone-800/80 bg-[#181B22] flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-stone-100 uppercase">Current Deck</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">원하는 카드를 눌러 덱을 구성하세요.</p>
            </div>
            <button 
              onClick={() => setDeck([])}
              className="text-[11px] text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 transition-colors"
            >
              덱 초기화
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            {deck.map((card, idx) => (
              <div
                key={`${card.cardId}-${idx}`}
                onClick={() => removeFromDeck(idx)}
                className="group flex items-center justify-between p-3 rounded-[16px] bg-[#1B1F28] border border-stone-800 hover:border-rose-500/40 hover:bg-[#221c22] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                    {card.cost ?? 0}
                  </div>
                  <span className="text-xs font-medium text-stone-200 group-hover:text-rose-300 transition-colors">
                    {card.name}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 group-hover:text-rose-400">
                  클릭해서 제거
                </span>
              </div>
            ))}

            {deck.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-stone-500 text-xs font-light gap-2">
                <p>아직 담긴 카드가 없습니다.</p>
                <p className="text-[10px] text-stone-600">좌측 카드 목록을 클릭해 덱을 채워보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

