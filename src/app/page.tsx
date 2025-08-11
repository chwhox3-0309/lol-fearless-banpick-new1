'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { getLatestVersion, getChampionData, getChampionThumbnailUrl } from '@/lib/riot-api';

const BAN_PICK_SEQUENCE = [
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },

  { team: 'blue', type: 'pick' },
  { team: 'red', type: 'pick' },
  { team: 'red', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'red', type: 'pick' },

  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },

  { team: 'red', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'red', type: 'pick' },
];

interface Champion {
  id: string;
  name: string;
}

interface ChampionData {
  [key: string]: Champion;
}

interface CompletedDraft {
  blueTeamPicks: string[];
  redTeamPicks: string[];
  blueTeamBans: string[];
  redTeamBans: string[];
}

export default function Home() {
  const [version, setVersion] = useState<string | null>(null);
  const [champions, setChampions] = useState<ChampionData>({});
  const [blueTeamPicks, setBlueTeamPicks] = useState<string[]>([]);
  const [redTeamPicks, setRedTeamPicks] = useState<string[]>([]);
  const [blueTeamBans, setBlueTeamBans] = useState<string[]>([]);
  const [redTeamBans, setRedTeamBans] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedDrafts, setCompletedDrafts] = useState<CompletedDraft[]>([]);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const latestVersion = await getLatestVersion();
      setVersion(latestVersion);
      const koChampions = await getChampionData(latestVersion, 'ko_KR');
      setChampions(koChampions);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDrafts = localStorage.getItem('completedDrafts');
      if (savedDrafts) {
        try {
          setCompletedDrafts(JSON.parse(savedDrafts));
        } catch (e) {
          console.error("Failed to parse completed drafts from localStorage", e);
          localStorage.removeItem('completedDrafts');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedDrafts', JSON.stringify(completedDrafts));
    }
  }, [completedDrafts]);

  useEffect(() => {
    const handleScroll = () => {
      if (searchBarRef.current) {
        const searchBarOffset = searchBarRef.current.offsetTop;
        const navBarHeight = 64;
        if (window.scrollY > searchBarOffset - navBarHeight) {
          setIsSearchSticky(true);
        } else {
          setIsSearchSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getAllSelectedChampions = useMemo(() => {
    const selected = new Set<string>();
    blueTeamPicks.forEach((id) => selected.add(id));
    redTeamPicks.forEach((id) => selected.add(id));
    blueTeamBans.forEach((id) => selected.add(id));
    redTeamBans.forEach((id) => selected.add(id));
    completedDrafts.forEach((draft) => {
      draft.blueTeamPicks.forEach((id) => selected.add(id));
      draft.redTeamPicks.forEach((id) => selected.add(id));
      draft.blueTeamBans.forEach((id) => selected.add(id));
      draft.redTeamBans.forEach((id) => selected.add(id));
    });
    return Array.from(selected);
  }, [blueTeamPicks, redTeamPicks, blueTeamBans, redTeamBans, completedDrafts]);

  const handleChampionClick = (championId: string) => {
    if (currentTurnIndex >= BAN_PICK_SEQUENCE.length) {
      return;
    }

    if (getAllSelectedChampions.includes(championId)) {
      console.log(`${championId} is already selected.`);
      return;
    }

    const currentTurn = BAN_PICK_SEQUENCE[currentTurnIndex];

    if (currentTurn.team === 'blue') {
      if (currentTurn.type === 'ban') {
        setBlueTeamBans((prev) => [...prev, championId]);
      } else {
        setBlueTeamPicks((prev) => [...prev, championId]);
      }
    } else if (currentTurn.team === 'red') {
      if (currentTurn.type === 'ban') {
        setRedTeamBans((prev) => [...prev, championId]);
      } else {
        setRedTeamPicks((prev) => [...prev, championId]);
      }
    }

    setCurrentTurnIndex((prev) => prev + 1);
  };

  const allChampions = useMemo(() => {
    const championsArray = Object.values(champions);
    return championsArray.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [champions]);

  const filteredChampions = useMemo(() => {
    if (!searchTerm) {
      return allChampions;
    }
    return allChampions.filter((champion) =>
      champion.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allChampions, searchTerm]);

  const currentTurnInfo = BAN_PICK_SEQUENCE[currentTurnIndex];

  const handleNextSet = useCallback(() => {
    if (currentTurnIndex < BAN_PICK_SEQUENCE.length) {
      alert('밴 또는 픽을 모두 진행해야 합니다.');
      return;
    }

    setCompletedDrafts((prev) => [
      ...prev,
      {
        blueTeamPicks,
        redTeamPicks,
        blueTeamBans,
        redTeamBans,
      },
    ]);
    
    setBlueTeamPicks([]);
    setRedTeamPicks([]);
    setBlueTeamBans([]);
    setRedTeamBans([]);
    setCurrentTurnIndex(0);
  }, [blueTeamPicks, redTeamPicks, blueTeamBans, redTeamBans, currentTurnIndex]);

  const handleResetAll = useCallback(() => {
    if (window.confirm('정말 초기화 하시겠습니까?')) {
      setBlueTeamPicks([]);
      setRedTeamPicks([]);
      setBlueTeamBans([]);
      setRedTeamBans([]);
      setCurrentTurnIndex(0);
      setCompletedDrafts([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('completedDrafts');
      }
    }
  }, []);

  const handleLoadSummoner = useCallback(() => {
    alert('소환사명으로 불러오기 기능은 현재 구현되지 않았습니다.');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 p-4 shadow-md z-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold">롤 밴픽 시뮬레이터</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleNextSet}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            다음 세트
          </button>
          <button
            onClick={handleResetAll}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            전부 초기화
          </button>
          <button
            onClick={handleLoadSummoner}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            소환사명으로 불러오기
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        <div className="flex flex-1 lg:grid lg:grid-cols-4">
          <div className="w-full lg:col-span-1 bg-gray-800 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-400">블루 팀</h2>
            <h3 className="text-lg font-semibold mb-2">밴:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {blueTeamBans.map((champId) => (
                <div key={champId} className="w-16 h-16 relative">
                  {version && (
                    <Image
                      src={getChampionThumbnailUrl(version, champId)}
                      alt={champId}
                      fill
                      className="rounded-md object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2">픽:</h3>
            <div className="flex flex-wrap gap-2">
              {blueTeamPicks.map((champId) => (
                <div key={champId} className="w-16 h-16 relative">
                  {version && (
                    <Image
                      src={getChampionThumbnailUrl(version, champId)}
                      alt={champId}
                      fill
                      className="rounded-md object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            {completedDrafts.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2">이전 밴픽 (블루 팀):</h3>
                {completedDrafts.map((draft, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-sm font-medium mt-1">세트 {index + 1} 픽:</p>
                    <div className="flex flex-wrap gap-1">
                      {draft.blueTeamPicks.map((champId) => (
                        <div key={`prev-blue-pick-${index}-${champId}`} className="w-10 h-10 relative opacity-70">
                          {version && (
                            <Image
                              src={getChampionThumbnailUrl(version, champId)}
                              alt={champId}
                              fill
                              className="rounded-md object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

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

          <div className="w-full lg:col-span-1 bg-gray-800 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-red-400">레드 팀</h2>
            <h3 className="text-lg font-semibold mb-2">밴:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {redTeamBans.map((champId) => (
                <div key={champId} className="w-16 h-16 relative">
                  {version && (
                    <Image
                      src={getChampionThumbnailUrl(version, champId)}
                      alt={champId}
                      fill
                      className="rounded-md object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2">픽:</h3>
            <div className="flex flex-wrap gap-2">
              {redTeamPicks.map((champId) => (
                <div key={champId} className="w-16 h-16 relative">
                  {version && (
                    <Image
                      src={getChampionThumbnailUrl(version, champId)}
                      alt={champId}
                      fill
                      className="rounded-md object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            {completedDrafts.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2">이전 밴픽 (레드 팀):</h3>
                {completedDrafts.map((draft, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-sm font-medium mt-1">세트 {index + 1} 픽:</p>
                    <div className="flex flex-wrap gap-1">
                      {draft.redTeamPicks.map((champId) => (
                        <div key={`prev-red-pick-${index}-${champId}`} className="w-10 h-10 relative opacity-70">
                          {version && (
                            <Image
                              src={getChampionThumbnailUrl(version, champId)}
                              alt={champId}
                              fill
                              className="rounded-md object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <section className="w-full max-w-5xl mx-auto p-8 mt-8">
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex justify-between items-center p-6 text-2xl font-semibold text-left focus:outline-none"
            >
              <span>Fearless 밴픽 완벽 가이드 (클릭)</span>
              <span className={`transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${isAccordionOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
              <div className="p-6 border-t border-gray-700 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Fearless 밴픽이란?</h3>
                  <p className="text-lg leading-relaxed">
                    프로 리그 오브 레전드 경기에서 사용되는 규칙으로, 이전 세트에서 사용했던 챔피언을 다음 세트에서 다시 선택할 수 없게 하여 매 경기 다른 전략과 챔피언 조합을 유도하는 방식입니다. 이 시뮬레이터는 바로 그 Fearless 룰을 적용하여, 여러분의 전략적 깊이를 한층 더 끌어올릴 수 있도록 돕습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">기본 전략</h3>
                  <ul className="list-disc list-inside text-lg space-y-2">
                    <li><strong>O.P. 챔피언 관리:</strong> 초반 세트에 강력한 O.P. 챔피언을 먼저 밴하거나 픽해서 상대의 선택지를 줄이는 것이 중요합니다.</li>
                    <li><strong>챔피언 폭 활용:</strong> 여러 포지션을 소화할 수 있는 유틸리티 챔피언을 확보하여 후반 세트의 밴픽을 유연하게 만드세요.</li>
                    <li><strong>상대의 픽 예측:</strong> 상대의 이전 픽을 기억하고, 어떤 챔피언이 금지될지 예측하여 다음 픽을 준비하는 것이 승리의 열쇠입니다.</li>
                  </ul>
                </div>
                 <div>
                  <h3 className="text-xl font-semibold mb-2">활용법</h3>
                  <p className="text-lg leading-relaxed">
                    친구들과 함께 LCK, LPL 등 프로 리그의 밴픽을 직접 체험하고, 자신만의 전략을 만들어보세요! 이 도구를 통해 여러분은 단순한 플레이어를 넘어, 경기의 흐름을 읽는 전략가가 될 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}