'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
}

export default function AdminNoticesPage() {
  const { data: session, status } = useSession();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null);
  const [category, setCategory] = useState('공지');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices.sort((a: Notice, b: Notice) => {
          const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateComparison === 0) {
            return b.id - a.id;
          }
          return dateComparison;
        }));
      } else {
        setMessage('공지사항 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setMessage('네트워크 오류: 공지사항 목록을 불러올 수 없습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!title || !content || !date || !category) {
      setMessage('모든 필드를 채워주세요.');
      return;
    }

    const method = editingNoticeId ? 'PUT' : 'POST';
    const body = editingNoticeId ? JSON.stringify({ id: editingNoticeId, title, content, date, category }) : JSON.stringify({ title, content, date, category });

    try {
      const res = await fetch(editingNoticeId ? `/api/notices?id=${editingNoticeId}` : '/api/notices', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (res.ok) {
        setMessage(`공지사항이 성공적으로 ${editingNoticeId ? '수정' : '등록'}되었습니다!`);
        setTitle('');
        setContent('');
        setDate(new Date().toISOString().split('T')[0]);
        setEditingNoticeId(null);
        fetchNotices();
      } else {
        const errorData = await res.json();
        setMessage(`공지사항 ${editingNoticeId ? '수정' : '등록'} 실패: ${errorData.error || res.statusText}`);
      }
    } catch (error: unknown) {
      setMessage(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNoticeId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setDate(notice.date);
    setCategory(notice.category);
    setMessage('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }
    try {
      const res = await fetch(`/api/notices?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('공지사항이 성공적으로 삭제되었습니다!');
        fetchNotices();
      } else {
        const errorData = await res.json();
        setMessage(`공지사항 삭제 실패: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      setMessage('네트워크 오류: 공지사항을 삭제할 수 없습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoticeId(null);
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('공지');
    setMessage('');
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">로딩 중...</div>;
  }

  if (!session || session.user?.githubUsername !== 'chwhox3-0309') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">접근 권한 없음</h1>
        <p className="text-lg text-gray-300 mb-4">이 페이지는 관리자만 접근할 수 있습니다.</p>
        {!session ? (
          <button
            onClick={() => signIn('github')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            GitHub으로 로그인
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            로그아웃
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <h1 className="text-4xl font-bold mb-8 text-center">관리자: 공지사항 {editingNoticeId ? '수정' : '등록'}</h1>
      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-200 text-sm font-bold mb-2">제목:</label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-gray-200 text-sm font-bold mb-2">내용:</label>
            <textarea
              id="content"
              rows={5}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="date" className="block text-gray-200 text-sm font-bold mb-2">날짜:</label>
            <input
              type="date"
              id="date"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-gray-200 text-sm font-bold mb-2">카테고리:</label>
            <select
              id="category"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="공지">공지</option>
              <option value="업데이트">업데이트</option>
              <option value="이벤트">이벤트</option>
              <option value="점검">점검</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-grow"
            >
              공지사항 {editingNoticeId ? '수정' : '등록'}
            </button>
            {editingNoticeId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                취소
              </button>
            )}
          </div>
        </form>
        {message && (
          <p className="mt-4 text-center font-bold" style={{ color: message.includes('성공') ? '#48BB78' : '#F56565' }}>
            {message}
          </p>
        )}
      </div>

      <h2 className="text-3xl font-bold mb-6 text-center">등록된 공지사항</h2>
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        {notices.length === 0 ? (
          <p className="text-center text-gray-400">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="space-y-6">
            {notices.map((notice) => (
              <li key={notice.id} className="border-b border-gray-700 pb-6 last:border-b-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-grow mb-4 md:mb-0">
                  <p className="text-sm text-gray-400 mb-1">[{notice.category}] {notice.date}</p>
                  <h3 className="text-xl font-semibold text-blue-400 mb-2">{notice.title}</h3>
                  <p className="text-base leading-relaxed text-gray-300 whitespace-pre-wrap">{notice.content}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
