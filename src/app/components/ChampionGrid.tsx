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

      <div className="sticky top-16 z-40 bg-gray-900 py-4">
        <input
          type="text"
          placeholder="챔피언 검색..."
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mt-4">
        {filteredChampions.length === 0 && searchTerm !== '' ? (
          <p className="col-span-full text-center text-gray-400">"{searchTerm}"에 대한 검색 결과가 없습니다.</p>
        ) : filteredChampions.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">챔피언 데이터를 불러오는 중입니다...</p>
        ) : (
          filteredChampions.map((champion) => (
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
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
              {version && (
                <Image
                  src={getChampionThumbnailUrl(version, champion.id)}
                  alt={champion.id}
                  fill
                  className="rounded-md object-cover"
                />
              )}
            </div>
            <p className="text-xs text-center mt-1">{champion.name}</p>
          </div>
        )))}
      </div>
    </div>
  );
}