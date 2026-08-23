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

  // 글쓰기 모달 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dev-log-images') // 기존에 사용하는 스토리지 버킷명
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('dev-log-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert([{ title, content, image_url: imageUrl }]);

      if (error) throw error;

      alert('게시글이 성공적으로 등록되었습니다!');
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setIsWriteModalOpen(false);
      fetchPosts();
    } catch (e: any) {
      console.error('Failed to create post:', e);
      alert(`등록 중 오류가 발생했습니다: ${e.message || ''}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col space-y-6 py-8 px-4 relative">
      {/* 상단 타이틀 영역 및 글쓰기 버튼 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-teal-300 flex items-center gap-2">
            <span>📌</span> 자유 게시판 / 공지
          </h1>
          <p className="text-xs text-gray-400 mt-1">소통과 유용한 정보들을 공유하는 공간입니다.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWriteModalOpen(true)}
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

      {/* 검색 바 영역 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="제목 또는 내용을 검색하세요..."
          className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-teal-500/60 shadow-inner"
        />
      </div>

      {/* 게시글 목록 영역 (아코디언 구조) */}
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

      {/* 글쓰기 모달 팝업 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h2 className="text-base font-bold text-teal-300 flex items-center gap-2">
                <span>✍️</span> 새 게시글 작성
              </h2>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm font-bold px-2 py-1 rounded-lg bg-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">이미지 첨부 (선택)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3 relative w-28 h-28 border border-gray-800 rounded-lg overflow-hidden bg-gray-950">
                    <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-1 right-1 bg-red-600/85 text-white rounded-full p-1 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-lg transition-colors"
                >
                  {submitting ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
