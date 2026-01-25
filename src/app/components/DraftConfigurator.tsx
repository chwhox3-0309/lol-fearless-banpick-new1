'use client';

import React from 'react';
import { useDraft } from '../context/DraftContext';

const DraftConfigurator: React.FC = () => {
  const { config, setConfig, currentTurnIndex } = useDraft();
  
  // Don't show config if draft has started
  if (currentTurnIndex > 0) {
    return null;
  }

  const handlePickOrderDecision = (team: 'team1' | 'team2') => {
    setConfig(prev => ({ ...prev, pickOrderDecision: team, pickChoice: null, sideChoice: null }));
  };

  const handlePickChoice = (choice: 'first' | 'second') => {
    setConfig(prev => ({ ...prev, pickChoice: choice, sideChoice: null }));
  };

  const handleSideChoice = (choice: 'blue' | 'red') => {
    setConfig(prev => ({ ...prev, sideChoice: choice }));
  };

  const getTeamName = (team: 'team1' | 'team2') => {
    return team === 'team1' ? config.team1Name : config.team2Name;
  }

  const sideChoosingTeam = config.pickOrderDecision === 'team1' ? 'team2' : 'team1';

  return (
    <div className="w-full p-4 bg-gray-800 rounded-lg shadow-lg mb-4">
      <h2 className="text-xl font-bold text-white mb-4 text-center">시작 설정</h2>
      
      {/* Team Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-4xl mx-auto">
        <div>
          <label htmlFor="team1Name" className="block text-sm font-medium text-gray-300 mb-1">팀 1 이름</label>
          <input
            type="text"
            id="team1Name"
            value={config.team1Name}
            onChange={(e) => setConfig(prev => ({ ...prev, team1Name: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="team2Name" className="block text-sm font-medium text-gray-300 mb-1">팀 2 이름</label>
          <input
            type="text"
            id="team2Name"
            value={config.team2Name}
            onChange={(e) => setConfig(prev => ({ ...prev, team2Name: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-4 flex flex-col items-center">
        {/* Step 1: Choose who decides pick order */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200">1. 어느 팀이 픽 순서를 선택하나요?</h3>
          <div className="flex gap-2 mt-2">
            <button onClick={() => handlePickOrderDecision('team1')} className={`px-4 py-2 rounded ${config.pickOrderDecision === 'team1' ? 'bg-indigo-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{config.team1Name}</button>
            <button onClick={() => handlePickOrderDecision('team2')} className={`px-4 py-2 rounded ${config.pickOrderDecision === 'team2' ? 'bg-indigo-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{config.team2Name}</button>
          </div>
        </div>

        {/* Step 2: Make the pick choice */}
        {config.pickOrderDecision && (
          <div>
            <h3 className="text-lg font-semibold text-gray-200">2. {getTeamName(config.pickOrderDecision)}: 선픽 또는 후픽을 선택하세요.</h3>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handlePickChoice('first')} className={`px-4 py-2 rounded ${config.pickChoice === 'first' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>선픽 (First Pick)</button>
              <button onClick={() => handlePickChoice('second')} className={`px-4 py-2 rounded ${config.pickChoice === 'second' ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>후픽 (Second Pick)</button>
            </div>
          </div>
        )}

        {/* Step 3: Make the side choice */}
        {config.pickChoice && (
          <div>
            <h3 className="text-lg font-semibold text-gray-200">3. {getTeamName(sideChoosingTeam)}: 진영을 선택하세요.</h3>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleSideChoice('blue')} className={`px-4 py-2 rounded ${config.sideChoice === 'blue' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>블루 진영</button>
              <button onClick={() => handleSideChoice('red')} className={`px-4 py-2 rounded ${config.sideChoice === 'red' ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>레드 진영</button>
            </div>
          </div>
        )}
      </div>

      {config.sideChoice && (
        <div className="mt-4 text-center text-green-400 font-semibold bg-gray-900 p-3 rounded max-w-md mx-auto">
            설정이 완료되었습니다. 밴픽을 시작하세요!
        </div>
      )}

    </div>
  );
};

export default DraftConfigurator;

