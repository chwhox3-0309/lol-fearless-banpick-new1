'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // 프로젝트의 supabase 클라이언트 경로에 맞게 조절

interface ChampionStat {
  champion_id: string;
  position: string;
  pick_count: number;
  ban_count: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<ChampionStat[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">챔피언 포지션 통계 관리</h1>
          <a href="/admin" className="text-sm text-gray-400 hover:text-white">← 관리자 홈으로</a>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">데이터를 불러오는 중...</div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/50 text-gray-400 text-sm">
                  <th className="p-4">챔피언 ID</th>
                  <th className="p-4">포지션</th>
                  <th className="p-4">픽 횟수</th>
                  <th className="p-4">밴 횟수</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, idx) => (
                  <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-4 font-medium">{stat.champion_id}</td>
                    <td className="p-4 uppercase text-blue-400">{stat.position}</td>
                    <td className="p-4">{stat.pick_count}</td>
                    <td className="p-4">{stat.ban_count}</td>
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
