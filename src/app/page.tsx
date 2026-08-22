'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import NoticeBanner from './components/NoticeBanner';
import LatestPostBanner from './components/LatestPostBanner';
import ChampionGrid from './components/ChampionGrid';
import TeamDisplay from './components/TeamDisplay';
import ShareModal from './components/ShareModal';
import BulkBanModal from './components/BulkBanModal';
import DailyFortune from './components/DailyFortune';
import DraftTip from './components/DraftTip';
import DraftConfigurator from './components/DraftConfigurator';
import { useDraft } from './context/DraftContext';
import { getChampionThumbnailUrl } from '@/lib/riot-api';

const AP_CHAMPIONS = new Set([
  'Ahri', 'Akali', 'Anivia', 'Annie', 'AurelionSol', 'Azir', 'Cassiopeia', 'ChoGath', 
  'Diana', 'Ekko', 'Evelynn', 'Fiddlesticks', 'Fizz', 'Galio', 'Gragas', 'Gwen', 
  'Heimerdinger', 'Hwei', 'Ivern', 'Janna', 'Karma', 'Karthus', 'Kassadin', 'Katarina', 
  'Kayle', 'Kennen', 'KogMaw', 'LeBlanc', 'Lillia', 'Lissandra', 'Lulu', 'Lux', 
  'Malzahar', 'Maokai', 'MordeKaiser', 'Morgana', 'Nami', 'Neeko', 'Nidalee', 'Nunu', 
  'Orianna', 'Rumble', 'Ryze', 'Syndra', 'Sylas', 'Taliyah', 'Teemo', 'TwistedFate', 
  'Veigar', 'VelKoz', 'Vex', 'Viktor', 'Vladimir', 'Xerath', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
]);

