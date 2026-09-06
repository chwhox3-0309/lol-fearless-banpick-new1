"use client";

import React, { useState } from "react";
import { useDraft } from "../context/DraftContext";

interface SetResult {
  setNo: number;
  bluePicks: string[];
  redPicks: string[];
}

export default function FearlessMatchLoader({ onApplyFearless }: { onApplyFearless: (forbiddenChampions: string[]) => void }) {
  const { completedDrafts, champions } = useDraft();

  // 완료된 세트 기록이 있다면 변환하고, 없다면 기본 예시(또는 빈 배열)를 표시
  const hasRealHistory = completedDrafts && completedDrafts.length > 0;

  const [selectedSetToLoad, setSelectedSetToLoad] = useState<number>(1);
  const [appliedSets, setAppliedSets] = useState<number[]>([]);

  // completedDrafts 구조를 SetResult 형태로 매핑
  const matchHistory: SetResult[] = hasRealHistory
    ? completedDrafts.map((draft: any, index: number) => {
        const team1 = draft?.team1 || { picks: [] };
        const team2 = draft?.team2 || { picks: [] };
        return {
          setNo: index + 1,
          bluePicks: team1.picks || [],
          redPicks: team2.picks || [],
        };
      })
    : [
        {
          setNo: 1,
          bluePicks: ["제이스", "리신", "아리"],
          redPicks: ["크산테", "니달리", "요네"],
        },
      ];

  const handleApplyFearlessRule = () => {
    const targetHistory = matchHistory.filter((item) => item.setNo <= selectedSetToLoad);
    
    const allUsedChampions: string[] = [];
    targetHistory.forEach((set) => {
      allUsedChampions.push(...set.bluePicks, ...set.redPicks);
    });

    const uniqueForbidden = Array.from(new Set(allUsedChampions));
    onApplyFearless(uniqueForbidden);

    if (!appliedSets.includes(selectedSetToLoad)) {
      setAppliedSets([...appliedSets, selectedSetToLoad]);
    }
  };

  // 챔피언 ID가 들어올 경우 한글 이름으로 변환해주는 헬퍼
  const getChampDisplayName = (idOrName: string) => {
    if (champions && champions[idOrName]) {
      return champions[idOrName].name;
    }
    return idOrName;
  };

  return (
    <div className="w-full p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col gap-4 text-gray-200 shadow-xl">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full w-fit">
          다전제 피어리스 연동 관리자
        </span>
        <h3 className="text-sm font-bold text-gray-100 mt-1">
          지난 세트 커스텀 게임 픽 기록 불러오기 & 피어리스 적용
        </h3>
        <p className="text-xs text-gray-400">
          이전 세트에서 사용된 챔피언들을 자동으로 다음 세트 밴픽의 사용 불가(Fearless) 목록에 반영합니다.
        </p>
      </div>

      {/* 세트별 기록 카드 리스트 */}
      <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
        {matchHistory.map((history) => (
          <div key={history.setNo} className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400">SET {history.setNo} 경기 픽 기록</span>
              <span className="text-[10px] text-gray-500 font-mono">Completed Set</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-gray-900 border border-blue-500/20 flex flex-col gap-1">
                <span className="font-bold text-blue-400 text-[11px]">블루 팀 픽</span>
                <div className="flex flex-wrap gap-1">
                  {history.bluePicks.length > 0 ? (
                    history.bluePicks.map((champ, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                        {getChampDisplayName(champ)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-500">선택된 픽 없음</span>
                  )}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-gray-900 border border-red-500/20 flex flex-col gap-1">
                <span className="font-bold text-red-400 text-[11px]">레드 팀 픽</span>
                <div className="flex flex-wrap gap-1">
                  {history.redPicks.length > 0 ? (
                    history.redPicks.map((champ, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 text-[10px] font-medium border border-red-500/20">
                        {getChampDisplayName(champ)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-500">선택된 픽 없음</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 연동 적용 컨트롤 바 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 shrink-0">적용 범위:</span>
          <select
            value={selectedSetToLoad}
            onChange={(e) => setSelectedSetToLoad(Number(e.target.value))}
            className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
          >
            <option value={1}>1세트 픽까지 금지 (2세트용)</option>
            <option value={2}>1~2세트 픽까지 금지 (3세트용)</option>
            <option value={3}>1~3세트 픽까지 금지 (4세트용)</option>
          </select>
        </div>

        <button
          onClick={handleApplyFearlessRule}
          className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer"
        >
          ⚡ 피어리스 룰 반영하기
        </button>
      </div>
    </div>
  );
}
