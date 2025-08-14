'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await fetch('/api/notices');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Sort notices by date in descending order (latest first)
        const sortedNotices = data.notices.sort((a: Notice, b: Notice) => {
          const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateComparison === 0) {
            return b.id - a.id;
          }
          return dateComparison;
        });
        setNotices(sortedNotices);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">공지사항을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">공지사항을 불러오는데 실패했습니다: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <Link href="/" className="absolute top-8 left-8 text-white text-3xl hover:text-gray-400 transition-colors">
        &larr;
      </Link>
      <h1 className="text-4xl font-bold mb-8 text-center">공지사항</h1>
      <div className="max-w-3xl mx-auto mb-6">
        <input
          type="text"
          placeholder="공지사항 검색..."
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        {filteredNotices.length === 0 ? (
          <p className="text-center text-gray-400">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="space-y-6">
            {filteredNotices.map((notice) => (
              <li key={notice.id} className="border-b border-gray-700 pb-6 last:border-b-0 last:pb-0">
                <p className="text-sm text-gray-400 mb-1">[{notice.category}] {notice.date}</p>
                <h2 className="text-2xl font-semibold text-blue-400 mb-2">{notice.title}</h2>
                <p className="text-lg leading-relaxed text-gray-300 whitespace-pre-wrap">{notice.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}