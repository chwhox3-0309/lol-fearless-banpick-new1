"use client";

import React, { useState, useEffect } from "react";
import AdsenseBanner from "@/app/components/AdsenseBanner";
import KakaoAdFitBanner from "@/app/components/KakaoAdFitBanner";

interface LottoResult {
  drwNo: number;
  drwNoDate: string;
  numbers: number[];
  bonusNo: number;
}

export default function LottoArchivePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1); // 1개월, 3개월, 5개월
  const [loading, setLoading] = useState<boolean>(false);
  const [recentDraws, setRecentDraws] = useState<LottoResult[]>([]);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [hotNumbersStats, setHotNumbersStats] = useState<{ number: number; count: number }[]>([]);

  // 기간별 회차 수 계산 (1개월 ≈ 4회차, 3개월 ≈ 13회차, 5개월 ≈ 22회차)
  const getDrawCount = (period: number) => {
    switch (period) {
      case 1: return 4;
      case 3: return 13;
      case 5: return 22;
      default: return 4;
    }
  };

  // 가상의 최근 로또 데이터 패치 (실제 구현 시 동행복권 API 연동 또는 백엔드 라우트 활용)
  useEffect(() => {
    const fetchLottoData = async () => {
      setLoading(true);
      try {
        // 예시 최신 회차 기준 (예: 1210회차 가정)
        // 실제 운영 시 최신 회차를 먼저 조회한 뒤 해당 개수만큼 반복 호출하거나 백엔드에서 묶어서 가져오면 됩니다.
        const targetCount = getDrawCount(selectedPeriod);
        
        // 동행복권 공개 API 활용 예시 구조 (실제로는 CORS 이슈로 인해 Next.js API Route를 거치는 것이 안전합니다)
        const mockData: LottoResult[] = [];
        const latestDrwNo = 1210; // 현재 시점 기준 최신 회차 예시

        for (let i = 0; i < targetCount; i++) {
          const drwNo = latestDrwNo - i;
          // 임시 테스트용 데이터 생성 (실제 API 연동부로 대체 필요)
          mockData.push({
            drwNo,
            drwNoDate: "2026-00-00",
            numbers: Array.from({ length: 6 }, () => Math.floor(Math.random() * 45) + 1).sort((a,b)=>a-b),
            bonusNo: Math.floor(Math.random() * 45) + 1
          });
        }

        setRecentDraws(mockData);
        calculateStats(mockData);
      } catch (err) {
        console.error("로또 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLottoData();
  }, [selectedPeriod]);

  // 빈도수 계산 및 통계 내기
  const calculateStats = (draws: LottoResult[]) => {
    const counts: { [key: number]: number } = {};
    for (let i = 1; i <= 45; i++) counts[i] = 0;

    draws.forEach((draw) => {
      draw.numbers.forEach((num) => {
        counts[num] = (counts[num] || 0) + 1;
      });
    });

    const sortedStats = Object.keys(counts)
      .map((num) => ({ number: Number(num), count: counts[Number(num)] }))
      .sort((a, b) => b.count - a.count);

    setHotNumbersStats(sortedStats);
  };

  // 통계 기반 가중치 로또 번호 생성기
  const generateSmartLotto = () => {
    if (hotNumbersStats.length === 0) return;

    // 상위 빈출 번호들에 가중치 부여 (예: 상위 20개 숫자를 풀(Pool)로 삼아 가중 추첨)
    const topPool = hotNumbersStats.slice(0, 25).map(item => item.number);
    const results: number[] = [];

    while (results.length < 6) {
      const randomIndex = Math.floor(Math.random() * topPool.length);
      const chosen = topPool[randomIndex];
      if (!results.includes(chosen)) {
        results.push(chosen);
      }
    }

    setGeneratedNumbers(results.sort((a, b) => a - b));
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#13151A] font-sans text-stone-200 antialiased select-none">
      
      {/* 상단 네비게이션 */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-3.5 border-b border-stone-800 bg-[#181B22] shrink-0 gap-3 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black tracking-[0.2em] text-amber-500 uppercase">
            LOTTO STATS ARCHIVE
          </span>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
            기간별 당첨 통계 & 조합기
          </span>
        </div>

        {/* 기간 선택 탭 */}
        <div className="flex items-center gap-1.5 bg-[#13151A] p-1 rounded-full border border-stone-800">
          {[1, 3, 5].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                selectedPeriod === period
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              최근 {period}개월
            </button>
          ))}
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (2분할 레이아웃) */}
      <div className="flex flex-1 w-full overflow-hidden" style={{ minHeight: "calc(100vh - 61px)" }}>
        
        {/* 1. 좌측: 번호 생성기 및 통계 요약 영역 */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 bg-[#13151A] gap-6">
          
          <div className="flex flex-col gap-6">
            {/* 번호 생성 카드 */}
            <div className="w-full p-6 rounded-3xl bg-[#1B1F28] border border-stone-700/60 shadow-2xl flex flex-col items-center gap-5">
              <div className="text-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  최근 {selectedPeriod}개월 통계 기반 픽
                </span>
                <h2 className="text-sm font-bold text-stone-100 mt-2">
                  가장 많이 출현한 숫자를 조합한 스마트 로또 번호
                </h2>
              </div>

              {/* 생성된 번호 볼 (Ball) UI */}
              <div className="flex items-center justify-center gap-2.5 my-2">
                {generatedNumbers.length > 0 ? (
                  generatedNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black text-sm md:text-base flex items-center justify-center shadow-lg shadow-amber-500/20"
                    >
                      {num}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-500 py-4">
                    버튼을 눌러 통계 조합 번호를 생성해 보세요!
                  </div>
                )}
              </div>

              <button
                onClick={generateSmartLotto}
                className="w-full md:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl text-xs font-black tracking-wider transition-all shadow-lg shadow-amber-500/10 active:scale-95"
              >
                ✨ 스마트 번호 조합 생성하기
              </button>
            </div>

            {/* 통계 기반 TOP 5 숫자 미리보기 카드 */}
            <div className="w-full p-5 rounded-3xl bg-[#1B1F28] border border-stone-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-stone-300">
                📊 최근 {selectedPeriod}개월 최다 출현 번호 TOP 5
              </span>
              <div className="grid grid-cols-5 gap-2">
                {hotNumbersStats.slice(0, 5).map((stat, idx) => (
                  <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-[#222733] border border-stone-800">
                    <span className="text-sm font-black text-amber-400">{stat.number}번</span>
                    <span className="text-[10px] text-stone-500 mt-1">{stat.count}회 출현</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 text-center">
            * 본 번호 조합은 통계적 빈도에 기반한 참고용 추정치이며, 당첨을 100% 보장하지 않습니다.
          </div>
        </div>

        {/* 2. 우측: 기간별 당첨 회차 리스트 + 광고 영역 */}
        <aside className="w-[420px] shrink-0 hidden xl:flex flex-col p-5 border-l border-stone-800 bg-[#161922] overflow-y-auto justify-between gap-4">
          
          <div className="flex flex-col gap-4 w-full">
            <span className="text-xs font-bold text-stone-400 px-1">
              최근 {selectedPeriod}개월 회차별 당첨 데이터 ({recentDraws.length}회차)
            </span>

            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-12 text-amber-500 text-xs animate-pulse">
                  데이터를 불러오는 중입니다...
                </div>
              ) : (
                recentDraws.map((draw) => (
                  <div key={draw.drwNo} className="p-3.5 rounded-2xl bg-[#1B1F28] border border-stone-800 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-amber-400">{draw.drwNo}회차</span>
                      <span className="text-stone-500 font-mono">{draw.drwNoDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {draw.numbers.map((n, i) => (
                        <span key={i} className="w-6 h-6 rounded-full bg-[#222733] text-stone-300 text-[10px] font-bold flex items-center justify-center border border-stone-700">
                          {n}
                        </span>
                      ))}
                      <span className="text-stone-500 text-xs ml-1">+ {draw.bonusNo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 우측 하단 광고 영역 */}
          <div className="w-full flex flex-col gap-3 pt-2">
            <div className="w-full bg-[#1B1F28]/80 border border-stone-800 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[9px] text-stone-500 uppercase tracking-widest mb-1.5">Sponsored (Adsense)</span>
              <div className="w-full flex justify-center overflow-hidden">
                <AdsenseBanner />
              </div>
            </div>

            <div className="w-full bg-[#1B1F28]/80 border border-stone-800 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[9px] text-stone-500 uppercase tracking-widest mb-1.5">Sponsored (Adfit)</span>
              <div className="w-full flex justify-center overflow-hidden">
                <KakaoAdFitBanner />
              </div>
            </div>
          </div>

        </aside>
      </div>

    </div>
  );
}
