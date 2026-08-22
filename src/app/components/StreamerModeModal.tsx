'use client';

import { useState } from 'react';

interface StreamerModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: (data: { bluePicks: string[]; redPicks: string[] }) => void;
}

export default function StreamerModeModal({ isOpen, onClose, onSyncSuccess }: StreamerModeModalProps) {
  const [riotId, setRiotId] = useState(''); // 예: 고니#KR1
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!riotId.includes('#')) {
      setErrorMessage('태그(#)를 포함한 라이엇 ID를 정확히 입력해주세요. (예: 고니#KR1)');
      return;
    }

    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      setErrorMessage('올바른 형식의 라이엇 ID가 아닙니다.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/streamer-sync?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '동기화 중 오류가 발생했습니다.');
      }

      // 성공 시 부모에게 데이터 전달 후 모달 닫기
      onSyncSuccess({
        bluePicks: data.bluePicks,
        redPicks: data.redPicks,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-purple-950 border border-purple-500/50 rounded-xl p-6 w-full max-w-md shadow-2xl text-purple-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="text-purple-400">⚡</span> 스트리머 모드 (전적 자동 연동)
          </h3>
          <button 
            onClick={onClose}
            className="text-purple-400 hover:text-white text-xl font-bold px-2"
          >
            &times;
          </button>
        </div>

        <p className="text-xs text-purple-300 mb-4 leading-relaxed">
          최근 정상 종료된 커스텀 게임(또는 매치) 기록을 바탕으로 양 팀의 챔피언 픽 정보를 자동으로 불러옵니다.
        </p>

        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-purple-300">라이엇 ID (소환사명#태그)</label>
            <input 
              type="text"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              placeholder="예: 고니#KR1"
              className="w-full bg-purple-900/60 border border-purple-500/40 rounded-lg px-3 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {errorMessage && (
            <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs p-2.5 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-purple-900/40 hover:bg-purple-900/70 text-purple-300 text-xs font-medium rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? '불러오는 중...' : '픽 정보 불러오기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
