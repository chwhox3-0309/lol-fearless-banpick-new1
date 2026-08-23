'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface BoardPost {
  id: string | number;
  title: string;
  content: string;
  author_name?: string;
  created_at: string;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [myPostIds, setMyPostIds] = useState<(string | number)[]>([]);

  // 글쓰기/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMyPosts();
    fetchPosts();
  }, []);

  const loadMyPosts = () => {
    const savedMyPosts = localStorage.getItem('my_board_posts');
    if (savedMyPosts) {
      try {
        // 숫자형/문자형 ID 타입을 모두 원활하게 비교하기 위해 문자열 배열로 변환하여 관리
        const parsed = JSON.parse(savedMyPosts);
        setMyPostIds(parsed.map((id: any) => String(id)));
      } catch (e) {
        console.error(e);
      }
    }
  };

  async function fetchPosts() {
    try {
      setLoading(true);
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

  const handleOpenWriteModal = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setAuthorName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: BoardPost, e: React.MouseEvent) => {
    e.stopPropagation(); // 아코디언이 펼쳐지는 것 방지
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setAuthorName(post.author_name || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName.trim()) {
      alert('작성자, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // 수정 모드
        const { error } = await supabase
          .from('posts')
          .update({ title, content, author_name: authorName })
          .eq('id', editingId);

        if (error) throw error;
        alert('게시글이 성공적으로 수정되었습니다!');
      } else {
        // 작성 모드
        const dummyAuthorId = '00000000-0000-0000-0000-000000000000';
        const { data, error } = await supabase
          .from('posts')
          .insert([
            { 
              title, 
              content, 
              author_name: authorName,
              author_id: dummyAuthorId 
            }
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          const newId = String(data[0].id);
          const updatedMyIds = Array.from(new Set([newId, ...myPostIds]));
          setMyPostIds(updatedMyIds);
          localStorage.setItem('my_board_posts', JSON.stringify(updatedMyIds));
        }

        alert('게시글이 성공적으로 등록되었습니다!');
      }

      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setAuthorName('');
      setEditingId(null);
      fetchPosts();
    } catch (e: any) {
      console.error('Failed to save post:', e);
      alert(`처리 중 오류가 발생했습니다: ${e.message || ''}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation(); // 아코디언 펼침 방지
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;

      // 내가 쓴 글 목록에서도 제거
      const updatedMyIds = myPostIds.filter((postId) => postId !== String(id));
      setMyPostIds(updatedMyIds);
      localStorage.setItem('my_board_posts', JSON.stringify(updatedMyIds));

      alert('삭제되었습니다.');
      fetchPosts();
    } catch (e: any) {
      alert(`삭제 실패: ${e.message}`);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.author_name && post.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col space-y-6 py-8 px-4 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-teal-300 flex items-center gap-2">
            <span>📌</span> 자유 게시판 / 공지
          </h1>
          <p className="text-xs text-gray-400 mt-1">소통과 유용한 정보들을 공유하는 공간입니다.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenWriteModal}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-1"
          >
            ✍️ 글쓰기
          </button>
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
          placeholder="제목, 내용 또는 작성자를 검색하세요..."
          className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-teal-500/60 shadow-inner"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-16 text-xs">게시글을 불러오는 중입니다...</p>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isExpanded = expandedId === post.id;
            const isMyPost = myPostIds.includes(String(post.id));

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
                    {post.author_name && (
                      <p className="text-xs text-gray-400 pl-5">작성자: <span className="text-teal-300">{post.author_name}</span></p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {/* 내가 작성한 글일 경우에만 수정/삭제 버튼 노출 */}
                    {isMyPost && (
                      <div className="flex items-center gap-1.5 mr-2">
                        <button
                          onClick={(e) => handleOpenEditModal(post, e)}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-teal-300 text-[11px] font-semibold rounded-md transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={(e) => handleDelete(post.id, e)}
                          className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 text-[11px] font-semibold rounded-md transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}

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

      {/* 글쓰기/수정 모달 팝업 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h2 className="text-base font-bold text-teal-300 flex items-center gap-2">
                <span>{editingId ? '✏️' : '✍️'}</span> {editingId ? '게시글 수정하기' : '새 게시글 작성'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm font-bold px-2 py-1 rounded-lg bg-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">작성자</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="작성자 이름을 입력하세요"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요..."
                  rows={6}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-teal-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-lg transition-colors"
                >
                  {submitting ? '처리 중...' : editingId ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
