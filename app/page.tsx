'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { getLatestVersion, getChampionData, getChampionThumbnailUrl } from '@/src/lib/riot-api';
import NavBar from '@/components/NavBar';

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

const LOCALES = {
  ko_KR: '한국어',
  en_US: 'English',
  ja_JP: '日本語',
};

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
  const [allChampionsByLocale, setAllChampionsByLocale] = useState<Record<string, ChampionData>>({});
  const [blueTeamPicks, setBlueTeamPicks] = useState<string[]>([]);
  const [redTeamPicks, setRedTeamPicks] = useState<string[]>([]);
  const [blueTeamBans, setBlueTeamBans] = useState<string[]>([]);
  const [redTeamBans, setRedTeamBans] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof LOCALES>('ko_KR');
  const [completedDrafts, setCompletedDrafts] = useState<CompletedDraft[]>([]);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const latestVersion = await getLatestVersion();
      setVersion(latestVersion);

      const koChampions = await getChampionData(latestVersion, 'ko_KR');
      const enChampions = await getChampionData(latestVersion, 'en_US');
      const jaChampions = await getChampionData(latestVersion, 'ja_JP');

      setAllChampionsByLocale({
        ko_KR: koChampions,
        en_US: enChampions,
        ja_JP: jaChampions,
      });
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
    if (allChampionsByLocale[currentLanguage]) {
      setChampions(allChampionsByLocale[currentLanguage]);
    }
  }, [currentLanguage, allChampionsByLocale]);

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
    if (currentLanguage === 'ko_KR') {
      return championsArray.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    } else {
      return championsArray.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [champions, currentLanguage]);

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
      alert('Bans 또는 Picks를 모두 진행해야 합니다.');
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
    alert('소환사명으로 불러오기 기능은 백엔드 프록시 서버가 필요합니다. 현재는 구현되지 않았습니다.');
  }, []);

  const handleLanguageChange = useCallback((lang: keyof typeof LOCALES) => {
    setCurrentLanguage(lang);
  }, []);

  const getSearchPlaceholder = () => {
    switch (currentLanguage) {
      case 'ko_KR': return '챔피언 검색...';
      case 'en_US': return 'Search champions...';
      case 'ja_JP': return 'チャンピオンを検索...';
      default: return 'Search champions...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavBar
        onNextSet={handleNextSet}
        onResetAll={handleResetAll}
        onLoadSummoner={handleLoadSummoner}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      <div className="flex flex-1 flex-col lg:flex-row pt-16">
        <div className="w-full lg:w-1/4 bg-gray-800 p-4">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Blue Team</h2>
          <h3 className="text-lg font-semibold mb-2">Bans:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {blueTeamBans.map((champId) => (
              <div key={champId} className="w-16 h-16 relative">
                {version && (
                  <Image
                    src={getChampionThumbnailUrl(version, champId)}
                    alt={champId}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-2">Picks:</h3>
          <div className="flex flex-wrap gap-2">
            {blueTeamPicks.map((champId) => (
              <div key={champId} className="w-16 h-16 relative">
                {version && (
                  <Image
                    src={getChampionThumbnailUrl(version, champId)}
                    alt={champId}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
          {completedDrafts.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2">Previous Drafts (Blue):</h3>
              {completedDrafts.map((draft, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm font-medium mt-1">Set {index + 1} Picks:</p>
                  <div className="flex flex-wrap gap-1">
                    {draft.blueTeamPicks.map((champId) => (
                      <div key={`prev-blue-pick-${index}-${champId}`} className="w-10 h-10 relative opacity-70">
                        {version && (
                          <Image
                            src={getChampionThumbnailUrl(version, champId)}
                            alt={champId}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
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

        <div className="flex-1 p-4 overflow-y-auto">
          <h1 className="text-2xl font-bold text-center mb-4">Champion Select</h1>
          {currentTurnIndex < BAN_PICK_SEQUENCE.length ? (
            <p className="text-center mb-4">
              Current Turn: <span className={currentTurnInfo.team === 'blue' ? 'text-blue-400' : 'text-red-400'}>
                {currentTurnInfo.team.toUpperCase()} Team
              </span> - {currentTurnInfo.type.toUpperCase()}
            </p>
          ) : (
            <p className="text-center mb-4 text-green-400">Draft Complete!</p>
          )}

          <div ref={searchBarRef} className={`transition-all duration-300 ${isSearchSticky ? 'fixed top-16 left-1/4 right-1/4 z-40 bg-gray-900 p-4 rounded-b-lg shadow-lg' : ''}`}>
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
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
                className={`cursor-pointer hover:scale-105 transition-transform duration-200 relative ${
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

        <div className="w-full lg:w-1/4 bg-gray-800 p-4">
          <h2 className="text-xl font-bold mb-4 text-red-400">Red Team</h2>
          <h3 className="text-lg font-semibold mb-2">Bans:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {redTeamBans.map((champId) => (
              <div key={champId} className="w-16 h-16 relative">
                {version && (
                  <Image
                    src={getChampionThumbnailUrl(version, champId)}
                    alt={champId}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-2">Picks:</h3>
          <div className="flex flex-wrap gap-2">
            {redTeamPicks.map((champId) => (
              <div key={champId} className="w-16 h-16 relative">
                {version && (
                  <Image
                    src={getChampionThumbnailUrl(version, champId)}
                    alt={champId}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
          {completedDrafts.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2">Previous Drafts (Red):</h3>
              {completedDrafts.map((draft, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm font-medium mt-1">Set {index + 1} Picks:</p>
                  <div className="flex flex-wrap gap-1">
                    {draft.redTeamPicks.map((champId) => (
                      <div key={`prev-red-pick-${index}-${champId}`} className="w-10 h-10 relative opacity-70">
                        {version && (
                          <Image
                            src={getChampionThumbnailUrl(version, champId)}
                            alt={champId}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
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
    </div>
  );
}
