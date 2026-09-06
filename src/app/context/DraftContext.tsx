'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
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

interface TeamState {
  picks: string[];
  bans: string[];
}

interface DraftState {
  team1: TeamState;
  team2: TeamState;
  currentTurnIndex: number;
}

interface DraftConfig {
  team1Name: string;
  team2Name: string;
  pickOrderDecision: 'team1' | 'team2' | null;
  pickChoice: 'first' | 'second' | null;
  sideChoice: 'blue' | 'red' | null;
  isProMode: boolean;
  maxSets?: number;
  totalSets?: number;
}

const initialTeamState: TeamState = {
  picks: [],
  bans: [],
};

const initialDraftState: DraftState = {
  team1: initialTeamState,
  team2: initialTeamState,
  currentTurnIndex: 0,
};

interface Turn {
  team: 'blue' | 'red';
  type: 'pick' | 'ban';
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

interface DraftContextType {
  version: string | null;
  champions: ChampionData;
  draft: DraftState;
  config: DraftConfig;
  team1Picks: string[];
  team2Picks: string[];
  team1Bans: string[];
  team2Bans: string[];
  currentTurnIndex: number;
  searchTerm: string;
  completedDrafts: CompletedDraft[];
  permanentlyBannedChampions: string[];
  isAccordionOpen: boolean;
  activeTab: string;
  
  setSearchTerm: (term: string) => void;
  setConfig: React.Dispatch<React.SetStateAction<DraftConfig>>;
  setIsAccordionOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  handleChampionClick: (championId: string) => void;
  handleNextSet: () => void;
  handleResetAll: () => void;
  handleUndoLastAction: () => void;
  handleRegisterUsedChampions: (championNames: string) => { success: boolean, message: string };
  handleApplyRiotSetHistory: (historyData: { setNo: number; team2Picks: string[]; team1Picks: string[] }[]) => { success: boolean; message: string };
  getAllSelectedChampions: string[];
  allChampions: Champion[];
  filteredChampions: Champion[];
  currentTurnInfo: Turn;
  BAN_PICK_SEQUENCE: Turn[];
  teamSideMapping: { team1: 'blue' | 'red' | null, team2: 'blue' | 'red' | null };
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState<string | null>(null);
  const [champions, setChampions] = useState<ChampionData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('champions');

  const [draftState, setDraftState, draftStateHydrated] = useLocalStorage<DraftState>('currentDraftState', initialDraftState);
  const [completedDrafts, setCompletedDrafts, completedDraftsHydrated] = useLocalStorage<CompletedDraft[]>('completedDrafts', []);
  
  const [config, setConfig, configHydrated] = useLocalStorage<DraftConfig>('draftConfig', {
    team1Name: 'Team 1',
    team2Name: 'Team 2',
    pickOrderDecision: null,
    pickChoice: null,
    sideChoice: null,
    isProMode: false,
    maxSets: 3,
    totalSets: 3,
  });

  const { currentTurnIndex } = draftState;
  const team1Picks = draftState?.team1?.picks || [];
  const team1Bans = draftState?.team1?.bans || [];
  const team2Picks = draftState?.team2?.picks || [];
  const team2Bans = draftState?.team2?.bans || [];

  const permanentlyBannedChampions = useMemo(() => {
    if (!config.isProMode) return [];
    
    const banCounts: { [id: string]: number } = {};
    completedDrafts.forEach(draft => {
      [...draft.blueTeamBans, ...draft.redTeamBans].forEach(id => {
        banCounts[id] = (banCounts[id] || 0) + 1;
      });
    });
    
    return Object.keys(banCounts).filter(id => banCounts[id] >= 2);
  }, [completedDrafts, config.isProMode]);

  useEffect(() => {
    if (draftStateHydrated) {
      if (!draftState || !draftState.team1 || !draftState.team2) {
        setDraftState(initialDraftState);
      }
    }
  }, [draftStateHydrated, draftState, setDraftState]);

  useEffect(() => {
    async function fetchData() {
      const latestVersion = await getLatestVersion();
      setVersion(latestVersion);
      const koChampions = await getChampionData(latestVersion, 'ko_KR');
      setChampions(koChampions);
    }
    fetchData();
  }, []);

  const teamSideMapping = useMemo(() => {
    const mapping: { team1: 'blue' | 'red' | null, team2: 'blue' | 'red' | null } = { team1: null, team2: null };
    if (!config.pickOrderDecision || !config.pickChoice || !config.sideChoice) {
      mapping.team1 = 'blue';
      mapping.team2 = 'red';
      return mapping;
    }

    const sideChoosingTeam = config.pickOrderDecision === 'team1' ? 'team2' : 'team1';
    const otherTeam = config.pickOrderDecision === 'team1' ? 'team1' : 'team2';

    mapping[sideChoosingTeam] = config.sideChoice;
    mapping[otherTeam] = config.sideChoice === 'blue' ? 'red' : 'blue';

    return mapping;
  }, [config]);