export default function Home() {
  const {
    version,
    champions,
    draft,
    config,
    currentTurnIndex,
    completedDrafts,
    permanentlyBannedChampions,
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
    BAN_PICK_SEQUENCE,
    getAllSelectedChampions,
  } = useDraft();

  // 1. 접속 시 바로 뜨지 않도록 기본값을 false로 변경
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false); // 경기 설정 완료 여부

  const [isContentReady, setIsContentReady] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBulkBanModalOpen, setIsBulkBanModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const currentSetNumber = (completedDrafts?.length || 0) + 1;
  const baseSets = config?.totalSets || config?.maxSets || 3;
  const targetSets = Math.max(baseSets, currentSetNumber);
  const calculatedBo = targetSets % 2 === 0 ? targetSets + 1 : targetSets;
  const matchTypeLabel = `BO${calculatedBo}`;

  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const isFirstRender = useRef(true);

  // 밴픽 종료 여부
  const isDraftFinished = currentTurnIndex >= (BAN_PICK_SEQUENCE?.length || 20);

  useEffect(() => {
    if (currentTurnIndex > 0) {
      setIsConfigOpen(false);
      setIsConfigured(true);
    }
  }, [currentTurnIndex]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isDraftFinished && isTimerRunning) {
      setTimeLeft(30);
    } else if (isDraftFinished) {
      setIsTimerRunning(false);
      setTimeLeft(0);
    }
  }, [currentTurnIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0 && !isDraftFinished) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, isDraftFinished]);

  const onNextSetWithTimerReset = () => {
    handleNextSet();
    setTimeLeft(30);
    setIsTimerRunning(false);
    setIsConfigOpen(true);
  };

  const getUnavailableChampions = () => {
    const unavailable = new Set<string>();
    if (getAllSelectedChampions && Array.isArray(getAllSelectedChampions)) {
      getAllSelectedChampions.forEach((id: string) => unavailable.add(id));
    }
    if (permanentlyBannedChampions && Array.isArray(permanentlyBannedChampions)) {
      permanentlyBannedChampions.forEach((id: string) => unavailable.add(id));
    }
    if (completedDrafts && Array.isArray(completedDrafts)) {
      completedDrafts.forEach((prevDraft) => {
        if (!prevDraft) return;
        const draftObj = prevDraft as Record<string, any>;
        if (draftObj.team1) {
          if (Array.isArray(draftObj.team1.picks)) draftObj.team1.picks.forEach((id: string) => unavailable.add(id));
          if (Array.isArray(draftObj.team1.bans)) draftObj.team1.bans.forEach((id: string) => unavailable.add(id));
        }
        if (draftObj.team2) {
          if (Array.isArray(draftObj.team2.picks)) draftObj.team2.picks.forEach((id: string) => unavailable.add(id));
          if (Array.isArray(draftObj.team2.bans)) draftObj.team2.bans.forEach((id: string) => unavailable.add(id));
        }
      });
    }
    return unavailable;
  };

  const analyzeTeamComposition = (picks: string[] = []) => {
    if (!picks || picks.length === 0) {
      const unavailable = getUnavailableChampions();
      const availablePool = Object.keys(champions || {}).filter((id) => !unavailable.has(id));
      const defaultRecs = availablePool.slice(0, 2).map((id) => champions[id]?.name || id);
      return {
        totalScore: 0,
        apRatio: 0,
        adRatio: 0,
        recommendations: defaultRecs.length > 0 ? defaultRecs : ['없음'],
      };
    }

    let apCount = 0;
    let adCount = 0;
    picks.forEach((championId) => {
      if (AP_CHAMPIONS.has(championId)) apCount += 1;
      else adCount += 1;
    });

    const totalPicks = picks.length;
    const apRatio = Math.round((apCount / totalPicks) * 100);
    const adRatio = 100 - apRatio;
    const balancePenalty = Math.abs(apRatio - adRatio) * 0.3;
    const totalScore = Math.max(10, Math.min(100, Math.round(totalPicks * 18 - balancePenalty + 10)));

    const unavailable = getUnavailableChampions();
    const candidatePool = Object.keys(champions || {}).filter((id) => !unavailable.has(id));

    let recommendedList: string[] = [];
    if (apRatio > 60) recommendedList = candidatePool.filter((id) => !AP_CHAMPIONS.has(id)).slice(0, 2);
    else if (adRatio > 60) recommendedList = candidatePool.filter((id) => AP_CHAMPIONS.has(id)).slice(0, 2);
    else recommendedList = candidatePool.slice(0, 2);

    const recommendations = recommendedList.map((id) => champions[id]?.name || id);

    return {
      totalScore,
      apRatio,
      adRatio,
      recommendations: recommendations.length > 0 ? recommendations : ['없음'],
    };
  };

  useEffect(() => {
    if (filteredChampions && filteredChampions.length > 0) {
      setIsContentReady(true);
    }
  }, [filteredChampions]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShareUrl = () => {
    const stateToShare = { draft, completedDrafts, config };
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

  const handleStartDraft = () => {
    setIsConfigured(true);
    setIsConfigOpen(false);
  };

  const blueSideTeamId = teamSideMapping.team1 === 'blue' ? 'team1' : 'team2';
  const redSideTeamId = teamSideMapping.team1 === 'red' ? 'team1' : 'team2';
  const blueSideTeamName = blueSideTeamId === 'team1' ? config.team1Name : config.team2Name;
  const redSideTeamName = redSideTeamId === 'team1' ? config.team1Name : config.team2Name;
  const blueSideData = draft[blueSideTeamId] || { picks: [], bans: [] };
  const redSideData = draft[redSideTeamId] || { picks: [], bans: [] };

  const blueAnalysis = analyzeTeamComposition(blueSideData.picks);
  const redAnalysis = analyzeTeamComposition(redSideData.picks);

  return (
    <div className="w-full max-w-[1280px] mx-auto flex flex-col space-y-4 pt-4 relative">
      {isShareModalOpen && (
        <ShareModal onClose={() => setIsShareModalOpen(false)} onShareUrl={handleShareUrl} />
      )}
      {isBulkBanModalOpen && (
        <BulkBanModal onClose={() => setIsBulkBanModalOpen(false)} onConfirm={handleRegisterUsedChampionsConfirm} />
      )}

      {/* 설정 모달 */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-gray-900 border border-indigo-500/40 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">SET {currentSetNumber} 시작 설정</h2>
              <p className="text-xs text-gray-400 mt-1">팀 이름과 진영을 설정한 후 밴픽을 시작해주세요.</p>
            </div>

            <DraftConfigurator />

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleStartDraft}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                설정 완료 및 밴픽 시작 ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 리모컨 */}
      <nav className={`sticky z-40 transition-all duration-300 ease-in-out rounded-xl backdrop-blur-md border border-indigo-500/30 shadow-2xl isolate ${
        isScrolled ? 'top-[60px] bg-gray-900/95 p-2 max-w-[1100px] mx-auto' : 'top-2 bg-gray-800/90 p-3 border-gray-700/80'
      }`}>
        <div className="flex flex-wrap justify-between items-center gap-2 px-2">
          <div className="flex items-center space-x-2 bg-gray-950/80 px-3 py-1 rounded-lg border border-gray-800">
            <span className="text-xs font-bold px-2 py-0.5 bg-indigo-900/80 text-indigo-300 rounded border border-indigo-700/50">
              {matchTypeLabel}
            </span>
            <div className="flex items-center space-x-1.5 min-w-[65px]">
              <span className="text-xs text-gray-400">타이머</span>
              <span className={`text-base font-black font-mono ${timeLeft <= 10 && isTimerRunning ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                {timeLeft}s
              </span>
            </div>
            <button
              onClick={() => !isDraftFinished && setIsTimerRunning(!isTimerRunning)}
              disabled={isDraftFinished}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors disabled:opacity-40 ${
                isTimerRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {isTimerRunning ? '일시정지' : '시작'}
            </button>
            <button
              onClick={() => {
                setTimeLeft(30);
                setIsTimerRunning(false);
              }}
              className="px-1.5 py-0.5 text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
            >
              리셋
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`py-1 px-2.5 text-xs font-semibold rounded transition-all border shadow-sm ${
                isConfigOpen 
                  ? 'bg-indigo-600 border-indigo-400 text-white' 
                  : 'bg-gray-700/80 hover:bg-gray-600 border-gray-600 text-gray-200'
              }`}
            >
              ⚙️ 경기 설정
            </button>

            <Link href="/notices" className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-1 px-2.5 text-xs font-medium rounded transition-all border border-gray-600/50">
              공지사항
            </Link>
            <Link href="/recommended-bans" className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-1 px-2.5 text-xs font-medium rounded transition-all border border-gray-600/50">
              추천 밴
            </Link>
            <Link href="/tier-lists" className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-1 px-2.5 text-xs font-medium rounded transition-all border border-gray-600/50">
              티어 리스트
            </Link>

            <button onClick={() => setIsShareModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">
              공유하기
            </button>
            <button onClick={onNextSetWithTimerReset} className="bg-green-600 hover:bg-green-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">
              다음 세트
            </button>
            <button onClick={handleResetAll} className="bg-red-600 hover:bg-red-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">
              전부 초기화
            </button>

            <button
              onClick={handleUndoLastAction}
              disabled={currentTurnIndex === 0}
              className={`py-1 px-2.5 text-xs font-semibold rounded border border-transparent transition-all shadow-sm shrink-0 ${
                currentTurnIndex === 0 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              선택 취소
            </button>

            <button onClick={() => setIsBulkBanModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">
              대량 등록
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-purple-950/40 border border-purple-500/30 text-purple-200 text-center py-2.5 px-4 rounded-lg text-sm font-medium shadow-inner">
        <LatestPostBanner />
      </div>

      <NoticeBanner />

      <main className="flex-grow flex flex-col space-y-4">
        {/* 경기 세트 정보 바 */}
        <section className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 px-4 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-950 text-indigo-400 border border-indigo-500/30 rounded-md">
              {matchTypeLabel} 경기
            </span>
            <span className="text-sm font-semibold text-gray-300">
              현재 진행: <span className="text-teal-400 font-bold">SET {currentSetNumber}</span>
            </span>
          </div>

          <div>
            {isDraftFinished ? (
              <span className="text-xs font-bold px-3 py-1 bg-green-900/80 text-green-300 rounded-full border border-green-700">
                ✅ 밴픽 완료됨
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700/50">
                ⚡ 밴픽 진행 중
              </span>
            )}
          </div>
        </section>

        {/* AI 조합 평가 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/70 border border-blue-900/50 rounded-xl p-3.5 flex flex-col justify-between min-h-[105px]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <span>🤖</span> {blueSideTeamName} (블루) AI 조합 평가
              </span>
              <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
                완성도 {blueAnalysis.totalScore}점
              </span>
            </div>
            <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800 my-1">
              <div
                className="bg-gradient-to-r from-blue-600 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${blueAnalysis.totalScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>딜 밸런스: AP {blueAnalysis.apRatio}% / AD {blueAnalysis.adRatio}%</span>
              <span className="truncate max-w-[180px] text-right">
                추천 픽: <strong className="text-teal-300">{blueAnalysis.recommendations.join(', ')}</strong>
              </span>
            </div>
          </div>
        
          <div className="bg-gray-900/70 border border-red-900/50 rounded-xl p-3.5 flex flex-col justify-between min-h-[105px]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span>🤖</span> {redSideTeamName} (레드) AI 조합 평가
              </span>
              <span className="text-xs font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/50">
                완성도 {redAnalysis.totalScore}점
              </span>
            </div>
            <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800 my-1">
              <div
                className="bg-gradient-to-r from-red-600 to-amber-400 h-full transition-all duration-300"
                style={{ width: `${redAnalysis.totalScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>딜 밸런스: AP {redAnalysis.apRatio}% / AD {redAnalysis.adRatio}%</span>
              <span className="truncate max-w-[180px] text-right">
                추천 픽: <strong className="text-amber-300">{redAnalysis.recommendations.join(', ')}</strong>
              </span>
            </div>
          </div>
        </section>

        {config.isProMode && permanentlyBannedChampions.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <h3 className="text-red-400 font-bold mb-3 flex items-center">
              <span className="mr-2">🚫</span> 영구 밴 챔피언 (2회 누적 밴)
            </h3>
            <div className="flex flex-wrap gap-3">
              {permanentlyBannedChampions.map((id) => {
                const champion = champions[id];
                return (
                  <div key={id} className="flex flex-col items-center">
                    <div className="w-12 h-12 relative rounded border border-red-600 overflow-hidden grayscale">
                      {version && (
                        <Image
                          src={getChampionThumbnailUrl(version, id)}
                          alt={id}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-red-900/40">
                        <div className="w-full h-0.5 bg-red-600 rotate-45 absolute"></div>
                        <div className="w-full h-0.5 bg-red-600 -rotate-45 absolute"></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-red-300 mt-1">{champion?.name || id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 탭 구분 (모바일) */}
        <div className="flex border-b border-gray-700 lg:hidden rounded-t-lg overflow-hidden">
          <button onClick={() => setActiveTab('blue')} className={`flex-1 p-3 text-center font-semibold text-sm ${activeTab === 'blue' ? 'bg-gray-800 text-blue-400' : 'bg-gray-900 text-gray-400'}`}>
            {blueSideTeamName} (블루)
          </button>
          <button onClick={() => setActiveTab('champions')} className={`flex-1 p-3 text-center font-semibold text-sm ${activeTab === 'champions' ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400'}`}>
            챔피언 선택
          </button>
          <button onClick={() => setActiveTab('red')} className={`flex-1 p-3 text-center font-semibold text-sm ${activeTab === 'red' ? 'bg-gray-800 text-red-400' : 'bg-gray-900 text-gray-400'}`}>
            {redSideTeamName} (레드)
          </button>
        </div>

        {/* 밴픽 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-gray-800/40 p-4 rounded-xl border border-gray-700/60 relative">
          <div className={`${activeTab === 'blue' ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <TeamDisplay
              teamName={blueSideTeamName}
              teamColor="text-blue-400"
              teamType="blue"
              picks={blueSideData.picks}
              bans={blueSideData.bans}
            />
          </div>

          {/* 챔피언 선택 영역 */}
          <div className={`${activeTab === 'champions' ? 'block' : 'hidden'} lg:block lg:col-span-2 relative`}>
            {/* 2. 밴픽 완료 또는 미설정 시 선택 제한 오버레이 */}
            {isDraftFinished ? (
              <div className="absolute inset-0 z-20 bg-gray-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-3 p-4 text-center border border-green-500/30">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-white">SET {currentSetNumber} 밴픽이 완료되었습니다</h3>
                <p className="text-xs text-gray-400">결과를 확인하시거나 다음 세트를 진행해주세요.</p>
                <button
                  onClick={onNextSetWithTimerReset}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md"
                >
                  다음 세트 시작하기 ➔
                </button>
              </div>
            ) : !isConfigured && currentTurnIndex === 0 ? (
              <div 
                onClick={() => setIsConfigOpen(true)}
                className="absolute inset-0 z-20 bg-gray-950/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center space-y-2 p-4 text-center cursor-pointer group hover:bg-gray-950/70 transition-all border border-indigo-500/20 hover:border-indigo-500/50"
              >
                <div className="p-3 rounded-full bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <h3 className="text-base font-bold text-white">밴픽을 시작하려면 경기 설정이 필요합니다</h3>
                <p className="text-xs text-indigo-300 underline underline-offset-4">여기를 클릭하여 경기 설정을 진행해주세요.</p>
              </div>
            ) : null}

            {/* 챔피언 그리드 (완료 시 흑백 처리) */}
            <div className={isDraftFinished ? 'grayscale opacity-50 pointer-events-none' : ''}>
              <ChampionGrid />
            </div>
          </div>

          <div className={`${activeTab === 'red' ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <TeamDisplay
              teamName={redSideTeamName}
              teamColor="text-red-400"
              teamType="red"
              picks={redSideData.picks}
              bans={redSideData.bans}
            />
          </div>
        </div>

        {/* 하단 부가 섹션 */}
        <section className="space-y-6 text-gray-300 mt-8">
          <DraftTip />
          <DailyFortune />

          <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-teal-300">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-700/50">
                <h3 className="font-semibold text-white mb-1">완벽한 Fearless 룰 구현</h3>
                <p className="text-gray-400">이전 세트에서 사용한 챔피언은 다음 세트에서 자동으로 비활성화되어 프로 경기 조건으로 연습할 수 있습니다.</p>
              </div>
              <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-700/50">
                <h3 className="font-semibold text-white mb-1">밴픽 결과 공유</h3>
                <p className="text-gray-400">생성된 URL로 팀원과 밴픽 결과를 공유하고 피드백을 주고받으세요.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-orange-300">자주 묻는 질문 (FAQ)</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-white mb-1">Q. 피어리스(Fearless) 룰이 정확히 무엇인가요?</h3>
                <p className="text-gray-400">A. 다전제 경기에서 이전 세트에 양 팀이 사용했던 모든 챔피언을 다음 세트에서 다시 선택할 수 없도록 금지하는 규칙입니다.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 rounded-lg border border-gray-700">
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex justify-between items-center p-5 font-semibold text-left"
            >
              <span>TFT 메타 및 덱 추천 (클릭)</span>
              <span className={`transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ${isAccordionOpen ? 'max-h-screen' : 'max-h-0'}`}>
              <div className="p-5 border-t border-gray-700 text-sm space-y-4">
                <p>현재 패치 버전 승률이 높은 S티어 덱 빌드업 전략을 제공합니다.</p>
                <Link href="/tft" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-semibold">
                  상세 TFT 통계 보러가기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
