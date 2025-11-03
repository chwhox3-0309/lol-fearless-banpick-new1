'use client';

import { useState, useEffect } from 'react';

const fortunes = [
  "오늘은 팀원들과의 완벽한 호흡으로 승리할 거예요!",
  "당신의 뛰어난 리더십이 팀을 승리로 이끌 거예요.",
  "예상치 못한 행운의 플레이가 당신을 기다리고 있어요.",
  "오늘은 당신의 캐리력을 마음껏 뽐낼 수 있는 날이에요.",
  "팀원들의 칭찬이 쏟아지는 하루가 될 거예요.",
  "패배의 위기에서 팀을 구해낼 영웅은 바로 당신!",
  "오늘은 적의 모든 스킬을 피할 수 있는 신들린 무빙을 보여줄 거예요.",
  "당신의 오더가 한타를 승리로 이끌 거예요.",
  "오늘은 펜타킬의 주인공이 될지도 몰라요!",
  "팀원들과의 유쾌한 소통이 승리의 열쇠가 될 거예요.",
];

export default function DailyFortune() {
  const [fortune, setFortune] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const fortuneIndex = dayOfYear % fortunes.length;
    setFortune(fortunes[fortuneIndex]);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-yellow-300">오늘의 롤 팀 운세</h2>
      <p className="text-lg text-gray-300">{fortune}</p>
    </div>
  );
}
