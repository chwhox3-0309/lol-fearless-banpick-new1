'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Notice {
  id: string | number;
  title: string;
  content?: string;
  created_at?: string;
  date?: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchType, setSearchType] = useState<'title' | 'content' | 'all'>('title');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // 펼쳐진 상태 관리 (아코디언 형태)를 위한 ID 상태
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchNotices() {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotices(data);
        } else {
          // 로컬 스토리지 폴백 대응
          const saved = localStorage.getItem('notices');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setNotices(parsed);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch notices:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchNotices();
  }, []);

  // 검색 필터링 로직
  const filteredNotices = notices.filter((notice) => {
    if (!searchKeyword.trim()) return true;
    const keyword = searchKeyword.toLowerCase();
    const titleMatch = notice.title?.toLowerCase().includes(keyword) || false;
    const contentMatch = notice.content?.toLowerCase().includes(keyword) || false;

    if (searchType === 'title') return titleMatch;
    if (searchType === 'content') return contentMatch;
    return titleMatch || contentMatch; // 'all'인 경우
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNotices = filteredNotices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 검색어 입력 시 페이지를 1페이지로 초기화
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  };

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-8 text-gray-200">
      {/* 상단 헤더 및 홈 이동 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
            <span>📢</span> 공지사항
          </h1>
          <p className="text-xs text-gray-400 mt-1">대회 규칙 및 업데이트 소식을 확인하세요.</p>
        </div>
        <Link
          href="/"
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-lg border border-gray-700 transition-all"
        >
          ➔ 메인으로 돌아가기
        </Link>
      </div>

      {/* 검색 및 카테고리 필터 영역 */}
      <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 shadow-lg mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'title' | 'content' | 'all')}
            className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
          >
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="all">제목 + 내용</option>
          </select>
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchKeyword}
            onChange={handleSearchChange}
            className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded-lg px-3 py-2 w-full sm:w-64 outline-none focus:border-purple-500"
          />
        </div>
        <div className="text-xs text-gray-400 self-end sm:self-center">
          총 <strong className="text-purple-300">{filteredNotices.length}</strong>개의 공지
        </div>
      </div>

      {/* 공지사항 목록 (아코디언 토글 형태) */}
      <div className="space-y-3 mb-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">공지사항을 불러오는 중입니다...</div>
        ) : currentNotices.length > 0 ? (
          currentNotices.map((notice) => {
            const isExpanded = expandedId === notice.id;
            const displayDate = notice.date || (notice.created_at ? notice.created_at.split('T')[0] : '');

            return (
              <div
                key={notice.id}
                className="bg-gray-900/60 border border-gray-800 hover:border-purple-500/40 rounded-xl overflow-hidden transition-all shadow-md"
              >
                {/* 클릭 시 내용이 펼쳐지는 헤더 부분 */}
                <div
                  onClick={() => toggleExpand(notice.id)}
                  className="p-4 cursor-pointer flex justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xs font-bold px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800/50 shrink-0">
                      공지
                    </span>
                    <span className="text-sm font-semibold text-gray-100 truncate hover:text-purple-300 transition-colors">
                      {notice.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-500">{displayDate}</span>
                    <span className={`transform transition-transform duration-200 text-xs text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* 펼쳐졌을 때 나타나는 본문 내용 영역 */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-800/80 bg-gray-950/40 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {notice.content || '등록된 상세 내용이 없습니다.'}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-900/40 rounded-xl border border-gray-800 text-gray-400 text-sm">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 (이전, 번호, 다음) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pb-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-xs font-semibold rounded-lg border border-gray-700 transition-all"
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${
                currentPage === number
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-xs font-semibold rounded-lg border border-gray-700 transition-all"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
