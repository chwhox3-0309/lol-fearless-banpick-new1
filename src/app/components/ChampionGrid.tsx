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
    permanentlyBannedChampions,
    handleChampionClick,
    searchTerm,
    setSearchTerm,
    filteredChampions,
  } = useDraft();

  return (
    <div className="flex-1 p-4 lg:col-span-2 h-[80vh] overflow-y-scroll">
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

      <div className="sticky top-0 z-40 bg-gray-900 py-4">
        <input
          type="text"
          placeholder="챔피언 검색..."
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 mt-4">
        {filteredChampions.length === 0 && searchTerm !== '' ? (
          <p className="col-span-full text-center text-gray-400">"{searchTerm}"에 대한 검색 결과가 없습니다.</p>
        ) : filteredChampions.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">챔피언 데이터를 불러오는 중입니다...</p>
        ) : (
          filteredChampions.map((champion) => {
            const isPermanentlyBanned = permanentlyBannedChampions.includes(champion.id);
            const isSelected = getAllSelectedChampions.includes(champion.id);
            const isSelectable = !isSelected && currentTurnIndex < BAN_PICK_SEQUENCE.length;

            return (
              <div
                key={champion.id}
                className={`flex flex-col items-center cursor-pointer hover:scale-105 transition-all duration-200 relative ${
                  !isSelectable ? 'opacity-40 grayscale cursor-not-allowed' : ''
                }`}
                onClick={() => isSelectable && handleChampionClick(champion.id)}
              >
                <div className={`w-10 h-10 relative rounded-md overflow-hidden ${isPermanentlyBanned ? 'border-2 border-red-600' : ''}`}>
                  {version && (
                    <Image
                      src={getChampionThumbnailUrl(version, champion.id)}
                      alt={champion.id}
                      fill
                      className="object-cover"
                    />
                  )}
                  {isPermanentlyBanned && (
                    <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white text-center leading-tight">PERMA<br/>BAN</span>
                    </div>
                  )}
                </div>
                <p className={`text-[10px] text-center mt-1 truncate w-full ${isPermanentlyBanned ? 'text-red-400 font-bold' : ''}`}>
                  {champion.name}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}