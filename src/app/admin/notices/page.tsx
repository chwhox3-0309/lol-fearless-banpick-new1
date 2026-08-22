'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export default function NoticeAdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('UPDATE');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. 공지사항 목록 불러오기 (Read)
  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching notices:', error);
    else setNotices(data || []);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 2. 공지사항 등록 및 수정 (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert('제목과 내용을 입력해주세요.');

    if (editingId) {
      // 수정 (Update)
      const { error } = await supabase
        .from('notices')
        .update({ title, content, category })
        .eq('id', editingId);

      if (error) alert('수정 실패: ' + error.message);
      else {
        alert('공지사항이 수정되었습니다.');
        setEditingId(null);
      }
    } else {
      // 등록 (Create)
      const { error } = await supabase
        .from('notices')
        .insert([{ title, content, category }]);

      if (error) alert('등록 실패: ' + error.message);
      else alert('새 공지사항이 등록되었습니다.');
    }

    setTitle('');
    setContent('');
    fetchNotices();
  };

  // 3. 수정 모드 진입
  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
  };

  // 4. 삭제 (Delete)
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('notices').delete().eq('id', id);

    if (error) alert('삭제 실패: ' + error.message);
    else {
      alert('삭제되었습니다.');
      fetchNotices();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">📢 공지사항 및 업데이트 관리</h1>

      {/* 작성/수정 폼 */}
      <form onSubmit={handleSubmit} className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4 mb-8">
        <div className="flex gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="UPDATE">업데이트</option>
            <option value="NOTICE">공지사항</option>
            <option value="EVENT">이벤트</option>
          </select>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <textarea
          placeholder="업데이트 상세 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"
        />

        <div className="flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setContent('');
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-xs"
          >
            {editingId ? '수정 완료' : '공지 등록'}
          </button>
        </div>
      </form>

      {/* 목록 출력 */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold mb-3">등록된 공지 목록</h2>
        {notices.map((notice) => (
          <div key={notice.id} className="bg-gray-900/80 border border-gray-800 p-4 rounded-xl flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded">
                  {notice.category}
                </span>
                <h3 className="font-bold text-base">{notice.title}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(notice.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-400 whitespace-pre-wrap mt-2">{notice.content}</p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleEdit(notice)}
                className="px-3 py-1 bg-amber-600/80 hover:bg-amber-600 text-xs rounded"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(notice.id)}
                className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-xs rounded"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}