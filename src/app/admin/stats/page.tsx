'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface ChampionStat {
  champion_id: string;
  position: string;
  pick_count: number;
  ban_count: number;
}

const POSITIONS = ['ALL', 'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

export default function AdminStatsPage() {
  const [stats, setStats] = useState<ChampionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('champion_stats')
      .select('*')
      .order('pick_count', { ascending: false });

    if (error) {
      console.error('통계 불러오기 실패:', error.message);
    } else {
      setStats(data || []);
    }
    setLoading(false);
  };

  // 특정 챔피언-포지션 통계 삭제 기능
  const handleDeleteStat = async (champion_id: string, position: string) => {
    if (!confirm(`정말 [${champion_id} - ${position.toUpperCase()}] 통계를 초기화(삭제)하시겠습니까?`)) return;

    const { error } = await supabase
      .from('champion_stats')
      .delete()
      .match({ champion_id, position });

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      setStats(stats.filter(s => !(s.champion_id === champion_id && s.position === position)));
    }
  };

  // 필터링된 통계 목록 계산
  const filteredStats = stats.filter(stat => {
    const matchesSearch = stat.champion_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = selectedPosition === 'ALL' || stat.position.toUpperCase() === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">챔피언 포지션 통계 관리</h1>
            <p className="text-sm text-gray-400 mt-1">유동적으로 누적된 포지션별 픽/밴 데이터를 관리합니다.</p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← 관리자 홈으로
          </Link>
        </div>

        {/* 필터 및 검색 바 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          {/* 포지션 탭 필터 */}
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPosition === pos
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* 챔피언 검색창 */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="챔피언 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* 통계 테이블 */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">데이터를 불러오는 중...</div>
        ) : filteredStats.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl text-gray-500">
            조건에 일치하는 통계 데이터가 없습니다.
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/50 text-gray-400 text-sm">
                  <th className="p-4">챔피언 ID</th>
                  <th className="p-4">포지션</th>
                  <th className="p-4">픽 횟수</th>
                  <th className="p-4">밴 횟수</th>
                  <th className="p-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((stat, idx) => (
                  <tr key={`${stat.champion_id}-${stat.position}-${idx}`} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 font-medium text-gray-200">{stat.champion_id}</td>
                    <td className="p-4 uppercase text-blue-400 font-semibold">{stat.position}</td>
                    <td className="p-4 text-gray-300">{stat.pick_count}회</td>
                    <td className="p-4 text-gray-300">{stat.ban_count}회</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteStat(stat.champion_id, stat.position)}
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs transition-colors"
                      >
                        초기화
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
