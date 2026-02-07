"use client";

import { useState, useCallback } from "react";
import KakaoAdFitBanner from "../components/KakaoAdFitBanner";

const LANES = ["탑", "정글", "미드", "원딜", "서폿"];

// Fisher-Yates (Knuth) shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

interface LaneAssignment {
  player: string;
  lane: string;
}

export default function LadderClientPage() {
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<string[]>(
    Array(5).fill("")
  );
  const [redTeamPlayers, setRedTeamPlayers] = useState<string[]>(
    Array(5).fill("")
  );
  const [blueTeamAssignments, setBlueTeamAssignments] = useState<
    LaneAssignment[] | null
  >(null);
  const [redTeamAssignments, setRedTeamAssignments] = useState<
    LaneAssignment[] | null
  >(null);

  const handlePlayerNameChange = useCallback(
    (team: "blue" | "red", index: number, value: string) => {
      if (team === "blue") {
        setBlueTeamPlayers((prev) => {
          const newPlayers = [...prev];
          newPlayers[index] = value;
          return newPlayers;
        });
      } else {
        setRedTeamPlayers((prev) => {
          const newPlayers = [...prev];
          newPlayers[index] = value;
          return newPlayers;
        });
      }
    },
    []
  );

  const assignLanes = useCallback((players: string[]): LaneAssignment[] => {
    const activePlayers = players.filter((name) => name.trim() !== "");
    if (activePlayers.length === 0) return [];

    const shuffledPlayers = shuffleArray([...activePlayers]);
    const assignments: LaneAssignment[] = [];

    for (let i = 0; i < shuffledPlayers.length; i++) {
      assignments.push({
        player: shuffledPlayers[i],
        lane: LANES[i],
      });
    }
    return assignments;
  }, []);

  const handleRandomStart = useCallback(() => {
    setBlueTeamAssignments(assignLanes(blueTeamPlayers));
    setRedTeamAssignments(assignLanes(redTeamPlayers));
  }, [blueTeamPlayers, redTeamPlayers, assignLanes]);

  const handleReset = useCallback(() => {
    setBlueTeamPlayers(Array(5).fill(""));
    setRedTeamPlayers(Array(5).fill(""));
    setBlueTeamAssignments(null);
    setRedTeamAssignments(null);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        랜덤 라인 CK
      </h1>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            블루 팀
          </h2>
          <div className="space-y-3">
            {blueTeamPlayers.map((player, index) => (
              <input
                key={`blue-${index}`}
                type="text"
                placeholder={`블루 팀 ${index + 1}번 플레이어 이름`}
                value={player}
                onChange={(e) =>
                  handlePlayerNameChange("blue", index, e.target.value)
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
        </div>

        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-red-400">레드 팀</h2>
          <div className="space-y-3">
            {redTeamPlayers.map((player, index) => (
              <input
                key={`red-${index}`}
                type="text"
                placeholder={`레드 팀 ${index + 1}번 플레이어 이름`}
                value={player}
                onChange={(e) =>
                  handlePlayerNameChange("red", index, e.target.value)
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={handleRandomStart}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          랜덤 시작
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          초기화
        </button>
      </div>

      {(blueTeamAssignments || redTeamAssignments) && (
        <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center mb-6 text-white">
            매칭 결과
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-3 text-blue-400">
                블루 팀
              </h3>
              {blueTeamAssignments && blueTeamAssignments.length > 0 ? (
                <ul className="space-y-2">
                  {blueTeamAssignments.map((assignment, index) => (
                    <li
                      key={`blue-assignment-${index}`}
                      className="text-lg text-white bg-gray-800 p-3 rounded-md flex justify-between items-center"
                    >
                      <span>{assignment.lane}: {assignment.player}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">
                  블루 팀 플레이어가 없습니다.
                </p>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-3 text-red-400">
                레드 팀
              </h3>
              {redTeamAssignments && redTeamAssignments.length > 0 ? (
                <ul className="space-y-2">
                  {redTeamAssignments.map((assignment, index) => (
                    <li
                      key={`red-assignment-${index}`}
                      className="text-lg text-white bg-gray-800 p-3 rounded-md flex justify-between items-center"
                    >
                      <span>{assignment.lane}: {assignment.player}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">레드 팀 플레이어가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
      <KakaoAdFitBanner adUnit="DAN-SQynyBb84UUnztYC" width="300" height="250" />
    </div>
  );
}
