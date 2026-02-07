'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import NoticeBanner from './components/NoticeBanner';
import LatestPostBanner from './components/LatestPostBanner';
import AdsenseBanner from './components/AdsenseBanner';
import ChampionGrid from './components/ChampionGrid';
import TeamDisplay from './components/TeamDisplay';
import ShareModal from './components/ShareModal';
import BulkBanModal from './components/BulkBanModal';
import DailyFortune from './components/DailyFortune';
import DraftTip from './components/DraftTip';
import DraftConfigurator from './components/DraftConfigurator';
import { useDraft } from './context/DraftContext';

export default function Home() {
  const {
    draft,
    config,
    currentTurnIndex,
    completedDrafts,
    isAccordionOpen,
    activeTab,
    setIsAccordionOpen,
    setActiveTab,
    handleNextSet,
    handleResetAll,
    handleUndoLastAction,
    handleRegisterUsedChampions,
    filteredChampions,
    teamSideMapping,
  } = useDraft();

  const [isContentReady, setIsContentReady] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isBulkBanModalOpen, setIsBulkBanModalOpen] = useState(false);
  
    useEffect(() => {
      if (filteredChampions && filteredChampions.length > 0) {
        setIsContentReady(true);
      }
    }, [filteredChampions]);

  const handleShareUrl = () => {
    const stateToShare = {
      draft,
      completedDrafts,
      config,
    };
    const jsonState = JSON.stringify(stateToShare);
    const base64State = btoa(encodeURIComponent(jsonState));
    const url = `${window.location.origin}/?data=${base64State}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('공유 URL이 클립보드에 복사되었습니다!');
      setIsShareModalOpen(false);
    });
  };

  const handleRegisterUsedChampionsConfirm = (championNames: string) => {
    const { message } = handleRegisterUsedChampions(championNames);
    setIsBulkBanModalOpen(false);
    alert(message);
  };

  const blueSideTeamId = teamSideMapping.team1 === 'blue' ? 'team1' : 'team2';
  const redSideTeamId = teamSideMapping.team1 === 'red' ? 'team1' : 'team2';

  const blueSideTeamName = blueSideTeamId === 'team1' ? config.team1Name : config.team2Name;
  const redSideTeamName = redSideTeamId === 'team1' ? config.team1Name : config.team2Name;

  const blueSideData = draft[blueSideTeamId] || { picks: [], bans: [] };
  const redSideData = draft[redSideTeamId] || { picks: [], bans: [] };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {isShareModalOpen && (
        <ShareModal
          onClose={() => setIsShareModalOpen(false)}
          onShareUrl={handleShareUrl}
        />
      )}
      {isBulkBanModalOpen && (
        <BulkBanModal
          onClose={() => setIsBulkBanModalOpen(false)}
          onConfirm={handleRegisterUsedChampionsConfirm}
        />
      )}


      <div className="">
        <nav className="bg-gray-800 p-4 shadow-md flex flex-col sm:flex-row sm:justify-center sm:items-center">
          <div className="flex flex-wrap justify-center sm:flex-nowrap sm:space-x-4 space-y-2 sm:space-y-0">
            <Link href="/notices" className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center">
              공지사항
            </Link>
            <Link href="/recommended-bans" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-center">
              추천 밴
            </Link>
            <Link href="/tier-lists" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded text-center">
              티어 리스트
            </Link>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
            >
              공유하기
            </button>
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
              onClick={() => setIsBulkBanModalOpen(true)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              대량 등록
            </button>
          </div>
        </nav>
        <LatestPostBanner />
        <NoticeBanner />
        {isContentReady && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-0">
            <AdsenseBanner />
          </div>
        )}
      </div>

      <main className="flex-grow flex flex-col">
        <DraftConfigurator />
        <div className="flex border-b border-gray-700 lg:hidden">
          <button onClick={() => setActiveTab('blue')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'blue' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
            {blueSideTeamName} (블루)
          </button>
          <button onClick={() => setActiveTab('champions')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'champions' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
            챔피언 선택
          </button>
          <button onClick={() => setActiveTab('red')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'red' ? 'bg-gray-700 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
            {redSideTeamName} (레드)
          </button>
        </div>

        <div className={`flex-grow flex flex-1 lg:grid lg:grid-cols-4`}>
          <div className={`${activeTab === 'blue' ? 'block' : 'hidden'} w-full lg:block lg:col-span-1`}>
            <TeamDisplay
              teamName={blueSideTeamName}
              teamColor="text-blue-400"
              teamType="blue"
              picks={blueSideData.picks}
              bans={blueSideData.bans}
            />
          </div>

          <div className={`${activeTab === 'champions' ? 'block' : 'hidden'} w-full lg:block lg:col-span-2`}>
            <ChampionGrid />
          </div>

          <div className={`${activeTab === 'red' ? 'block' : 'hidden'} w-full lg:block lg:col-span-1`}>
            <TeamDisplay
              teamName={redSideTeamName}
              teamColor="text-red-400"
              teamType="red"
              picks={redSideData.picks}
              bans={redSideData.bans}
            />
          </div>
        </div>

        <section className="w-full max-w-5xl mx-auto p-4 sm:p-8 mt-8 space-y-8">
          <DraftTip />
          <DailyFortune />

          {/* 주요 기능 소개 섹션 */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 text-teal-300">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base sm:text-lg">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-base sm:text-xl mb-2">완벽한 Fearless 룰 구현</h3>
                <p className="text-sm sm:text-base text-gray-300">이전 세트에서 사용한 챔피언은 다음 세트에서 자동으로 비활성화되어, 실제 프로 경기와 동일한 조건에서 밴픽을 연습할 수 있습니다.</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-base sm:text-xl mb-2">밴픽 결과 공유</h3>
                <p className="text-sm sm:text-base text-gray-300">'공유하기' 기능을 통해 생성된 URL로 친구나 팀원과 밴픽 결과를 간편하게 공유하고 전략을 논의할 수 있습니다.</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-base sm:text-xl mb-2">대량 챔피언 등록</h3>
                <p className="text-sm sm:text-base text-gray-300">대회나 스크림에서 이미 사용된 챔피언들을 '대량 등록' 기능을 사용해 한 번에 비활성화 처리하여 시뮬레이션을 빠르게 준비할 수 있습니다.</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-base sm:text-xl mb-2">전략적 데이터 제공</h3>
                <p className="text-sm sm:text-base text-gray-300">'추천 밴' 및 '티어 리스트' 페이지와 연동하여, 데이터에 기반한 더 깊이 있는 밴픽 전략을 수립할 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* 자주 묻는 질문 (FAQ) 섹션 */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 text-orange-300">자주 묻는 질문 (FAQ)</h2>
            <div className="space-y-4 text-base sm:text-lg">
              <div>
                <h3 className="font-semibold text-base sm:text-xl mb-2">Q. 피어리스(Fearless) 룰이 정확히 무엇인가요?</h3>
                <p className="text-sm sm:text-base text-gray-300">A. 다전제 경기(예: 3전 2선승제)에서, 이전 세트에 양 팀이 사용했던 모든 챔피언을 다음 세트에서 다시 선택할 수 없도록 금지하는 규칙입니다. 이는 더 다양한 챔피언의 등장과 전략적인 밴픽 구도를 유도합니다.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-xl mb-2">Q. '다음 세트'는 언제 사용하나요?</h3>
                <p className="text-sm sm:text-base text-gray-300">A. 한 세트의 밴픽이 모두 완료된 후 '다음 세트' 버튼을 누르면, 해당 세트에서 사용된 10개의 챔피언이 자동으로 비활성화 목록에 추가됩니다. 이어서 다음 경기의 밴픽을 곧바로 시작할 수 있습니다.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-xl mb-2">Q. 모바일에서도 사용이 가능한가요?</h3>
                <p className="text-sm sm:text-base text-gray-300">A. 네, 가능합니다. 이 시뮬레이터는 PC와 모바일 환경 모두에 최적화되어 있어 언제 어디서든 편리하게 밴픽을 연습할 수 있습니다. 화면 크기에 따라 최적의 레이아웃을 제공합니다.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 text-blue-300">프로처럼 연습하는 Fearless 밴픽 시뮬레이터</h2>
            <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
              리그 오브 레전드 프로 경기에서 사용되는 '피어리스(Fearless)' 룰을 직접 경험하고 전략을 연마하세요. 이전 세트에서 사용한 챔피언은 다음 세트에서 다시 선택할 수 없어, 매번 새로운 전략이 필요합니다.
            </p>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-left">
              <div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">Fearless 밴픽이란?</h3>
                <p>
                  프로 리그 오브 레전드 경기에서 사용되는 규칙으로, 이전 세트에서 사용했던 챔피언을 다음 세트에서 다시 선택할 수 없게 하여 매 경기 다른 전략과 챔피언 조합을 유도하는 방식입니다. 이 시뮬레이터는 바로 그 Fearless 룰을 적용하여, 여러분의 전략적 깊이를 한층 더 끌어올릴 수 있도록 돕습니다.
                </p>
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">활용법</h3>
                <p>
                  친구들과 함께 LCK, LPL 등 프로 리그의 밴픽을 직접 체험하고, 자신만의 전략을 만들어보세요! 이 도구를 통해 여러분은 단순한 플레이어를 넘어, 경기의 흐름을 읽는 전략가가 될 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg">
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex justify-between items-center p-6 text-base sm:text-2xl font-semibold text-left focus:outline-none"
            >
              <span>세부 전략 가이드 (클릭)</span>
              <span className={`transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${isAccordionOpen ? 'max-h-screen' : 'max-h-0'}`}>
              <div className="p-6 border-t border-gray-700 space-y-6">
                <div>
                  <h3 className="text-base sm:text-xl font-semibold mb-2">기본 전략</h3>
                  <ul className="list-disc list-inside text-sm sm:text-lg space-y-2">
                    <li><strong>O.P. 챔피언 관리:</strong> 초반 세트에 강력한 O.P. 챔피언을 먼저 밴하거나 픽해서 상대의 선택지를 줄이는 것이 중요합니다.</li>
                    <li><strong>챔피언 폭 활용:</strong> 여러 포지션을 소화할 수 있는 유틸리티 챔피언을 확보하여 후반 세트의 밴픽을 유연하게 만드세요.</li>
                    <li><strong>상대의 픽 예측:</strong> 상대의 이전 픽을 기억하고, 어떤 챔피언이 금지될지 예측하여 다음 픽을 준비하는 것이 승리의 열쇠입니다.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-semibold mb-2">고급 전략</h3>
                  <ul className="list-disc list-inside text-sm sm:text-lg space-y-2">
                    <li><strong>상대방 챔피언 폭 저격 밴:</strong> 상대방의 주요 챔피언을 밴하여 플레이를 제한합니다.</li>
                    <li><strong>선픽 유도 전략:</strong> 특정 챔피언을 먼저 픽하여 상대방의 밴픽을 유도합니다.</li>
                    <li><strong>조합 시너지 극대화:</strong> 아군 챔피언 간의 시너지를 고려하여 밴픽을 진행합니다.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-semibold mb-2">챔피언별 팁 (예시)</h3>
                  <ul className="list-disc list-inside text-sm sm:text-lg space-y-2">
                    <li><strong>라이즈:</strong> 상대방이 라이즈를 밴하지 않았다면, 강력한 후반 캐리력을 위해 선픽을 고려할 수 있습니다.</li>
                    <li><strong>아칼리:</strong> 상대방이 AP 챔피언을 많이 픽했다면, 아칼리를 밴하여 상대방의 조합을 약화시킬 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full max-w-5xl mx-auto p-4 sm:p-6 text-center">
            <h1 className="text-xl sm:text-4xl font-bold mb-4 text-blue-300">리그 오브 레전드 Fearless 밴픽 시뮬레이터</h1>
            <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-4xl mx-auto">
                프로 경기의 짜릿함을 그대로! LCK, LPL 등 전 세계 리그 오브 레전드 프로 리그에서 사용되는 '피어리스(Fearless)' 룰 기반의 밴픽을 직접 시뮬레이션하고 전략을 완성하세요. 매 세트 새로운 챔피언 조합을 구상하며 당신의 전략적 한계에 도전해보세요.
            </p>
            <p className="text-sm sm:text-md text-gray-400">
                이 도구는 실제 경기처럼 블루 팀과 레드 팀으로 나뉘어 밴과 픽을 차례대로 진행합니다. '다음 세트' 버튼을 누르면 이전 세트에서 사용된 모든 챔피언이 비활성화되어, 더욱 깊이 있는 챔피언 폭과 전략적 사고를 요구합니다. 친구들과 함께 다양한 시나리오를 테스트하고 최적의 조합을 찾아보세요.
            </p>
        </section>
      </main>
    </div>
  );
}
