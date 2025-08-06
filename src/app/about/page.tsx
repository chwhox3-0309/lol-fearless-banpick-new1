'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-16">
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">LoL Fearless Banpick 소개</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">서비스 개요</h2>
          <p className="text-lg leading-relaxed">
            LoL Fearless Banpick은 리그 오브 레전드(LoL) 플레이어들이 프로 경기와 같은 "Fearless" 밴픽 방식을 연습하고 시뮬레이션할 수 있도록 돕는 웹 애플리케이션입니다. Fearless 밴픽은 이전 세트에서 사용했던 챔피언을 다시 선택할 수 없는 규칙으로, 전략의 깊이를 더하고 다양한 챔피언 활용을 유도합니다.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
          <ul className="list-disc list-inside text-lg space-y-2">
            <li><strong>실시간 밴픽 시뮬레이션:</strong> 실제 경기와 동일한 순서로 밴과 픽을 진행할 수 있습니다.</li>
            <li><strong>Fearless 규칙 적용:</strong> 이전 세트에서 사용된 챔피언은 다음 세트에서 자동으로 비활성화됩니다.</li>
            <li><strong>챔피언 데이터 제공:</strong> 라이엇 API와 연동하여 최신 챔피언 정보를 제공합니다.</li>
            <li><strong>다양한 언어 지원:</strong> 한국어, 영어, 일본어, 중국어를 지원하여 전 세계 사용자들이 이용할 수 있습니다. (현재는 한국어만 지원)</li>
            <li><strong>이전 밴픽 기록:</strong> 진행한 밴픽 기록을 로컬에 저장하고 검토할 수 있습니다.</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">사용 방법</h2>
          <ol className="list-decimal list-inside text-lg space-y-2">
            <li><strong>밴픽 시작:</strong> 메인 페이지에서 밴픽 시뮬레이션을 시작합니다.</li>
            <li><strong>챔피언 선택:</strong> 현재 턴에 맞춰 챔피언을 선택하여 밴 또는 픽을 진행합니다.</li>
            <li><strong>다음 세트 진행:</strong> 한 세트의 밴픽이 완료되면 "다음 세트" 버튼을 눌러 Fearless 규칙이 적용된 새로운 밴픽을 시작할 수 있습니다.</li>
            <li><strong>초기화:</strong> "전부 초기화" 버튼을 누르면 모든 밴픽 기록이 삭제됩니다.</li>
          </ol>
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300 font-bold text-xl">
            &larr; 밴픽 시뮬레이터로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
