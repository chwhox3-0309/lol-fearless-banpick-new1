'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import NoticeBanner from './components/NoticeBanner';
import ChampionGrid from './components/ChampionGrid';
import TeamDisplay from './components/TeamDisplay';
import ShareModal from './components/ShareModal';
import BulkBanModal from './components/BulkBanModal';
import DraftConfigurator from './components/DraftConfigurator';
import { useDraft } from './context/DraftContext';
import { getChampionThumbnailUrl } from '@/lib/riot-api';
import { supabase } from '@/lib/supabase';

const AP_CHAMPIONS = new Set([
  'Ahri', 'Akali', 'Anivia', 'Annie', 'AurelionSol', 'Azir', 'Cassiopeia', 'ChoGath', 
  'Diana', 'Ekko', 'Evelynn', 'Fiddlesticks', 'Fizz', 'Galio', 'Gragas', 'Gwen', 
  'Heimerdinger', 'Hwei', 'Ivern', 'Janna', 'Karma', 'Karthus', 'Kassadin', 'Katarina', 
  'Kayle', 'Kennen', 'KogMaw', 'LeBlanc', 'Lillia', 'Lissandra', 'Lulu', 'Lux', 
  'Malzahar', 'Maokai', 'MordeKaiser', 'Morgana', 'Nami', 'Neeko', 'Nidalee', 'Nunu', 
  'Orianna', 'Rumble', 'Ryze', 'Syndra', 'Sylas', 'Taliyah', 'Teemo', 'TwistedFate', 
  'Veigar', 'VelKoz', 'Vex', 'Viktor', 'Vladimir', 'Xerath', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
]);

interface Notice {
  id: string | number;
  title: string;
  date?: string;
  created_at?: string;
}

interface DevLog {
  id: string | number;
  title: string;
  content?: string;
  created_at?: string;
}

interface TopStatItem {
  championId: string;
  championName: string;
  count: number;
  percentage: number;
}

