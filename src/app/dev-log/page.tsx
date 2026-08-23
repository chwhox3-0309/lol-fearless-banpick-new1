'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DevLog {
  id: string | number;
  title: string;
  content: string;
  image_url?: string | null; // 이미지 URL 필드 추가
  created_at: string;
}

export default function DevLogListPage() {
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllDevLogs() {
      try {
        const { data, error } = await supabase
          .from('dev_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setLogs(data);
        }
      } catch (e) {
        console.error('Failed to fetch dev logs:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchAllDevLogs();
  }, []);

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col space-y-6 py-8 px-4">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-300 flex items-center gap-2">
            <span>🛠️</span> Dev-log (개발 일지)
          </h1>
          <p className="text-xs text-gray-400 mt-1">사이트 업데이트 내역과 기능 개선 사항을 기록하는 공간입니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dev-log"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all"
          >
            관리자 페이지
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-all"
          >
            홈으로 ➔
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">개발 일지를 불러오는 중입니다...</p>
      ) : logs.length > 0 ? (
        <div className="space-y-6">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 shadow-md space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-700/60 pb-2">
                <h2 className="text-base font-bold text-gray-100">{log.title}</h2>
                <span className="text-xs text-gray-400 font-mono">
                  {log.created_at ? log.created_at.split('T')[0] : ''}
                </span>
              </div>

              {/* 첨부된 이미지가 있는 경우 출력 */}
              {log.image_url && (
                <div className="w-full max-h-[400px] overflow-hidden rounded-lg border border-gray-700 bg-gray-900 flex justify-center">
                  <img 
                    src={log.image_url} 
                    alt={log.title} 
                    className="max-h-[400px] w-auto object-contain"
                  />
                </div>
              )}

              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {log.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/40 border border-gray-700/50 rounded-xl">
          <p className="text-gray-400 text-sm">등록된 개발 일지가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
