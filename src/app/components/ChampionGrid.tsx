'use client';

import Image from 'next/image';
import { getChampionThumbnailUrl } from '@/lib/riot-api';
import { useDraft } from '../context/DraftContext';

export default function ChampionGrid() {
  const {
    version,
    currentTurnIndex,
    BAN_PICK_SEQUENCE,
    currentTurnInfo,
    getAllSelectedChampions,
    handleChampionClick,
    searchBarRef,
    isSearchSticky,
    searchTerm,
    setSearchTerm,
    filteredChampions,
  } = useDraft();

  return (
    <div className="flex-1 p-4 overflow-y-auto lg:col-span-2">
      <h1 className="text-2xl font-bold text-center mb-4">챔피언 선택</h1>
      <p className="text-center text-gray-400 mb-4">LoL Fearless Banpick은 프로 경기의 Fearless 밴픽 방식을 연습하는 시뮬레이터입니다. 이전 세트에서 사용한 챔피언은 다시 선택할 수 없습니다.</p>
      {currentTurnIndex < BAN_PICK_SEQUENCE.length ? (
        <p className="text-center mb-4">
          현재 턴: <span className={currentTurnInfo.team === 'blue' ? 'text-blue-400' : 'text-red-400'}>
            {currentTurnInfo.team.toUpperCase()} 팀
          </span> - {currentTurnInfo.type.toUpperCase()}
        </p>
      ) : (
        <p className="text-center mb-4 text-green-400">밴픽 완료!</p>
      )}

      <div ref={searchBarRef} className={`transition-all duration-300 ${isSearchSticky ? 'fixed top-16 left-1/4 right-1/4 z-40 bg-gray-900 p-4 rounded-b-lg shadow-lg' : ''}`}>
        <input
          type="text"
          placeholder="챔피언 검색..."
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isSearchSticky && <div className="mb-4" style={{ height: searchBarRef.current ? searchBarRef.current.offsetHeight : 'auto' }}></div>}

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 mt-4">
        {filteredChampions.map((champion) => (
          <div
            key={champion.id}
            className={`flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200 ${
              getAllSelectedChampions.includes(champion.id) ||
              currentTurnIndex >= BAN_PICK_SEQUENCE.length
                ? 'opacity-50 cursor-not-allowed grayscale'
                : ''
            }`}
            onClick={() => handleChampionClick(champion.id)}
          >
            {version && (
              <Image
                src={getChampionThumbnailUrl(version, champion.id)}
                alt={champion.id}
                width={64}
                height={64}
                className="rounded-md"
              />
            )}
            <p className="text-xs text-center mt-1">{champion.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}