  const dynamicBanPickSequence = useMemo((): Turn[] => {
    if (!config.pickOrderDecision || !config.pickChoice || !config.sideChoice) {
      return BAN_PICK_SEQUENCE;
    }

    const firstPickingTeam = config.pickChoice === 'first' 
      ? config.pickOrderDecision 
      : (config.pickOrderDecision === 'team1' ? 'team2' : 'team1');
    
    const firstPickSide = teamSideMapping[firstPickingTeam as 'team1' | 'team2'];
    
    if (firstPickSide === 'red') {
      return BAN_PICK_SEQUENCE.map(turn => ({
        ...turn,
        team: turn.team === 'blue' ? 'red' : 'blue',
      }));
    }
    return BAN_PICK_SEQUENCE;
  }, [config, teamSideMapping]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

    if (data) {
      try {
        const decodedJson = decodeURIComponent(atob(data));
        const loadedState = JSON.parse(decodedJson);
        
        if (loadedState && loadedState.draft) {
            setDraftState(loadedState.draft);
            setCompletedDrafts(loadedState.completedDrafts || []);
            if(loadedState.config) {
              setConfig(loadedState.config);
            }
        }

        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Failed to load state from URL", error);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [setDraftState, setCompletedDrafts, setConfig]);

  const allChampions = useMemo(() => {
    const championsArray = Object.values(champions);
    return championsArray.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [champions]);

  const getAllSelectedChampions = useMemo(() => {
    const selected = new Set<string>();
    
    permanentlyBannedChampions.forEach(id => selected.add(id));

    team1Picks.forEach((id) => selected.add(id));
    team2Picks.forEach((id) => selected.add(id));
    team1Bans.forEach((id) => selected.add(id));
    team2Bans.forEach((id) => selected.add(id));
    
    completedDrafts.forEach((draft) => {
      draft.blueTeamPicks.forEach((id) => selected.add(id));
      draft.redTeamPicks.forEach((id) => selected.add(id));
    });
    
    return Array.from(selected);
  }, [team1Picks, team2Picks, team1Bans, team2Bans, completedDrafts, permanentlyBannedChampions]);

  const handleChampionClick = useCallback((championId: string) => {
    if (currentTurnIndex >= dynamicBanPickSequence.length) {
      return;
    }

    if (getAllSelectedChampions.includes(championId)) {
      console.log(`${championId} is already selected.`);
      return;
    }

    const currentTurn = dynamicBanPickSequence[currentTurnIndex];

    setDraftState(prev => {
      const newState: DraftState = {
        ...prev,
        team1: { picks: [...prev.team1.picks], bans: [...prev.team1.bans] },
        team2: { picks: [...prev.team2.picks], bans: [...prev.team2.bans] },
      };

      const teamIdForCurrentTurn = teamSideMapping.team1 === currentTurn.team ? 'team1' : 'team2';

      if (teamIdForCurrentTurn === 'team1') {
        if (currentTurn.type === 'ban') {
          newState.team1.bans.push(championId);
        } else {
          newState.team1.picks.push(championId);
        }
      } else {
        if (currentTurn.type === 'ban') {
          newState.team2.bans.push(championId);
        } else {
          newState.team2.picks.push(championId);
        }
      }
      
      newState.currentTurnIndex = prev.currentTurnIndex + 1;
      return newState;
    });
  }, [currentTurnIndex, getAllSelectedChampions, setDraftState, dynamicBanPickSequence, teamSideMapping]);

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
    const processedNames = new Set<string>();

    for (const name of names) {
      const lowerCaseName = name.toLowerCase();
      const id = championMap.get(lowerCaseName);

      if (!id) {
        invalidNames.push(name);
      } else if (getAllSelectedChampions.includes(id)) {
        invalidNames.push(name);
      } else if (processedNames.has(id)) {
        invalidNames.push(name);
      } else {
        championIdsToRegister.push(id);
        processedNames.add(id);
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

    return { success: true, message: '10명의 챔피언이 연동 경기 기록에 성공적으로 등록되었습니다.' };

  }, [allChampions, getAllSelectedChampions, setCompletedDrafts]);

  // 예시: DraftContext.tsx 내부의 handleApplyRiotSetHistory 함수 수정
const handleApplyRiotSetHistory = (newHistories) => {
  // 예: 이미 저장된 완료 세트 기록들을 확인 (상태명은 프로젝트에 맞게 조절)
  const existingHistory = draft.completedDrafts || []; // 혹은 관련 세트 히스토리 상태

  // 1. 중복 검사 (Match ID 기준 또는 setNo 기준)
  for (const newSet of newHistories) {
    const isDuplicate = existingHistory.some(
      (item) => item.matchId === newSet.matchId || item.setNo === newSet.setNo
    );
    if (isDuplicate) {
      throw new Error(`이미 등록된 경기 정보(SET ${newSet.setNo} 또는 Match ID)가 포함되어 있어 추가할 수 없습니다.`);
    }
  }

  // 2. 중복이 없다면 기존 기록에 누적 병합
  setDraft((prev) => ({
    ...prev,
    completedDrafts: [...prev.completedDrafts, ...newHistories]
  }));
};

  const filteredChampions = useMemo(() => {
    if (!searchTerm) {
      return allChampions;
    }
    return allChampions.filter((champion) =>
      champion.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allChampions, searchTerm]);

  const currentTurnInfo = dynamicBanPickSequence[currentTurnIndex];

  const handleNextSet = useCallback(() => {
    if (currentTurnIndex < dynamicBanPickSequence.length) {
      alert('밴 또는 픽을 모두 진행해야 합니다.');
      return;
    }

    const blueTeamId = teamSideMapping.team1 === 'blue' ? 'team1' : 'team2';
    const redTeamId = teamSideMapping.team1 === 'red' ? 'team1' : 'team2';

    const blueTeamData = draftState[blueTeamId];
    const redTeamData = draftState[redTeamId];

    setCompletedDrafts((prev) => [
      ...prev,
      {
        blueTeamPicks: blueTeamData.picks,
        redTeamPicks: redTeamData.picks,
        blueTeamBans: blueTeamData.bans,
        redTeamBans: redTeamData.bans,
      },
    ]);
    
    setDraftState(initialDraftState);
  }, [draftState, currentTurnIndex, setCompletedDrafts, setDraftState, dynamicBanPickSequence.length, teamSideMapping]);

  const handleResetAll = useCallback(() => {
    if (window.confirm('정말 초기화 하시겠습니까?')) {
      setDraftState(initialDraftState);
      setCompletedDrafts([]);
      setConfig({
        team1Name: 'Team 1',
        team2Name: 'Team 2',
        pickOrderDecision: null,
        pickChoice: null,
        sideChoice: null,
        isProMode: false,
        maxSets: 3,
        totalSets: 3,
      });
    }
  }, [setDraftState, setCompletedDrafts, setConfig]);

  const handleUndoLastAction = useCallback(() => {
    if (currentTurnIndex === 0) {
      return;
    }

    const lastTurnIndex = currentTurnIndex - 1;
    const lastTurn = dynamicBanPickSequence[lastTurnIndex];
    const teamIdForLastTurn = teamSideMapping.team1 === lastTurn.team ? 'team1' : 'team2';

    setDraftState(prev => {
        const newState = { ...prev };
        const teamStateToUpdate = { ...newState[teamIdForLastTurn] };

        if (lastTurn.type === 'ban') {
            teamStateToUpdate.bans = teamStateToUpdate.bans.slice(0, -1);
        } else {
            teamStateToUpdate.picks = teamStateToUpdate.picks.slice(0, -1);
        }

        newState[teamIdForLastTurn] = teamStateToUpdate;
        newState.currentTurnIndex = lastTurnIndex;
        return newState;
    });
  }, [currentTurnIndex, setDraftState, dynamicBanPickSequence, teamSideMapping]);

  const value = useMemo(() => ({
    version,
    champions,
    draft: draftState,
    config,
    team1Picks,
    team2Picks,
    team1Bans,
    team2Bans,
    currentTurnIndex,
    searchTerm,
    completedDrafts,
    permanentlyBannedChampions,
    isAccordionOpen,
    activeTab,
    setConfig,
    setSearchTerm,
    setIsAccordionOpen,
    setActiveTab,
    handleChampionClick,
    handleNextSet,
    handleResetAll,
    handleUndoLastAction,
    handleRegisterUsedChampions,
    handleApplyRiotSetHistory, // 새로 추가된 함수 노출
    getAllSelectedChampions,
    allChampions,
    filteredChampions,
    currentTurnInfo,
    BAN_PICK_SEQUENCE: dynamicBanPickSequence,
    teamSideMapping,
  }), [
    version,
    champions,
    draftState,
    config,
    team1Picks,
    team2Picks,
    team1Bans,
    team2Bans,
    currentTurnIndex,
    searchTerm,
    completedDrafts,
    permanentlyBannedChampions,
    isAccordionOpen,
    activeTab,
    setConfig,
    setSearchTerm,
    setIsAccordionOpen,
    setActiveTab,
    handleChampionClick,
    handleNextSet,
    handleResetAll,
    handleUndoLastAction,
    handleRegisterUsedChampions,
    handleApplyRiotSetHistory,
    getAllSelectedChampions,
    allChampions,
    filteredChampions,
    currentTurnInfo,
    dynamicBanPickSequence,
    teamSideMapping,
  ]);

  if (!draftStateHydrated || !completedDraftsHydrated || !configHydrated) {
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
