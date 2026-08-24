'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface DramaOstItem {
  id: number;
  title: string;
  category: string;
  broadcast: string;
  ost_title: string;
  artist: string;
  description: string;
}

export default function AdminJPopPage() {
  const [items, setItems] = useState<DramaOstItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null); // 수정 중인 글 ID

  // 폼 입력 상태
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('2026 1분기');
  const [broadcast, setBroadcast] = useState('TBS');
  const [ostTitle, setOstTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 목록 불러오기
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('jpop_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('목록 로드 실패:', error);
    } else {
      setItems(data || []);
    }
  };

  // 등록 또는 수정 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ostTitle || !artist) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    if (editingId) {
      // [수정 모드] Update
      const { error } = await supabase
        .from('jpop_posts')
        .update({ title, category, broadcast, ost_title: ostTitle, artist, description })
        .eq('id', editingId);

      if (error) {
        alert('수정 실패: ' + error.message);
      } else {
        alert('성공적으로 수정되었습니다!');
        resetForm();
        fetchPosts();
      }
    } else {
      // [신규 등록 모드] Insert
      const { error } = await supabase
        .from('jpop_posts')
        .insert([{ title, category, broadcast, ost_title: ostTitle, artist, description }]);

      if (error) {
        alert('등록 실패: ' + error.message);
      } else {
        alert('성공적으로 등록되었습니다!');
        resetForm();
        fetchPosts();
      }
    }
    setIsSubmitting(false);
  };

  // 수정 버튼을 눌렀을 때 폼에 데이터 채우기
  const handleEditClick = (item: DramaOstItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setBroadcast(item.broadcast || '');
    setOstTitle(item.ost_title);
    setArtist(item.artist);
    setDescription(item.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 삭제 기능
  const handleDelete = async (id: number) => {
    if (!confirm('정말 이 게시물을 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('jpop_posts').delete().eq('id', id);
    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      alert('삭제되었습니다.');
      fetchPosts();
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('2026 1분기');
    setBroadcast('TBS');
    setOstTitle('');
    setArtist('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h1 className="text-xl font-bold">J-Pop / 일드 OST 관리자 센터</h1>
          <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700">
            ← 사이트로 돌아가기
          </Link>
        </div>

        {/* 등록 / 수정 폼 */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-purple-400">
              {editingId ? `✏️ 게시물 수정 중 (ID: ${editingId})` : '➕ 새 게시물 등록'}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-gray-400 hover:text-white underline">
                수정 취소하고 새로 등록하기
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">드라마/콘텐츠 제목 *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 언내추럴" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">카테고리 (분기/연도)</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="예: 2026 1분기" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">방송국 / 플랫폼</label>
              <input type="text" value={broadcast} onChange={e => setBroadcast(e.target.value)} placeholder="예: TBS / Netflix" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">OST 곡 제목 *</label>
              <input type="text" value={ostTitle} onChange={e => setOstTitle(e.target.value)} placeholder="예: Lemon" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">아티스트 *</label>
              <input type="text" value={artist} onChange={e => setArtist(e.target.value)} placeholder="예: Kenshi Yonezu" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white" required />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">설명</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="드라마나 곡에 대한 설명..." className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white resize-none" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-600/25">
            {isSubmitting ? '처리 중...' : editingId ? '수정 완료하기' : '게시물 등록하기'}
          </button>
        </form>

        {/* 등록된 게시물 목록 및 관리 기능 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-semibold text-gray-200">등록된 목록 관리 ({items.length}건)</h2>
          
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-950 border border-gray-800/80 rounded-xl p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">{item.category}</span>
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-400">🎵 {item.ost_title} - {item.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(item)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg transition-colors border border-gray-700">
                    수정
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors border border-red-500/20">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
