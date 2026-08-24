'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  category: 'notice' | 'dev';
  created_at: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 입력폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'notice' | 'dev'>('notice');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게시글 불러오기 실패:', error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('posts')
      .insert([{ 
        title, 
        content, 
        category,
        author_name: '관리자' // 이 부분을 추가해 줍니다.
      }]);

    if (error) {
      alert('작성 실패: ' + error.message);
    } else {
      setTitle('');
      setContent('');
      fetchPosts(); 
    }
    setIsSubmitting(false);
  };

  // 글 삭제 핸들러
  const handleDeletePost = async (id: number) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">공지사항 및 개발일지 통합 관리</h1>
            <p className="text-sm text-gray-400 mt-1">사이트의 소식과 업데이트 내역을 한곳에서 작성하고 관리합니다.</p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← 관리자 홈으로
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 글 작성 폼 */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">새 글 작성하기</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'notice' | 'dev')}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="notice">공지사항 (Notice)</option>
                  <option value="dev">개발일지 (Dev Log)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">제목</label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">내용</label>
                <textarea
                  rows={6}
                  placeholder="내용을 입력하세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '업로드 중...' : '작성 완료'}
              </button>
            </form>
          </div>

          {/* 우측: 등록된 글 목록 */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">등록된 게시글 목록 ({posts.length})</h2>

            {loading ? (
              <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">등록된 글이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                          post.category === 'notice' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}>
                          {post.category === 'notice' ? '공지' : '개발일지'}
                        </span>
                        <h3 className="font-semibold text-white">{post.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap line-clamp-2">{post.content}</p>
                      <span className="text-xs text-gray-500 block pt-1">
                        {new Date(post.created_at).toLocaleDateString()} 작성됨
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs transition-colors shrink-0"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
