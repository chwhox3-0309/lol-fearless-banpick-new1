'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DevLog {
  id: string | number;
  title: string;
  content: string;
  created_at: string;
}

export default function AdminDevLogPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 로그인 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 글 작성 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 관리자 대시보드 데이터 (등록된 일지 목록)
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  // 세션 확인
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
      if (session) {
        fetchLogs();
      }
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchLogs();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 개발 일지 목록 불러오기
  const fetchLogs = async () => {
    setFetchingLogs(true);
    try {
      const { data, error } = await supabase
        .from('dev_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setFetchingLogs(false);
    }
  };

  // 로그인 핸들러
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(`로그인 실패: ${error.message}`);
    } else {
      alert('관리자로 로그인되었습니다.');
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLogs([]);
  };

  // 글 등록 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('dev_logs')
        .insert([{ title, content }]);

      if (error) throw error;

      alert('개발 일지가 성공적으로 등록되었습니다!');
      setTitle('');
      setContent('');
      fetchLogs(); // 목록 새로고침
    } catch (e: any) {
      console.error('Failed to write dev log:', e);
      alert(`등록 중 오류가 발생했습니다: ${e.message || '권한이 없을 수 있습니다.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 글 삭제 핸들러
  const handleDelete = async (id: string | number) => {
    if (!confirm('정말 이 개발 일지를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('dev_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('삭제되었습니다.');
      fetchLogs();
    } catch (e: any) {
      console.error('Failed to delete log:', e);
      alert(`삭제 실패: ${e.message}`);
    }
  };

  if (authLoading) {
    return <div className="text-center py-20 text-gray-400">인증 정보를 확인하는 중...</div>;
  }

  // 1단계: 로그인되지 않은 경우 로그인 화면 출력
  if (!session) {
    return (
      <div className="w-full max-w-[400px] mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-6 w-full shadow-2xl space-y-4">
          <div className="text-center">
            <h1 className="text-lg font-bold text-indigo-300">🔒 관리자 전용 로그인</h1>
            <p className="text-xs text-gray-400 mt-1">개발 일지 관리 페이지에 접근하려면 로그인하세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="관리자 이메일"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md"
            >
              로그인
            </button>
          </form>

          <div className="pt-2 flex justify-between text-xs">
            <Link href="/" className="text-gray-400 hover:text-white">← 홈으로</Link>
            <Link href="/dev-log" className="text-indigo-400 hover:underline">개발 일지 보기 →</Link>
          </div>
        </div>
      </div>
    );
  }

  // 2단계: 로그인 완료된 경우 관리자 대시보드 (작성 폼 + 관리 목록) 출력
  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col space-y-8 py-8 px-4">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-xl font-bold text-indigo-300">🛠️ 관리자 대시보드: Dev-log 관리</h1>
          <p className="text-xs text-gray-400 mt-0.5">현재 계정: <span className="text-indigo-400 font-mono">{session.user.email}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dev-log" className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-all">
            일지 페이지 보기
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-xs rounded-lg transition-all"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 새 글 작성 폼 */}
      <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 shadow-md space-y-4">
        <h2 className="text-sm font-bold text-gray-200 flex items-center gap-1.5">
          <span>✍️</span> 새 개발 일지 작성
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: [패치] Fearless 밴픽 UI 개선 및 버그 수정"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="업데이트된 상세 내용을 입력하세요..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg transition-all"
            >
              {submitting ? '등록 중...' : '개발 일지 등록'}
            </button>
          </div>
        </form>
      </div>

      {/* 등록된 개발 일지 목록 및 관리(삭제) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
          <span>📋</span> 등록된 개발 일지 관리 목록
        </h2>

        {fetchingLogs ? (
          <p className="text-xs text-gray-400 text-center py-6">목록을 불러오는 중...</p>
        ) : logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div 
                key={log.id}
                className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex justify-between items-center shadow"
              >
                <div className="space-y-1 overflow-hidden pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-100 truncate">{log.title}</h3>
                    <span className="text-[11px] text-gray-500 font-mono shrink-0">
                      {log.created_at ? log.created_at.split('T')[0] : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{log.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900 text-red-300 border border-red-700/50 rounded-lg text-xs font-semibold transition-all shrink-0"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-800/40 border border-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-400">등록된 개발 일지가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
