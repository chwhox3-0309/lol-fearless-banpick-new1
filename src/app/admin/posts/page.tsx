'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface PostItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  type: 'notice' | 'dev';
}

export default function AdminPostsPage() {
  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 입력폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetTable, setTargetTable] = useState<'notices' | 'dev_logs'>('notices');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  // notices와 dev_logs 양쪽에서 데이터를 모두 불러와서 합침
  const fetchAllPosts = async () => {
    setLoading(true);
    
    const [noticesRes, devLogsRes] = await Promise.all([
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      supabase.from('dev_logs').select('*').order('created_at', { ascending: false })
    ]);

    const notices: PostItem[] = (noticesRes.data || []).map(item => ({ ...item, type: 'notice' }));
    const devLogs: PostItem[] = (devLogsRes.data || []).map(item => ({ ...item, type: 'dev' }));

    // 최신순으로 정렬 통합
    const combined = [...notices, [...devLogs]].flat().sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setItems(combined);
    setLoading(false);
  };

  // 글 작성 핸들러 (선택한 테이블에 맞게 insert)
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from(targetTable) // 'notices' 또는 'dev_logs'에 동적 저장
      .insert([{ title, content }]);

    if (error) {
      alert('작성 실패: ' + error.message);
    } else {
      setTitle('');
      setContent('');
      fetchAllPosts(); 
    }
    setIsSubmitting(false);
  };

  // 글 삭제 핸들러 (어떤 테이블의 글인지 확인 후 삭제)
  const handleDeletePost = async (id: number, type: 'notice' | 'dev') => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    const tableName = type === 'notice' ? 'notices' : 'dev_logs';
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      setItems(items.filter(item => !(item.id === id && item.type === type)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">공지사항 및 개발일지 통합 관리</h1>
            <p className="text-sm text-gray-400 mt-1">각각의 테이블에 분리된 소식을 한곳에서 작성하고 관리합니다.</p>
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
                <label className="block text-xs text-gray-400 mb-1">저장할 게시판</label>
                <select
                  value={targetTable}
                  onChange={(e) => setTargetTable(e.target.value as 'notices' | 'dev_logs')}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="notices">공지사항 (notices 테이블)</option>
                  <option value="dev_logs">개발일지 (dev_logs 테이블)</option>
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

          {/* 우측: 통합 등록된 글 목록 */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">전체 게시글 목록 ({items.length})</h2>

            {loading ? (
              <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">불러오는 중...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">등록된 글이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                          item.type === 'notice' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}>
                          {item.type === 'notice' ? '공지' : '개발일지'}
                        </span>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap line-clamp-2">{item.content}</p>
                      <span className="text-xs text-gray-500 block pt-1">
                        {new Date(item.created_at).toLocaleDateString()} 작성됨
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePost(item.id, item.type)}
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
