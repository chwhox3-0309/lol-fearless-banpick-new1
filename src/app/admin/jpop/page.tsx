'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminJPopPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('2026 1분기');
  const [broadcast, setBroadcast] = useState('TBS');
  const [ostTitle, setOstTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ostTitle || !artist) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('jpop_posts').insert([
      { title, category, broadcast, ost_title: ostTitle, artist, description }
    ]);

    if (error) {
      alert('등록 실패: ' + error.message);
    } else {
      alert('성공적으로 등록되었습니다!');
      setTitle('');
      setOstTitle('');
      setArtist('');
      setDescription('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">J-Pop / 일드 OST 관리자 등록</h1>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white">← 관리자 홈</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">드라마/콘텐츠 제목</label>
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
              <label className="block text-xs text-gray-400 mb-1">OST 곡 제목</label>
              <input type="text" value={ostTitle} onChange={e => setOstTitle(e.target.value)} placeholder="예: Lemon" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">아티스트</label>
              <input type="text" value={artist} onChange={e => setArtist(e.target.value)} placeholder="예: Kenshi Yonezu" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white" required />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">설명</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="드라마나 곡에 대한 설명..." className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white resize-none" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">
            {isSubmitting ? '등록 중...' : '게시물 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
