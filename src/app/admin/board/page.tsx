'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface BoardPost {
  id: string | number;
  title: string;
  content: string;
  author?: string;
  created_at: string;
  image_url?: string | null;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPosts(data);
        }
      } catch (e) {
        console.error('Failed to fetch board data:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col space-y-6 py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-teal-300 flex items-center gap-2">
            <span>📌</span> 자유 게시판 / 공지
          </h1>
          <p className="text-xs text-gray-400 mt-1">소통과 유용한 정보들을 공유하는 공간입니다.</p>
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <Link
              href="/admin/board"
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-md"
            >
              ✍️ 글쓰기 / 관리
            </Link>
          ) : (
            <Link
              href="/admin/board"
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-xs rounded-lg transition-all"
            >
              🔒 관리자 로그인
            </Link>
          )}
          <Link
            href="/"
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 text-xs rounded-lg transition-all"
          >
            홈으로 ➔
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="제목 또는 내용을 검색하세요..."
          className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-teal-500/60 shadow-inner"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-16 text-xs">게시글을 불러오는 중입니다...</p>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isExpanded = expandedId === post.id;
            return (
              <div
                key={post.id}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-gray-900/90 border-teal-500/40 shadow-lg'
                    : 'bg-gray-950/60 border-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div
                  onClick={() => toggleExpand(post.id)}
                  className="p-4 sm:p-5 flex justify-between items-center cursor-pointer select-none"
                >
                  <div className="space-y-1 pr-4">
                    <h2 className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
                      <span className="text-teal-400 text-xs font-mono">#{post.id}</span>
                      {post.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-gray-500 font-mono">
                      {post.created_at ? post.created_at.split('T')[0] : ''}
                    </span>
                    <span className={`text-xs text-teal-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-gray-800/60 space-y-4 animate-fadeIn">
                    {post.image_url && (
                      <div className="max-h-[350px] overflow-hidden rounded-lg bg-gray-900 border border-gray-800 flex justify-center">
                        <img src={post.image_url} alt={post.title} className="max-h-[350px] w-auto object-contain" />
                      </div>
                    )}
                    <div 
                      className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-900/30 border border-gray-800/60 rounded-xl">
          <p className="text-gray-500 text-xs">검색 결과가 없거나 등록된 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
