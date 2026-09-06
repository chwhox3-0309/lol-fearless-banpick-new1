"use client";

import React, { useState } from "react";
import { useDraft } from "../context/DraftContext";

interface MatchSetResult {
  setNo: number;
  matchId: string;
  bluePicks: string[];
  redPicks: string[];
}

export default function FearlessMatchLoader({ onApplyFearless }: { onApplyFearless: (forbiddenChampions: string[]) => void }) {
  const { champions } = useDraft(); // 사이트에서 관리하는 챔피언 데이터

  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedMatches, setFetchedMatches] = useState<MatchSetResult[]>([]);
  const [selectedSetToLoad, setSelectedSetToLoad] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState("");

  // 영어 챔피언 이름을 사이트의 시스템 키(ID 또는 일치하는 값)로 변환하는 함수
  const mapChampionId = (riotChampName: string) => {
    if (!champions) return riotChampName;

    // 1. champions 객체에서 key나 id가 영어 이름과 정확히 일치하는지 확인
    if (champions[riotChampName]) {
      return riotChampName;
    }

    // 2. 대소문자 무시 혹은 name(한글/영문) 매칭을 통해 올바른 시스템 ID 찾기
    const foundEntry = Object.entries(champions).find(([id, data]: [string, any]) => {
      return (
        id.toLowerCase() === riotChampName.toLowerCase() ||
        data.name?.toLowerCase() === riotChampName.toLowerCase() ||
        data.englishName?.toLowerCase() === riotChampName.toLowerCase()
      );
    });

    return foundEntry ? foundEntry[0] : riotChampName;
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

      // 가져온 챔피언 이름을 사이트 규격에 맞게 매핑
      const mappedMatches = data.matchHistories.map((match: any) => ({
        ...match,
        bluePicks: match.bluePicks.map((c: string) => mapChampionId(c)),
        redPicks: match.redPicks.map((c: string) => mapChampionId(c)),
      }));

      setFetchedMatches(mappedMatches);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFearlessRule = () => {
    const targetHistory = fetchedMatches.filter((item) => item.setNo <= selectedSetToLoad);
    const allUsedChampions: string[] = [];
    
    targetHistory.forEach((set) => {
      allUsedChampions.push(...set.bluePicks, ...set.redPicks);
    });

    const uniqueForbidden = Array.from(new Set(allUsedChampions));
    onApplyFearless(uniqueForbidden);
    alert(`⚡ [라이엇 연동 완료] 선택한 세트의 픽들이 피어리스 밴픽 목록에 정상 반영되었습니다!`);
  };

  // 화면에 챔피언 이름을 보기 편하게 한글로 보여주기 위한 헬퍼
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
          라이엇 계정의 최근 경기 기록을 가져와 밴픽 시스템과 자동으로 동기화합니다.
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
        <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          {fetchedMatches.map((history) => (
            <div key={history.matchId} className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-teal-400">SET {history.setNo} 연동 경기 기록</span>
                <span className="text-[10px] text-gray-500 font-mono">Match ID: {history.matchId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-gray-900 border border-blue-500/20 flex flex-col gap-1">
                  <span className="font-bold text-blue-400 text-[11px]">내 팀 플레이 픽</span>
                  <div className="flex flex-wrap gap-1">
                    {history.bluePicks.map((champ, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                        {getDisplayName(champ)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-gray-900 border border-red-500/20 flex flex-col gap-1">
                  <span className="font-bold text-red-400 text-[11px]">상대 팀 플레이 픽</span>
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
          ))}
        </div>
      )}

      {fetchedMatches.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-400 shrink-0">적용 범위:</span>
            <select
              value={selectedSetToLoad}
              onChange={(e) => setSelectedSetToLoad(Number(e.target.value))}
              className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500"
            >
              <option value={1}>1세트 픽까지 금지 (2세트용)</option>
              <option value={2}>1~2세트 픽까지 금지 (3세트용)</option>
              <option value={3}>1~3세트 픽까지 금지 (4세트용)</option>
            </select>
          </div>

          <button
            onClick={handleApplyFearlessRule}
            className="w-full sm:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-400 text-gray-950 font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer"
          >
            ⚡ 라이엇 전적 피어리스 룰에 반영하기
          </button>
        </div>
      )}
    </div>
  );
}
