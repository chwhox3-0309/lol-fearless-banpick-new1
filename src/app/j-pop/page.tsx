"use client";

import { useState } from "react";
import Link from "next/link";
import KakaoAdFitBanner from "../components/KakaoAdFitBanner";

interface DramaOstItem {
  id: string;
  title: string;       // 드라마 제목
  year: string;
  season: string;      // 1분기, 2분기, 3분기, 4분기
  broadcast: string;   // 방송국 (TBS, 후지TV 등)
  ostTitle: string;    // OST 곡 제목
  artist: string;      // 아티스트
  description: string; // 드라마/곡 설명
}

// 예시 데이터 (실제 데이터로 확장하거나 Supabase 등에서 불러오도록 연동할 수 있습니다)
const DRAMA_OST_DATA: DramaOstItem[] = [
  {
    id: "1",
    title: "눈이 부실 때 (가제 / 예시 화제작)",
    year: "2026",
    season: "1분기",
    broadcast: "TBS",
    ostTitle: "빛의 방향",
    artist: "YOASOBI",
    description: "2026년 1분기 최고 시청률을 기록한 감성 로맨스 드라마 OST.",
  },
  {
    id: "2",
    title: "언내추럴 / 미완의 사건",
    year: "2024",
    season: "1분기",
    broadcast: "TBS",
    ostTitle: "Lemon",
    artist: "Kenshi Yonezu",
    description: "역대급 명작으로 꼽히는 법의학 수사 드라마의 레전드 OST.",
  },
  {
    id: "3",
    title: "First Love 하츠코이",
    year: "2022",
    season: "4분기",
    broadcast: "Netflix",
    ostTitle: "First Love",
    artist: "Hikaru Utada",
    description: "우타다 히카루의 명곡을 모티브로 한 넷플릭스 오리지널 히트작.",
  },
];

export default function JPopDramaOstPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedSeason, setSelectedSeason] = useState<string>("전체");

  const years = ["2026", "2025", "2024", "2023", "2022"];
  const seasons = ["전체", "1분기", "2분기", "3분기", "4분기"];

  // 필터링 로직
  const filteredItems = DRAMA_OST_DATA.filter((item) => {
    const matchYear = item.year === selectedYear;
    const matchSeason = selectedSeason === "전체" || item.season === selectedSeason;
    return matchYear && matchSeason;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                J-DRAMA OST ARCHIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              분기별 일본 드라마 & OST 모음
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              시즌별 화제작 드라마와 가슴을 울리는 명품 OST를 한곳에서 확인하세요.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700 shrink-0"
          >
            ← 메인 (밴픽)으로
          </Link>
        </div>

        {/* 연도 및 분기 필터 탭 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
          {/* 연도 선택 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium w-16">연도:</span>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedYear === year
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-gray-950 text-gray-400 hover:text-white border border-gray-800"
                }`}
              >
                {year}년
              </button>
            ))}
          </div>

          {/* 분기 선택 */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-800/80">
            <span className="text-xs text-gray-400 font-medium w-16">분기:</span>
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedSeason === season
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-gray-950 text-gray-400 hover:text-white border border-gray-800"
                }`}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 카드 리스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            {selectedYear}년 {selectedSeason !== "전체" ? selectedSeason : "전체 시즌"} 드라마 OST 목록{" "}
            <span className="text-purple-400 text-sm font-normal">({filteredItems.length}건)</span>
          </h2>

          {filteredItems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm">
              해당 분기에 등록된 드라마 OST 정보가 없습니다. (데이터를 계속 업데이트할 예정입니다!)
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {item.broadcast}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.year} {item.season}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white pt-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-300 font-semibold">🎵 {item.ostTitle}</p>
                      <p className="text-[11px] text-gray-400">아티스트: {item.artist}</p>
                    </div>
                    <button 
                      onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.ostTitle + ' ' + item.artist)}`, '_blank')}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-xl transition-colors border border-gray-700"
                    >
                      유튜브 검색 ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 광고 배너 */}
        <div className="flex justify-center pt-4">
          <KakaoAdFitBanner adUnit="DAN-s7ZfoKBcZ1QEap9Y" width="300" height="250" />
        </div>

      </div>
    </div>
  );
}
