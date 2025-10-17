'use client';

import { useState, useEffect } from 'react';


import Link from 'next/link';
import NoticeBanner from './components/NoticeBanner';
import AdsenseBanner from './components/AdsenseBanner'; // 광고 컴포넌트 import
import ChampionGrid from './components/ChampionGrid';
import TeamDisplay from './components/TeamDisplay';
import { useDraft } from './context/DraftContext';

export default function Home() {
  const {
    version,
    blueTeamPicks,
    redTeamPicks,
    blueTeamBans,
    redTeamBans,
    currentTurnIndex,
    searchTerm,
    completedDrafts,
    isSearchSticky,
    isAccordionOpen,
    searchBarRef,
    activeTab,
    setSearchTerm,
    setIsAccordionOpen,
    setActiveTab,
    handleChampionClick,
    handleNextSet,
    handleResetAll,
    handleUndoLastAction,
    handleLoadSummoner,
    getAllSelectedChampions,
    filteredChampions,
    currentTurnInfo,
    BAN_PICK_SEQUENCE,
  } = useDraft();

  // AdSense 정책 위반 방지를 위한 콘텐츠 로딩 상태
  const [isContentReady, setIsContentReady] = useState(false);

  useEffect(() => {
    // 챔피언 데이터가 로드되면 콘텐츠가 준비된 것으로 간주
    if (filteredChampions && filteredChampions.length > 0) {
      // 약간의 딜레이를 주어 렌더링을 확실히 보장
      const timer = setTimeout(() => {
        setIsContentReady(true);
      }, 500); // 0.5초 딜레이
      return () => clearTimeout(timer);
    }
  }, [filteredChampions]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 p-4 shadow-md z-50 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0 text-center sm:text-left">롤 밴픽 시뮬레이터</h1>
        <div className="flex flex-wrap justify-center sm:flex-nowrap sm:space-x-4 space-y-2 sm:space-y-0">
          <Link href="/notices" className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center">
            공지사항
          </Link>
          <button
            onClick={handleNextSet}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            다음 세트
          </button>
          <button
            onClick={handleResetAll}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            전부 초기화
          </button>
          <button
            onClick={handleUndoLastAction}
            disabled={currentTurnIndex === 0}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            선택 취소
          </button>
          <button
            onClick={handleLoadSummoner}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            소환사명으로 불러오기
          </button>
        </div>
      </nav>

      <div className="pt-24 sm:pt-20">
        <NoticeBanner />
        {/* 콘텐츠가 준비되었을 때만 광고를 표시합니다 */}
        {isContentReady && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-0">
            <AdsenseBanner />
          </div>
        )}
      </div>

      <main className="flex-grow flex flex-col">
        {/* Tab navigation for mobile */}
        <div className="flex border-b border-gray-700 lg:hidden">
          <button onClick={() => setActiveTab('blue')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'blue' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
            블루 팀
          </button>
          <button onClick={() => setActiveTab('champions')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'champions' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
            챔피언 선택
          </button>
          <button onClick={() => setActiveTab('red')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'red' ? 'bg-gray-700 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
            레드 팀
          </button>
        </div>

        <div className="flex-grow flex flex-1 lg:grid lg:grid-cols-4">
          <div className={`${activeTab === 'blue' ? 'block' : 'hidden'} w-full lg:block lg:col-span-1`}>
            <TeamDisplay
              teamName="블루 팀"
              teamColor="text-blue-400"
              teamType="blue"
            />
          </div>

          <div className={`${activeTab === 'champions' ? 'block' : 'hidden'} w-full lg:block lg:col-span-2`}>
            <ChampionGrid />
          </div>

          <div className={`${activeTab === 'red' ? 'block' : 'hidden'} w-full lg:block lg:col-span-1`}>
            <TeamDisplay
              teamName="레드 팀"
              teamColor="text-red-400"
              teamType="red"
            />
          </div>
        </div>

        <section className="w-full max-w-5xl mx-auto p-4 sm:p-8 mt-8 space-y-8">
          {/* Always visible content */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h2 class="text-2xl sm:text-3xl font-bold mb-4 text-blue-300">프로처럼 연습하는 Fearless 밴픽 시뮬레이터</h2>
            <p className="text-center text-gray-300 mb-6 max-w-3xl mx-auto">
              리그 오브 레전드 프로 경기에서 사용되는 '피어리스(Fearless)' 룰을 직접 경험하고 전략을 연마하세요. 이전 세트에서 사용한 챔피언은 다음 세트에서 다시 선택할 수 없어, 매번 새로운 전략이 필요합니다.
            </p>
            <div className="space-y-6 text-lg leading-relaxed text-left">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Fearless 밴픽이란?</h3>
                <p>
                  프로 리그 오브 레전드 경기에서 사용되는 규칙으로, 이전 세트에서 사용했던 챔피언을 다음 세트에서 다시 선택할 수 없게 하여 매 경기 다른 전략과 챔피언 조합을 유도하는 방식입니다. 이 시뮬레이터는 바로 그 Fearless 룰을 적용하여, 여러분의 전략적 깊이를 한층 더 끌어올릴 수 있도록 돕습니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">활용법</h3>
                <p>
                  친구들과 함께 LCK, LPL 등 프로 리그의 밴픽을 직접 체험하고, 자신만의 전략을 만들어보세요! 이 도구를 통해 여러분은 단순한 플레이어를 넘어, 경기의 흐름을 읽는 전략가가 될 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Accordion for detailed strategies */}
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex justify-between items-center p-6 text-xl sm:text-2xl font-semibold text-left focus:outline-none"
            >
              <span>세부 전략 가이드 (클릭)</span>
              <span className={`transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${isAccordionOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
              <div className="p-6 border-t border-gray-700 space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">기본 전략</h3>
                  <ul className="list-disc list-inside text-lg space-y-2">
                    <li><strong>O.P. 챔피언 관리:</strong> 초반 세트에 강력한 O.P. 챔피언을 먼저 밴하거나 픽해서 상대의 선택지를 줄이는 것이 중요합니다.</li>
                    <li><strong>챔피언 폭 활용:</strong> 여러 포지션을 소화할 수 있는 유틸리티 챔피언을 확보하여 후반 세트의 밴픽을 유연하게 만드세요.</li>
                    <li><strong>상대의 픽 예측:</strong> 상대의 이전 픽을 기억하고, 어떤 챔피언이 금지될지 예측하여 다음 픽을 준비하는 것이 승리의 열쇠입니다.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">고급 전략</h3>
                  <ul className="list-disc list-inside text-lg space-y-2">
                    <li><strong>상대방 챔피언 폭 저격 밴:</strong> 상대방의 주요 챔피언을 밴하여 플레이를 제한합니다.</li>
                    <li><strong>선픽 유도 전략:</strong> 특정 챔피언을 먼저 픽하여 상대방의 밴픽을 유도합니다.</li>
                    <li><strong>조합 시너지 극대화:</strong> 아군 챔피언 간의 시너지를 고려하여 밴픽을 진행합니다.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">챔피언별 팁 (예시)</h3>
                  <ul className="list-disc list-inside text-lg space-y-2">
                    <li><strong>라이즈:</strong> 상대방이 라이즈를 밴하지 않았다면, 강력한 후반 캐리력을 위해 선픽을 고려할 수 있습니다.</li>
                    <li><strong>아칼리:</strong> 상대방이 AP 챔피언을 많이 픽했다면, 아칼리를 밴하여 상대방의 조합을 약화시킬 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}