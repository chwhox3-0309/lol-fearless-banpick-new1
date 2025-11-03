'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import { getLatestVersion, getChampionData } from '@/lib/riot-api';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, storedValue, hydrated]);

  return [storedValue, setStoredValue, hydrated];
}


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

interface DraftState {
  blueTeamPicks: string[];
  redTeamPicks: string[];
  blueTeamBans: string[];
  redTeamBans: string[];
  currentTurnIndex: number;
}

interface Turn {
  team: string;
  type: string;
}

const BAN_PICK_SEQUENCE: Turn[] = [
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

const initialDraftState: DraftState = {
  blueTeamPicks: [],
  redTeamPicks: [],
  blueTeamBans: [],
  redTeamBans: [],
  currentTurnIndex: 0,
};

interface DraftContextType {
  version: string | null;
  champions: ChampionData;
  blueTeamPicks: string[];
  redTeamPicks: string[];
  blueTeamBans: string[];
  redTeamBans: string[];
  currentTurnIndex: number;
  searchTerm: string;
  completedDrafts: CompletedDraft[];
  isSearchSticky: boolean;
  isAccordionOpen: boolean;
  searchBarRef: React.RefObject<HTMLDivElement>;
  activeTab: string;
  
  setSearchTerm: (term: string) => void;
  setIsAccordionOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  handleChampionClick: (championId: string) => void;
  handleNextSet: () => void;
  handleResetAll: () => void;
  handleUndoLastAction: () => void;
  handleRegisterUsedChampions: (championNames: string) => { success: boolean, message: string };
  getAllSelectedChampions: string[];
  allChampions: Champion[];
  filteredChampions: Champion[];
  currentTurnInfo: Turn;
  BAN_PICK_SEQUENCE: Turn[];
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState<string | null>(null);
  const [champions, setChampions] = useState<ChampionData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('champions');

  const [draftState, setDraftState, draftStateHydrated] = useLocalStorage<DraftState>('currentDraftState', initialDraftState);
  const [completedDrafts, setCompletedDrafts, completedDraftsHydrated] = useLocalStorage<CompletedDraft[]>('completedDrafts', []);

  const { blueTeamPicks, redTeamPicks, blueTeamBans, redTeamBans, currentTurnIndex } = draftState;

  // Fetch champion data
  useEffect(() => {
    async function fetchData() {
      const latestVersion = await getLatestVersion();
      setVersion(latestVersion);
      const koChampions = await getChampionData(latestVersion, 'ko_KR');
      setChampions(koChampions);
    }
    fetchData();
  }, []);

  // Handle sticky search bar
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

  // Load state from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

    if (data) {
      try {
        const decodedJson = decodeURIComponent(atob(data));
        const loadedState = JSON.parse(decodedJson);
        
        if (loadedState && loadedState.blueTeamPicks) {
            setDraftState({
                blueTeamPicks: loadedState.blueTeamPicks || [],
                redTeamPicks: loadedState.redTeamPicks || [],
                blueTeamBans: loadedState.blueTeamBans || [],
                redTeamBans: loadedState.redTeamBans || [],
                currentTurnIndex: loadedState.currentTurnIndex || 0,
            });
            setCompletedDrafts(loadedState.completedDrafts || []);
        }

        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Failed to load state from URL", error);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [setDraftState, setCompletedDrafts]);

  const allChampions = useMemo(() => {
    const championsArray = Object.values(champions);
    return championsArray.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [champions]);

  const getAllSelectedChampions = useMemo(() => {
    const selected = new Set<string>();
    // Add picks and bans from the CURRENT draft to disable them during this draft
    blueTeamPicks.forEach((id) => selected.add(id));
    redTeamPicks.forEach((id) => selected.add(id));
    blueTeamBans.forEach((id) => selected.add(id));
    redTeamBans.forEach((id) => selected.add(id));
    
    // Add ONLY picks from PREVIOUS drafts (completedDrafts)
    completedDrafts.forEach((draft) => {
      draft.blueTeamPicks.forEach((id) => selected.add(id));
      draft.redTeamPicks.forEach((id) => selected.add(id));
    });
    
    return Array.from(selected);
  }, [blueTeamPicks, redTeamPicks, blueTeamBans, redTeamBans, completedDrafts]);

  const handleChampionClick = useCallback((championId: string) => {
    if (currentTurnIndex >= BAN_PICK_SEQUENCE.length) {
      return;
    }

    if (getAllSelectedChampions.includes(championId)) {
      console.log(`${championId} is already selected.`);
      return;
    }

    const currentTurn = BAN_PICK_SEQUENCE[currentTurnIndex];

    setDraftState(prev => {
      const newState = { ...prev };
      if (currentTurn.team === 'blue') {
        if (currentTurn.type === 'ban') {
          newState.blueTeamBans = [...prev.blueTeamBans, championId];
        } else {
          newState.blueTeamPicks = [...prev.blueTeamPicks, championId];
        }
      } else if (currentTurn.team === 'red') {
        if (currentTurn.type === 'ban') {
          newState.redTeamBans = [...prev.redTeamBans, championId];
        } else {
          newState.redTeamPicks = [...prev.redTeamPicks, championId];
        }
      }
      newState.currentTurnIndex = prev.currentTurnIndex + 1;
      return newState;
    });
  }, [currentTurnIndex, getAllSelectedChampions, setDraftState]);

  const handleRegisterUsedChampions = useCallback((championNames: string): { success: boolean, message: string } => {
    const names = championNames
      .split('\n').flatMap(line => line.split(','))
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length !== 10) {
      return { success: false, message: `정확히 10명의 챔피언을 입력해야 합니다. (입력된 챔피언: ${names.length}명)` };
    }

    const championMap = new Map(allChampions.map(c => [c.name.toLowerCase(), c.id]));
    const championIdsToRegister: string[] = [];
    const invalidNames: string[] = [];
    const processedNames = new Set<string>(); // To track names already processed from current input

    for (const name of names) {
      const lowerCaseName = name.toLowerCase();
      const id = championMap.get(lowerCaseName);

      if (!id) { // Champion name not found
        invalidNames.push(name);
      } else if (getAllSelectedChampions.includes(id)) { // Already drafted in previous sets or current draft
        invalidNames.push(name);
      } else if (processedNames.has(id)) { // Duplicate in the current bulk input
        invalidNames.push(name);
      } else {
        championIdsToRegister.push(id);
        processedNames.add(id); // Add to processed set
      }
    }

    if (invalidNames.length > 0) {
      return { success: false, message: `다음 챔피언 이름이 잘못되었거나 이미 사용 중입니다: ${invalidNames.join(', ')}` };
    }

    if (championIdsToRegister.length !== 10) {
        return { success: false, message: `정확히 10명의 고유한 챔피언을 입력해야 합니다. (현재 ${championIdsToRegister.length}명)` };
    }

    const newFakeDraft: CompletedDraft = {
      blueTeamPicks: championIdsToRegister.slice(0, 5),
      redTeamPicks: championIdsToRegister.slice(5, 10),
      blueTeamBans: [],
      redTeamBans: [],
    };
    setCompletedDrafts(prev => [...prev, newFakeDraft]);

    return { success: true, message: '10명의 챔피언이 성공적으로 등록되었습니다.' };

  }, [allChampions, getAllSelectedChampions, setCompletedDrafts]);

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
    
    setDraftState(initialDraftState);
  }, [blueTeamPicks, redTeamPicks, blueTeamBans, redTeamBans, currentTurnIndex, setCompletedDrafts, setDraftState]);

  const handleResetAll = useCallback(() => {
    if (window.confirm('정말 초기화 하시겠습니까?')) {
      setDraftState(initialDraftState);
      setCompletedDrafts([]);
    }
  }, [setDraftState, setCompletedDrafts]);

  const handleUndoLastAction = useCallback(() => {
    if (currentTurnIndex === 0) {
      return; // 되돌릴 작업이 없습니다.
    }

    const lastTurnIndex = currentTurnIndex - 1;
    const lastTurn = BAN_PICK_SEQUENCE[lastTurnIndex];

    setDraftState(prev => {
        const newState = { ...prev };
        if (lastTurn.team === 'blue') {
            if (lastTurn.type === 'ban') {
                newState.blueTeamBans = prev.blueTeamBans.slice(0, -1);
            } else {
                newState.blueTeamPicks = prev.blueTeamPicks.slice(0, -1);
            }
        } else { // red team
            if (lastTurn.type === 'ban') {
                newState.redTeamBans = prev.redTeamBans.slice(0, -1);
            } else {
                newState.redTeamPicks = prev.redTeamPicks.slice(0, -1);
            }
        }
        newState.currentTurnIndex = prev.currentTurnIndex - 1;
        return newState;
    });
  }, [currentTurnIndex, setDraftState]);

  const value = useMemo(() => ({
    version,
    champions,
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
    handleRegisterUsedChampions,
    getAllSelectedChampions,
    allChampions,
    filteredChampions,
    currentTurnInfo,
    BAN_PICK_SEQUENCE,
  }), [
    version,
    champions,
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
    handleRegisterUsedChampions,
    getAllSelectedChampions,
    allChampions,
    filteredChampions,
    currentTurnInfo,
  ]);

  if (!draftStateHydrated || !completedDraftsHydrated) {
    return null;
  }

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
};
