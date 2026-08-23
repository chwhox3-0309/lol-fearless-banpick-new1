'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DevLog {
  id: string | number;
  title: string;
  content: string;
  created_at: string;
}

export default function DevLogSection() {
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevLogs() {
      try {
        const { data, error } = await supabase
          .from('dev_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4); // 메인 화면에는 최신 4개만 노출

        if (!error && data) {
          setLogs(data);
        }
      } catch (e) {
        console.error('Failed to fetch dev logs:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchDevLogs();
  }, []);

  return (
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
          <span>🛠️</span> Dev-log (개발 일지)
        </h2>
        <Link href="/dev-log" className="text-xs text-indigo-400 hover:underline">
          전체보기 ➔
        </Link>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 text-center py-4">불러오는 중...</p>
      ) : logs.length > 0 ? (
        <div className="space-y-2">
          {logs.map((log) => (
            <div 
              key={log.id}
              className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/50 flex flex-col space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-200 truncate">{log.title}</span>
                <span className="text-[11px] text-gray-500 shrink-0 ml-2">{log.created_at.split('T')[0]}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1">{log.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">등록된 개발 일지가 없습니다.</p>
      )}
    </div>
  );
}
