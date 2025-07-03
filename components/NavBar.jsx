'use client';

import React from 'react';

export default function NavBar({
  onNextSet,
  onResetAll,
  onLoadSummoner,
  onLanguageChange,
  currentLanguage,
}) {
  return (
    <nav className="bg-gray-800 p-4 flex flex-col sm:flex-row justify-between items-center">
      <div className="flex space-x-4 mb-2 sm:mb-0">
        <button
          onClick={onNextSet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          다음 세트
        </button>
        <button
          onClick={onResetAll}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          전부 초기화
        </button>
        <button
          onClick={onLoadSummoner}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          소환사명으로 불러오기
        </button>
      </div>
      <div className="flex space-x-2">
        <select
          onChange={(e) => onLanguageChange(e.target.value)}
          value={currentLanguage}
          className="bg-gray-700 text-white py-2 px-4 rounded"
        >
          <option value="ko_KR">한국어</option>
          <option value="en_US">English</option>
          <option value="ja_JP">日本語</option>
        </select>
      </div>
    </nav>
  );
}
