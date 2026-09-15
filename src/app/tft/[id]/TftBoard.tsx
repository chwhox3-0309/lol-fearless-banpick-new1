"use client";

import { useState } from "react";

interface TftBoardProps {
  keyChampions: string; // 예: "아칼리, 카이사, 쉔"
}

// 레벨별 예시 배치 좌표 데이터 (ROW: 0~3, COL: 0~6)
const LEVEL_SQUAD_DATA = {
  4: [
    { name: "전열 탱커", row: 0, col: 2, role: "tank" },
    { name: "임시 탱커", row: 0, col: 4, role: "tank" },
    { name: "서브 딜러", row: 3, col: 1, role: "dealer" },
    { name: "메인 딜러", row: 3, col: 5, role: "dealer" },
  ],
  6: [
    { name: "메인 탱커", row: 0, col: 1, role: "tank" },
    { name: "서브 탱커", row: 0, col: 3, role: "tank" },
    { name: "제어 기물", row: 0, col: 5, role: "tank" },
    { name: "서포터", row: 2, col: 3, role: "support" },
    { name: "서브 딜러", row: 3, col: 2, role: "dealer" },
    { name: "메인 딜러", row: 3, col: 4, role: "dealer" },
  ],
  8: [
    { name: "종결 탱커 1", row: 0, col: 1, role: "tank" },
    { name: "종결 탱커 2", row: 0, col: 3, role: "tank" },
    { name: "전열 서포터", row: 0, col: 5, role: "tank" },
    { name: "CC 제어기물", row: 1, col: 2, role: "support" },
    { name: "서브 딜러", row: 2, col: 4, role: "dealer" },
    { name: "메인 캐리 1", row: 3, col: 1, role: "dealer" },
    { name: "메인 캐리 2", row: 3, col: 5, role: "dealer" },
    { name: "전설 기물", row: 3, col: 6, role: "dealer" },
  ],
};

export default function TftBoard({ keyChampions }: TftBoardProps) {
  const [activeLevel, setActiveLevel] = useState<4 | 6 | 8>(8);
  const currentSquad = LEVEL_SQUAD_DATA[activeLevel];

  // 핵심 챔피언 이름을 분할하여 메인 캐리에 매핑
  const championNames = keyChampions.split(",").map((s) => s.trim());

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      {/* 상단 탭 컨트롤러 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗺️</span> 전장 배치도 & 빌드업 스쿼드
          </h2>
          <p className="text-xs text-gray-400">레벨별 추천 배치 좌표 및 기물 위치를 확인하세요.</p>
        </div>

        <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
          {[4, 6, 8].map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level as 4 | 6 | 8)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeLevel === level
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {level}레벨
            </button>
          ))}
        </div>
      </div>

      {/* 28칸 TFT 육각형 형태 전장 보드 (4행 7열) */}
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800/80 overflow-x-auto">
        <div className="min-w-[500px] flex flex-col gap-2 items-center">
          {[0, 1, 2, 3].map((rowIndex) => (
            <div
              key={rowIndex}
              className={`flex gap-2.5 ${
                rowIndex % 2 === 1 ? "pl-6" : "" // 홀수 행지그재그 어긋남 시각화 (Hex Grid 느낌)
              }`}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((colIndex) => {
                const champ = currentSquad.find(
                  (c) => c.row === rowIndex && c.col === colIndex
                );

                // 메인 캐리 이름 적용
                let displayName = champ?.name;
                if (champ?.role === "dealer" && championNames.length > 0) {
                  displayName = championNames[colIndex % championNames.length] || champ.name;
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${
                      champ
                        ? champ.role === "tank"
                          ? "bg-amber-950/60 border-amber-500/60 text-amber-300 font-bold shadow-md shadow-amber-950/50 scale-105"
                          : champ.role === "dealer"
                          ? "bg-indigo-950/60 border-indigo-500/60 text-indigo-300 font-bold shadow-md shadow-indigo-950/50 scale-105"
                          : "bg-teal-950/60 border-teal-500/60 text-teal-300 font-bold scale-105"
                        : "bg-gray-900/40 border-gray-800/60 text-gray-700"
                    }`}
                  >
                    {champ ? (
                      <span className="text-[10px] text-center leading-tight truncate w-full">
                        {displayName}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-800 font-mono">·</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 가이드 */}
      <div className="flex items-center justify-end gap-4 text-[11px] text-gray-400 font-mono pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 전열(탱커)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> 후열(캐리)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> 유틸/서폿
        </span>
      </div>
    </div>
  );
}
