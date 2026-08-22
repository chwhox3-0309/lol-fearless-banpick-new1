'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 유저 세션 확인 및 게시글 불러오기
  useEffect(() => {
    fetchUser();
    fetchPosts();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error('게시글 로딩 실패:', error);
    else setPosts(data || []);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');

    const { error } = await supabase.from('posts').insert([
      {
        title,
        content,
        author_name: user.user_metadata?.full_name || user.email || '익명',
        author_id: user.id,
      },
    ]);

    if (error) {
      alert('작성 실패: ' + error.message);
    } else {
      setTitle('');
      setContent('');
      fetchPosts();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-white space-y-6">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold">💬 자유게시판</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <span>환영합니다, <strong className="text-indigo-400">{user.user_metadata?.full_name || user.email}</strong>님</span>
              <button onClick={handleLogout} className="bg-red-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500">로그아웃</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-indigo-600 px-4 py-2 rounded text-xs font-bold hover:bg-indigo-500">
              구글로 로그인하고 글 쓰기
            </button>
          )}
        </div>
      </div>

      {/* 로그인된 사용자만 보이는 글 작성 폼 */}
      {user ? (
        <form onSubmit={handleCreatePost} className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
          <h2 className="text-sm font-bold text-gray-300">새 글 작성</h2>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-xs font-bold transition-all">
              등록하기
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-900/50 border border-dashed border-gray-700 p-4 rounded-xl text-center text-sm text-gray-400">
          게시글을 작성하려면 로그인이 필요합니다.
        </div>
      )}

      {/* 게시글 목록 (누구나 열람 가능) */}
      <div className="space-y-3">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>작성자: <strong className="text-gray-300">{post.author_name}</strong></span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-base font-bold text-white">{post.title}</h3>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-6 text-sm">등록된 게시글이 없습니다.</p>
        )}
      </div>

      <div className="pt-4">
        <Link href="/" className="text-xs text-indigo-400 hover:underline">
          ⬅️ 메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
