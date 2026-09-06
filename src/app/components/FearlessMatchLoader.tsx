"use client";

import React, { useState } from "react";
import { useDraft } from "../context/DraftContext";

interface MatchSetResult {
  setNo: number;
  matchId: string;
  bluePicks: string[];
  redPicks: string[];
}

interface FearlessMatchLoaderProps {
  onApplySetHistory: (historyData: { setNo: number; team2Picks: string[]; team1Picks: string[] }[]) => void;
}

export default function FearlessMatchLoader({ onApplySetHistory }: FearlessMatchLoaderProps) {
  const { champions } = useDraft();

  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedMatches, setFetchedMatches] = useState<MatchSetResult[]>([]);
  
  // 기존 일괄 선택 범위 대신 개별 세트 체크박스 상태 관리 (matchId 혹은 setNo 기준)
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // 라이엇 챔피언 이름을 사이트 시스템 키와 완벽하게 매칭하는 함수
  const mapChampionId = (riotChampName: string) => {
    if (!riotChampName) return "";
    if (!champions || Object.keys(champions).length === 0) return riotChampName;

    const sanitizedRiotName = riotChampName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    for (const [key, data] of Object.entries(champions) as [string, any][]) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const sanitizedName = (data.name || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const sanitizedEnglishName = (data.englishName || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      if (
        sanitizedKey === sanitizedRiotName ||
        sanitizedName === sanitizedRiotName ||
        sanitizedEnglishName === sanitizedRiotName
      ) {
        return key;
      }
    }

    const foundKey = Object.keys(champions).find(
      (k) => k.toLowerCase() === riotChampName.toLowerCase()
    );
    if (foundKey) return foundKey;

    return riotChampName;
  };

  const handleFetchRiotMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !tagLine) {
      setErrorMessage("소환사 이름과 태그를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/riot-matches?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "데이터를 불러오지 못했습니다.");
      }

      const mappedMatches = data.matchHistories.map((match: any) => ({
        ...match,
        bluePicks: match.bluePicks.map((c: string) => mapChampionId(c)).filter(Boolean),
        redPicks: match.redPicks.map((c: string) => mapChampionId(c)).filter(Boolean),
      }));

      setFetchedMatches(mappedMatches);
      
      // 조회 성공 시 기본적으로 모든 세트가 체크되도록 초기화 (원하는 경우 빈 배열로 두어도 무방)
      setSelectedMatchIds(mappedMatches.map((m: MatchSetResult) => m.matchId));
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 개별 체크박스 토글 핸들러
  const handleToggleCheckbox = (matchId: string) => {
    setSelectedMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  // 전체 선택 / 해제 토글
  const handleToggleAll = () => {
    if (selectedMatchIds.length === fetchedMatches.length) {
      setSelectedMatchIds([]);
    } else {
      setSelectedMatchIds(fetchedMatches.map((m) => m.matchId));
    }
  };

  // 선택된 경기 정보만 필터링하여 대량 등록 형식으로 반영
  const handleApplySelectedMatches = () => {
    if (selectedMatchIds.length === 0) {
      setErrorMessage("반영할 세트(게임 정보)를 하나 이상 체크해주세요.");
      return;
    }

    const targetHistory = fetchedMatches.filter((item) => selectedMatchIds.includes(item.matchId));
    const formattedHistory = targetHistory.map((item) => ({
      setNo: item.setNo,
      team2Picks: item.bluePicks,
      team1Picks: item.redPicks,
    }));

    setErrorMessage("");
    onApplySetHistory(formattedHistory);
  };

  const getDisplayName = (champKey: string) => {
    if (champions && champions[champKey]) {
      return champions[champKey].name || champKey;
    }
    return champKey;
  };

  return (
    <div className="w-full p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col gap-4 text-gray-200 shadow-xl">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full w-fit">
          Riot 계정 연동 피어리스 시스템
        </span>
        <h3 className="text-sm font-bold text-gray-100 mt-1">
          실제 클라이언트 게임 전적 자동 불러오기
        </h3>
        <p className="text-xs text-gray-400">
          라이엇 계정의 최근 경기 기록을 가져와 원하는 세트만 체크하여 픽 구간에 누적 반영합니다.
        </p>
      </div>

      <form onSubmit={handleFetchRiotMatches} className="flex flex-col sm:flex-row gap-2 items-center bg-gray-950 p-3 rounded-xl border border-gray-800">
        <input
          type="text"
          placeholder="소환사명 (예: 전 설)"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white w-full focus:outline-none focus:border-teal-500"
        />
        <span className="text-gray-500 hidden sm:inline">#</span>
        <input
          type="text"
          placeholder="태그 (예: kr1)"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white w-full sm:w-28 focus:outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-all shrink-0 disabled:opacity-50"
        >
          {isLoading ? "조회 중..." : "전적 조회"}
        </button>
      </form>

      {errorMessage && <p className="text-xs text-red-400 font-medium">{errorMessage}</p>}

      {fetchedMatches.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {/* 전체 선택 제어 헤더 */}
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-gray-400">
              조회된 경기 목록 ({fetchedMatches.keys ? fetchedMatches.length : 0}개) 중 반영할 세트를 선택하세요.
            </span>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-[11px] text-teal-400 hover:underline font-medium"
            >
              {selectedMatchIds.length === fetchedMatches.length ? "전체 해제" : "전체 선택"}
            </button>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
            {fetchedMatches.map((history) => {
              const isChecked = selectedMatchIds.includes(history.matchId);
              return (
                <div
                  key={history.matchId}
                  onClick={() => handleToggleCheckbox(history.matchId)}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isChecked
                      ? "bg-teal-950/20 border-teal-500/50 shadow-inner"
                      : "bg-gray-950/80 border-gray-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleCheckbox(history.matchId)}
                    className="mt-1.5 w-4 h-4 text-teal-600 rounded bg-gray-900 border-gray-700 focus:ring-teal-500 cursor-pointer"
                  />

                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-teal-300">SET {history.setNo} 연동 경기 기록</span>
                      <span className="text-[10px] text-gray-500 font-mono">Match ID: {history.matchId}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="p-2 rounded-lg bg-gray-900 border border-blue-500/20 flex flex-col gap-1">
                        <span className="font-bold text-blue-400 text-[11px]">Team 2 (블루) 픽</span>
                        <div className="flex flex-wrap gap-1">
                          {history.bluePicks.map((champ, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                              {getDisplayName(champ)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-gray-900 border border-red-500/20 flex flex-col gap-1">
                        <span className="font-bold text-red-400 text-[11px]">Team 1 (레드) 픽</span>
                        <div className="flex flex-wrap gap-1">
                          {history.redPicks.map((champ, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 text-[10px] font-medium border border-red-500/20">
                              {getDisplayName(champ)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {fetchedMatches.length > 0 && (
        <div className="flex items-center justify-end pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={handleApplySelectedMatches}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-gray-950 font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>⚡ 선택한 세트만 대량 누적 반영하기</span>
          </button>
        </div>
      )}
    </div>
  );
}
