'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = selectedCategory === 'ALL'
    ? notices
    : notices.filter((n) => n.category === selectedCategory);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'UPDATE':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'NOTICE':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'EVENT':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      default:
        return 'bg-gray-900 text-gray-300 border-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="h-16 border-b border-gray-800/80 bg-gray-900/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-red-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            FEARLESS BAN-PICK
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
            BETA
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-semibold text-gray-400">
          <Link href="/" className="hover:text-indigo-400 transition-colors">시뮬레이터</Link>
          <Link href="/notices" className="text-white hover:text-indigo-400 transition-colors">공지사항</Link>
        </nav>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8">
        <div className="border-b border-gray-800/80 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            📢 공지사항 및 업데이트
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            LoL Fearless Ban-pick 패치 내역과 주요 안내 사항을 확인하세요.
          </p>
        </div>

        {/* 카테고리 필터 버튼 탭 */}
        <div className="flex gap-2">
          {[
            { label: '전체', value: 'ALL' },
            { label: '업데이트', value: 'UPDATE' },
            { label: '공지사항', value: 'NOTICE' },
            { label: '이벤트', value: 'EVENT' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 공지 목록 리스트 */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm animate-pulse">
            공지사항을 불러오는 중입니다...
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm bg-gray-900/40 rounded-2xl border border-gray-800/80">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="bg-gray-900/70 border border-gray-800/80 rounded-2xl p-6 transition-all hover:border-indigo-500/40 shadow-xl backdrop-blur group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${getCategoryBadge(
                        notice.category
                      )}`}
                    >
                      {notice.category}
                    </span>
                    <h2 className="text-lg font-bold text-gray-100 group-hover:text-indigo-300 transition-colors">
                      {notice.title}
                    </h2>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap pt-2 border-t border-gray-800/60">
                  {notice.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
