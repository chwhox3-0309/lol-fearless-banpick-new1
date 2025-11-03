'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface BanRate {
  championId: string;
  championName: string;
  banCount: number;
  banRate: string;
}

interface BanData {
  lastUpdated: string;
  totalMatchesAnalyzed: number;
  data: BanRate[];
}

export default function StatisticsPage() {
  const [banData, setBanData] = useState<BanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/statistics');
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
      const data: BanData = await response.json();
      setBanData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRefreshing && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isRefreshing) {
      setIsRefreshing(false);
    }
    return () => clearInterval(timer);
  }, [isRefreshing, countdown]);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setCountdown(10);
    setError(null);
    try {
      const response = await fetch('/api/statistics');
      if (!response.ok) {
        throw new Error('데이터를 새로고침하지 못했습니다.');
      }
      const data: BanData = await response.json();
      setBanData(data);
    } catch (err: any) {
      setError(err.message);
    }
    // The countdown effect will handle turning isRefreshing off
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">{error}</div>;
  }

  if (!banData) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">데이터가 없습니다.</div>;
  }

  const { lastUpdated, totalMatchesAnalyzed, data: banRates } = banData;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-16">
      <div className="w-full max-w-4xl p-8">
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold">챔피언 밴 통계</h1>
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 font-semibold rounded-lg shadow-md transition-colors duration-300 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isRefreshing ? `갱신 대기 (${countdown}s)` : '데이터 갱신'}
            </button>
        </div>
        <p className="text-center text-gray-400 mb-1">
          데이터 기준: {new Date(lastUpdated).toLocaleString()} / 분석된 게임 수: {totalMatchesAnalyzed}
        </p>
        <p className="text-center text-xs text-gray-500 mb-8">
          (분석된 게임 수가 적어 통계의 정확성이 낮을 수 있습니다.)
        </p>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">순위</th>
                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">챔피언</th>
                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">밴 횟수</th>
                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">밴률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {banRates.map((ban, index) => (
                <tr key={ban.championId} className="hover:bg-gray-700 transition-colors duration-200">
                  <td className="py-3 px-4 text-center font-medium">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {/* Note: We need to get the version to display the image, for now, it's omitted */}
                      <span className="font-semibold">{ban.championName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{ban.banCount}</td>
                  <td className="py-3 px-4 text-center font-bold text-red-400">{ban.banRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold text-xl">
            &larr; 밴픽 시뮬레이터로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}