'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import { getLatestVersion, getChampionData } from '@/lib/riot-api';

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

interface Turn {
  team: string;
  type: string;
}

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
  handleLoadSummoner: () => void;
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
  const [activeTab, setActiveTab] = useState('champions');

  // Load data from localStorage on mount
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

      const savedCurrentDraft = localStorage.getItem('currentDraftState');
      if (savedCurrentDraft) {
        try {
          const parsedState = JSON.parse(savedCurrentDraft);
          setBlueTeamPicks(parsedState.blueTeamPicks || []);
          setRedTeamPicks(parsedState.redTeamPicks || []);
          setBlueTeamBans(parsedState.blueTeamBans || []);
          setRedTeamBans(parsedState.redTeamBans || []);
          setCurrentTurnIndex(parsedState.currentTurnIndex || 0);
        } catch (e) {
          console.error("Failed to parse current draft state from localStorage", e);
          localStorage.removeItem('currentDraftState');
        }
      }
    }
  }, []);

  // Save completed drafts to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedDrafts', JSON.stringify(completedDrafts));
    }
  }, [completedDrafts]);

  // Save current draft state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentDraftState = {
        blueTeamPicks,
        redTeamPicks,
        blueTeamBans,
        redTeamBans,
        currentTurnIndex,
      };
      localStorage.setItem('currentDraftState', JSON.stringify(currentDraftState));
    }
  }, [blueTeamPicks, redTeamPicks, blueTeamBans, redTeamBans, currentTurnIndex]);

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

  const handleChampionClick = useCallback((championId: string) => {
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
  }, [currentTurnIndex, getAllSelectedChampions, BAN_PICK_SEQUENCE]);

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
    handleLoadSummoner,
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
    handleLoadSummoner,
    getAllSelectedChampions,
    allChampions,
    filteredChampions,
    currentTurnInfo,
    BAN_PICK_SEQUENCE,
  ]);

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
};