export default function Home() {
  const {
    version,
    champions,
    draft,
    config,
    currentTurnIndex,
    completedDrafts,
    permanentlyBannedChampions,
    activeTab,
    setActiveTab,
    handleNextSet,
    handleResetAll,
    handleUndoLastAction,
    handleRegisterUsedChampions,
    teamSideMapping,
    BAN_PICK_SEQUENCE,
    getAllSelectedChampions,
  } = useDraft();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBulkBanModalOpen, setIsBulkBanModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [notices, setNotices] = useState<Notice[]>([]);
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const [devLogs, setDevLogs] = useState<DevLog[]>([]);

  // 사이트 이용 데이터 기반 Top 5 통계 상태
  const [topPickStats, setTopPickStats] = useState<TopStatItem[]>([]);
  const [topBanStats, setTopBanStats] = useState<TopStatItem[]>([]);

  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const isFirstRender = useRef(true);
  const hasSavedStatsRef = useRef(false); // 중복 저장 방지

  const currentSetNumber = (completedDrafts?.length || 0) + 1;
  const baseSets = config?.totalSets || config?.maxSets || 3;
  const targetSets = Math.max(baseSets, currentSetNumber);
  const calculatedBo = targetSets % 2 === 0 ? targetSets + 1 : targetSets;
  const matchTypeLabel = `BO${calculatedBo}`;

  const isDraftFinished = currentTurnIndex >= (BAN_PICK_SEQUENCE?.length || 20);

  // 밴픽 완료 시 챔피언별 카운트를 누적 증가시키는 함수 (RPC 없이 직접 Upsert 처리)
  const saveUserDraftStats = async () => {
    if (hasSavedStatsRef.current) return;
    try {
      const actions: { champion_id: string; action_type: string }[] = [];

      const team1Data = draft?.team1;
      if (team1Data) {
        team1Data.picks?.forEach((id: string) => id && actions.push({ champion_id: String(id), action_type: 'PICK' }));
        team1Data.bans?.forEach((id: string) => id && actions.push({ champion_id: String(id), action_type: 'BAN' }));
      }

      const team2Data = draft?.team2;
      if (team2Data) {
        team2Data.picks?.forEach((id: string) => id && actions.push({ champion_id: String(id), action_type: 'PICK' }));
        team2Data.bans?.forEach((id: string) => id && actions.push({ champion_id: String(id), action_type: 'BAN' }));
      }

      // 1. 현재 champion_stats 테이블의 데이터를 한 번에 가져옴
      const { data: existingStats, error: fetchError } = await supabase
        .from('champion_stats')
        .select('*');

      if (fetchError) {
        console.error('기존 통계 조회 실패:', fetchError.message);
        return;
      }

      // 맵으로 변환하여 빠른 조회/수정 가능하게 처리
      const statsMap = new Map<string, { pick_count: number; ban_count: number }>();
      existingStats?.forEach((row) => {
        statsMap.set(row.champion_id, {
          pick_count: row.pick_count || 0,
          ban_count: row.ban_count || 0,
        });
      });

      // 이번 밴픽 결과 반영
      actions.forEach((action) => {
        const current = statsMap.get(action.champion_id) || { pick_count: 0, ban_count: 0 };
        if (action.action_type === 'PICK') {
          current.pick_count += 1;
        } else if (action.action_type === 'BAN') {
          current.ban_count += 1;
        }
        statsMap.set(action.champion_id, current);
      });

      // 배열 형태로 변환 후 한 번에 upsert
      const upsertData = Array.from(statsMap.entries()).map(([champion_id, counts]) => ({
        champion_id,
        pick_count: counts.pick_count,
        ban_count: counts.ban_count,
      }));

      const { error: upsertError } = await supabase
        .from('champion_stats')
        .upsert(upsertData, { onConflict: 'champion_id' });

      if (upsertError) {
        console.error('통계 업데이트 실패:', upsertError.message);
      } else {
        hasSavedStatsRef.current = true;
        console.log('누적 통계 반영 완료!');
      }
    } catch (e) {
      console.error('통계 저장 중 예외 발생:', e);
    }
  };

  // Supabase에서 누적된 챔피언 통계를 가져와 Top 5 산출
  useEffect(() => {
    async function fetchOurSiteStats() {
      try {
        const { data, error } = await supabase
          .from('champion_stats')
          .select('*');

        if (error || !data || data.length === 0) return;

        let totalPicks = 0;
        let totalBans = 0;

        const pickCounts: Record<string, number> = {};
        const banCounts: Record<string, number> = {};

        data.forEach((row) => {
          if (row.pick_count > 0) {
            pickCounts[row.champion_id] = row.pick_count;
            totalPicks += row.pick_count;
          }
          if (row.ban_count > 0) {
            banCounts[row.champion_id] = row.ban_count;
            totalBans += row.ban_count;
          }
        });

        const getTop5 = (counts: Record<string, number>, total: number): TopStatItem[] => {
          return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id, count]) => ({
              championId: id,
              championName: champions[id] ? champions[id].name : id,
              count,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            }));
        };

        setTopPickStats(getTop5(pickCounts, totalPicks));
        setTopBanStats(getTop5(banCounts, totalBans));
      } catch (e) {
        console.error('우리 사이트 통계 집계 실패:', e);
      }
    }

    if (champions && Object.keys(champions).length > 0) {
      fetchOurSiteStats();
    }
  }, [champions, isDraftFinished]);

  // 밴픽 완료 감지 시 자동 저장 트리거
  useEffect(() => {
    if (isDraftFinished) {
      saveUserDraftStats();
    } else {
      hasSavedStatsRef.current = false;
    }
  }, [isDraftFinished]);

  // Supabase에서 전체 데이터를 집계하여 Top 5 산출 (수정된 버전)
  useEffect(() => {
    async function fetchOurSiteStats() {
      try {
        // 테이블 구조에 맞게 action_type 대신 position을 가져오도록 수정
        const { data, error } = await supabase
          .from('draft_stats')
          .select('champion_id, position');

        if (error || !data || data.length === 0) return;

        const pickCounts: Record<string, number> = {};
        const banCounts: Record<string, number> = {};
        let totalPicks = 0;
        let totalBans = 0;

        data.forEach((row) => {
          // action_type 대신 position 값을 확인
          if (row.position === 'PICK') {
            pickCounts[row.champion_id] = (pickCounts[row.champion_id] || 0) + 1;
            totalPicks += 1;
          } else if (row.position === 'BAN') {
            banCounts[row.champion_id] = (banCounts[row.champion_id] || 0) + 1;
            totalBans += 1;
          }
        });

        const getTop5 = (counts: Record<string, number>, total: number): TopStatItem[] => {
          return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id, count]) => ({
              championId: id,
              championName: champions[id] ? champions[id].name : id,
              count,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            }));
        };

        setTopPickStats(getTop5(pickCounts, totalPicks));
        setTopBanStats(getTop5(banCounts, totalBans));
      } catch (e) {
        console.error('우리 사이트 통계 집계 실패:', e);
      }
    }

    if (champions && Object.keys(champions).length > 0) {
      fetchOurSiteStats();
    }
  }, [champions, isDraftFinished]);

  // 공지사항 및 Dev-log 데이터 불러오기 (dev_logs 테이블 명칭 정확히 반영)
  useEffect(() => {
    async function fetchMainData() {
      try {
        const { data: noticesData } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
        if (noticesData) {
          setNotices(noticesData);
          if (noticesData.length > 0) setLatestNotice(noticesData[0]);
        }
        
        // dev_logs 테이블에서 데이터를 안전하게 가져오기
        const { data: devLogsData, error: devLogError } = await supabase.from('dev_logs').select('*').order('created_at', { ascending: false });
        if (devLogsData && !devLogError) {
          setDevLogs(devLogsData);
        }
      } catch (e) {
        console.error('메인 데이터 로드 실패:', e);
      }
    }
    fetchMainData();
  }, []);

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        ['team1', 'team2'].forEach((teamKey) => {
          if (draftObj[teamKey]) {
            if (Array.isArray(draftObj[teamKey].picks)) {
              draftObj[teamKey].picks.forEach((id: string) => unavailable.add(id));
            }
            if (Array.isArray(draftObj[teamKey].bans)) {
              draftObj[teamKey].bans.forEach((id: string) => unavailable.add(id));
            }
          }
        });
      });
    }
    return unavailable;
  };

  const analyzeTeamComposition = (picks: string[] = []) => {
    if (!picks || picks.length === 0) {
      const unavailable = getUnavailableChampions();
      const availablePool = Object.keys(champions || {}).filter((id) => !unavailable.has(id));
      const defaultRecs = availablePool.slice(0, 2).map((id) => champions[id]?.name || id);
      return { totalScore: 0, apRatio: 0, adRatio: 0, recommendations: defaultRecs.length > 0 ? defaultRecs : ['없음'] };
    }
    let apCount = 0;
    picks.forEach((championId) => {
      if (AP_CHAMPIONS.has(championId)) apCount += 1;
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
    return { totalScore, apRatio, adRatio, recommendations: recommendations.length > 0 ? recommendations : ['없음'] };
  };

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
      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} onShareUrl={handleShareUrl} />}
      {isBulkBanModalOpen && <BulkBanModal onClose={() => setIsBulkBanModalOpen(false)} onConfirm={handleRegisterUsedChampionsConfirm} />}

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
              onClick={() => { setTimeLeft(30); setIsTimerRunning(false); }}
              className="px-1.5 py-0.5 text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
            >
              리셋
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`py-1 px-2.5 text-xs font-semibold rounded transition-all border shadow-sm ${
                isConfigOpen ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-700/80 hover:bg-gray-600 border-gray-600 text-gray-200'
              }`}
            >
              ⚙️ 경기 설정
            </button>
            <Link href="/notices" className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-1 px-2.5 text-xs font-medium rounded transition-all border border-gray-600/50">공지사항</Link>
            <Link href="/dev-log" className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-1 px-2.5 text-xs font-medium rounded transition-all border border-gray-600/50">Dev-log</Link>
            <Link href="/recommended-bans" className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-1 px-2.5 text-xs font-medium rounded transition-all border border-gray-600/50">추천 밴</Link>
            <Link href="/tier-lists" className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-1 px-2.5 text-xs font-medium rounded transition-all border border-gray-600/50">티어 리스트</Link>
            <button onClick={() => setIsShareModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">공유하기</button>
            <button onClick={onNextSetWithTimerReset} className="bg-green-600 hover:bg-green-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">다음 세트</button>
            <button onClick={handleResetAll} className="bg-red-600 hover:bg-red-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">전부 초기화</button>
            <button
              onClick={handleUndoLastAction}
              disabled={currentTurnIndex === 0}
              className={`py-1 px-2.5 text-xs font-semibold rounded border border-transparent transition-all shadow-sm shrink-0 ${
                currentTurnIndex === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60' : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              선택 취소
            </button>
            <button onClick={() => setIsBulkBanModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-2.5 text-xs font-semibold rounded transition-all shadow-sm">대량 등록</button>
          </div>
        </div>
      </nav>

      {latestNotice && (
        <div className="bg-purple-950/40 border border-purple-500/30 text-purple-200 text-center py-2.5 px-4 rounded-lg text-sm font-medium shadow-inner transition-all hover:bg-purple-900/50">
          <Link href={`/notices`} className="flex items-center justify-center gap-2 w-full h-full">
            <span className="bg-purple-800 text-purple-300 text-xs px-2 py-0.5 rounded-md font-bold">최신 공지</span>
            <span className="hover:underline truncate">{latestNotice.title}</span>
          </Link>
        </div>
      )}

      <NoticeBanner />

      <main className="flex-grow flex flex-col space-y-4">
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
              <span className="text-xs font-bold px-3 py-1 bg-green-900/80 text-green-300 rounded-full border border-green-700">✅ 밴픽 완료됨</span>
            ) : (
              <span className="text-xs font-bold px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700/50">⚡ 밴픽 진행 중</span>
            )}
          </div>
        </section>

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
              <div className="bg-gradient-to-r from-blue-600 to-teal-400 h-full transition-all duration-300" style={{ width: `${blueAnalysis.totalScore}%` }} />
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
              <div className="bg-gradient-to-r from-red-600 to-amber-400 h-full transition-all duration-300" style={{ width: `${redAnalysis.totalScore}%` }} />
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
                      {version && <Image src={getChampionThumbnailUrl(version, id)} alt={id} fill className="object-cover" />}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-gray-800/40 p-4 rounded-xl border border-gray-700/60 relative">
          <div className={`${activeTab === 'blue' ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <TeamDisplay teamName={blueSideTeamName} teamColor="text-blue-400" teamType="blue" picks={blueSideData.picks} bans={blueSideData.bans} />
          </div>
          <div className={`${activeTab === 'champions' ? 'block' : 'hidden'} lg:block lg:col-span-2 relative`}>
            {isDraftFinished ? (
              <div className="absolute inset-0 z-20 bg-gray-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-3 p-4 text-center border border-green-500/30">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl font-bold">✓</div>
                <h3 className="text-lg font-bold text-white">SET {currentSetNumber} 밴픽이 완료되었습니다</h3>
                <p className="text-xs text-gray-400">결과를 확인하시거나 다음 세트를 진행해주세요.</p>
                <button onClick={onNextSetWithTimerReset} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md">
                  다음 세트 시작하기 ➔
                </button>
              </div>
            ) : !isConfigured && currentTurnIndex === 0 ? (
              <div onClick={() => setIsConfigOpen(true)} className="absolute inset-0 z-20 bg-gray-950/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center space-y-2 p-4 text-center cursor-pointer group hover:bg-gray-950/70 transition-all border border-indigo-500/20 hover:border-indigo-500/50">
                <div className="p-3 rounded-full bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition-transform">⚙️</div>
                <h3 className="text-base font-bold text-white">밴픽을 시작하려면 경기 설정이 필요합니다</h3>
                <p className="text-xs text-indigo-300 underline underline-offset-4">여기를 클릭하여 경기 설정을 진행해주세요.</p>
              </div>
            ) : null}
            <div className={isDraftFinished ? 'grayscale opacity-50 pointer-events-none' : ''}>
              <ChampionGrid />
            </div>
          </div>
          <div className={`${activeTab === 'red' ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <TeamDisplay teamName={redSideTeamName} teamColor="text-red-400" teamType="red" picks={redSideData.picks} bans={redSideData.bans} />
          </div>
        </div>

        <section className="space-y-6 text-gray-300 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-purple-300 flex items-center gap-2"><span>📢</span> 공지사항</h2>
                  <Link href="/notices" className="text-xs text-purple-400 hover:underline">전체보기 ➔</Link>
                </div>
                <div className="space-y-2">
                  {notices.length > 0 ? (
                    notices.slice(0, 4).map((notice) => (
                      <Link key={notice.id} href={`/notices`} className="block bg-gray-900/60 hover:bg-gray-900 p-3 rounded-lg border border-gray-700/50 transition-all text-sm flex justify-between items-center">
                        <span className="text-gray-200 truncate">{notice.title}</span>
                        {notice.date && <span className="text-xs text-gray-500 shrink-0 ml-2">{notice.date}</span>}
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">등록된 공지사항이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-teal-300 flex items-center gap-2"><span>🛠️</span> Dev-log (개발 일지)</h2>
                  <Link href="/dev-log" className="text-xs text-teal-400 hover:underline">전체보기 ➔</Link>
                </div>
                <div className="space-y-2">
                  {devLogs.length > 0 ? (
                    devLogs.slice(0, 4).map((log) => (
                      <Link key={log.id} href={`/dev-log`} className="block bg-gray-900/60 hover:bg-gray-900 p-3 rounded-lg border border-gray-700/50 transition-all text-sm flex justify-between items-center">
                        <span className="text-gray-200 truncate font-medium">{log.title}</span>
                        {log.created_at && <span className="text-xs text-gray-500 shrink-0 ml-2">{new Date(log.created_at).toLocaleDateString()}</span>}
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">등록된 개발일지가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 사이트 이용 데이터 기반 실시간 픽률 & 밴률 Top 5 그래프 섹션 */}
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2"><span>🔥</span> 사이트 이용 데이터 실시간 랭킹</h2>
                <p className="text-xs text-gray-400 mt-0.5">※ 시뮬레이터에서 완료된 밴픽 기록을 바탕으로 자동 집계됩니다.</p>
              </div>
              <span className="text-[11px] bg-gray-900 px-3 py-1 rounded-full border border-gray-700 text-teal-400 font-mono">Live Simulation Stats</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 픽률 TOP 5 */}
              <div className="bg-gray-900/85 p-4 rounded-xl border border-indigo-500/30 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                    <span>📈</span> 전체 픽률 TOP 5
                  </h3>
                </div>
                <div className="space-y-3">
                  {topPickStats.length > 0 ? (
                    topPickStats.map((item, index) => (
                      <div key={item.championId} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-200 flex items-center gap-2">
                            <span className="w-4 text-indigo-400 font-mono">#{index + 1}</span>
                            {item.championName}
                          </span>
                          <span className="text-indigo-400 font-mono">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-800">
                          <div 
                            className="bg-gradient-to-r from-indigo-600 via-purple-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            style={{ width: `${Math.max(item.percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">아직 집계된 픽 데이터가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 밴률 TOP 5 */}
              <div className="bg-gray-900/85 p-4 rounded-xl border border-red-500/30 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-red-300 flex items-center gap-1.5">
                    <span>🚫</span> 전체 밴률 TOP 5
                  </h3>
                </div>
                <div className="space-y-3">
                  {topBanStats.length > 0 ? (
                    topBanStats.map((item, index) => (
                      <div key={item.championId} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-200 flex items-center gap-2">
                            <span className="w-4 text-red-400 font-mono">#{index + 1}</span>
                            {item.championName}
                          </span>
                          <span className="text-red-400 font-mono">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-800">
                          <div 
                            className="bg-gradient-to-r from-red-700 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            style={{ width: `${Math.max(item.percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">아직 집계된 밴 데이터가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
