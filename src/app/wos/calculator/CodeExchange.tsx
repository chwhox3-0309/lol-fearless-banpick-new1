'use client';

import React, { useState } from 'react';
import usePersistentState from './usePersistentState';

const CodeExchange = () => {
  const [playerIds, setPlayerIds] = usePersistentState<string[]>('wos_playerIds', []);
  const [newPlayerId, setNewPlayerId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [giftCode, setGiftCode] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 2000);
  };

  const handleAddPlayerId = () => {
    if (newPlayerId && !playerIds.includes(newPlayerId)) {
      const updatedPlayerIds = [...playerIds, newPlayerId];
      setPlayerIds(updatedPlayerIds);
      setNewPlayerId('');
      if (!selectedPlayerId) {
        setSelectedPlayerId(newPlayerId);
      }
      showFeedback('플레이어 ID가 추가되었습니다.');
    } else if (playerIds.includes(newPlayerId)) {
      showFeedback('이미 등록된 플레이어 ID입니다.');
    }
  };

  const handleRemovePlayerId = (idToRemove: string) => {
    const updatedPlayerIds = playerIds.filter(id => id !== idToRemove);
    setPlayerIds(updatedPlayerIds);
    if (selectedPlayerId === idToRemove) {
      setSelectedPlayerId(updatedPlayerIds.length > 0 ? updatedPlayerIds[0] : null);
    }
    showFeedback('플레이어 ID가 삭제되었습니다.');
  };

  const handleCopyToClipboard = () => {
    if (!selectedPlayerId) {
      showFeedback('플레이어 ID를 선택해주세요.');
      return;
    }
    if (!giftCode) {
      showFeedback('교환 코드를 입력해주세요.');
      return;
    }
    
    const textToCopy = `플레이어 ID: ${selectedPlayerId}\n교환 코드: ${giftCode}`;
    navigator.clipboard.writeText(textToCopy);
    showFeedback('플레이어 ID와 교환 코드가 복사되었습니다.');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      {feedbackMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {feedbackMessage}
        </div>
      )}
      <h2 className="text-2xl font-bold text-center text-blue-400 mb-6">코드 교환 도우미</h2>

      {/* Player ID Management */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-200">플레이어 ID 관리</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="새 플레이어 ID 입력"
            value={newPlayerId}
            onChange={(e) => setNewPlayerId(e.target.value)}
            className="flex-grow p-3 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleAddPlayerId} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            추가
          </button>
        </div>
        
        <div className="space-y-2">
          {playerIds.map((id) => (
            <div key={id} className={`p-3 rounded-md flex items-center justify-between transition-colors ${selectedPlayerId === id ? 'bg-blue-900/50' : 'bg-gray-600'}`}>
              <button onClick={() => setSelectedPlayerId(id)} className="text-left flex-grow text-white">
                {id}
              </button>
              <button onClick={() => handleRemovePlayerId(id)} className="text-red-400 hover:text-red-300 font-bold ml-4 text-xl">
                &times;
              </button>
            </div>
          ))}
          {playerIds.length === 0 && <p className="text-gray-400 text-center py-2">추가된 플레이어 ID가 없습니다.</p>}
        </div>
      </div>

      {/* Gift Code Input */}
      <div className="mb-6">
        <label htmlFor="giftCode" className="block text-lg font-medium text-gray-300 mb-2">교환 코드</label>
        <input
          type="text"
          id="giftCode"
          placeholder="교환 코드를 입력하세요"
          value={giftCode}
          onChange={(e) => setGiftCode(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <button 
            onClick={handleCopyToClipboard}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition duration-300"
        >
            ID 및 코드 복사하기
        </button>
        <a 
            href="https://wos-giftcode.centurygame.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded transition duration-300"
        >
            교환 사이트로 이동
        </a>
      </div>
    </div>
  );
};

export default CodeExchange;
