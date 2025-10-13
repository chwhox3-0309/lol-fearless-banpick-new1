import React from 'react';
import Link from 'next/link';
import banData from '@/data/ban-rates.json';

export default function StatisticsPage() {
  const { lastUpdated, totalMatchesAnalyzed, data: banRates } = banData;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-16">
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-4xl font-bold mb-2 text-center">챔피언 밴 통계</h1>
        <p className="text-center text-gray-400 mb-8">
          데이터 기준: {new Date(lastUpdated).toLocaleString()} / 분석된 게임 수: {totalMatchesAnalyzed}
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
