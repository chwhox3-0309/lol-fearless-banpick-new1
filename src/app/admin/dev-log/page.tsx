'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DevLog {
  id: string | number;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
}

export default function AdminDevLogPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 로그인 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 글 작성/수정 폼 상태
  const [editingId, setEditingId] = useState<string | number | null>(null); // 수정 중인 글 ID (null이면 작성 모드)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // 수정 시 기존 이미지 유지용
  const [submitting, setSubmitting] = useState(false);

  // 목록 상태
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
      if (session) fetchLogs();
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLogs();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchLogs = async () => {
    setFetchingLogs(true);
    try {
      const { data, error } = await supabase
        .from('dev_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setLogs(data);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setFetchingLogs(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(`로그인 실패: ${error.message}`);
    else alert('관리자로 로그인되었습니다.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLogs([]);
  };

  // 이미지 선택 시 미리보기 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  // 수정 모드로 진입
  const handleStartEdit = (log: DevLog) => {
    setEditingId(log.id);
    setTitle(log.title);
    setContent(log.content);
    setExistingImageUrl(log.image_url || null);
    setImagePreview(log.image_url || null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 등록 및 수정 통합 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = existingImageUrl;

      // 1. 새로운 이미지가 선택되었다면 Supabase Storage에 업로드
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dev-log-images') // 생성한 버킷 이름
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Public URL 가져오기
        const { data: publicUrlData } = supabase.storage
          .from('dev-log-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      if (editingId) {
        // [수정 모드] 데이터 업데이트
        const { error } = await supabase
          .from('dev_logs')
          .update({ title, content, image_url: imageUrl })
          .eq('id', editingId);

        if (error) throw error;
        alert('개발 일지가 성공적으로 수정되었습니다!');
      } else {
        // [작성 모드] 데이터 새로 등록
        const { error } = await supabase
          .from('dev_logs')
          .insert([{ title, content, image_url: imageUrl }]);

        if (error) throw error;
        alert('개발 일지가 성공적으로 등록되었습니다!');
      }

      resetForm();
      fetchLogs();
    } catch (e: any) {
      console.error('Failed to save dev log:', e);
      alert(`처리 중 오류가 발생했습니다: ${e.message || ''}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('정말 이 개발 일지를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('dev_logs').delete().eq('id', id);
      if (error) throw error;
      alert('삭제되었습니다.');
      fetchLogs();
    } catch (e: any) {
      alert(`삭제 실패: ${e.message}`);
    }
  };

  if (authLoading) return <div className="text-center py-20 text-gray-400">인증 정보를 확인하는 중...</div>;

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
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md">
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

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col space-y-8 py-8 px-4">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-xl font-bold text-indigo-300">🛠️ 관리자 대시보드: Dev-log 관리</h1>
          <p className="text-xs text-gray-400 mt-0.5">계정: <span className="text-indigo-400 font-mono">{session.user.email}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dev-log" className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-all">
            일지 페이지 보기
          </Link>
          <button onClick={handleLogout} className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-xs rounded-lg transition-all">
            로그아웃
          </button>
        </div>
      </div>

      {/* 작성 / 수정 폼 박스 */}
      <div className={`border rounded-xl p-6 shadow-md space-y-4 transition-colors ${editingId ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-gray-800/80 border-gray-700'}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-1.5">
            <span>{editingId ? '✏️' : '✍️'}</span> {editingId ? '개발 일지 수정하기' : '새 개발 일지 작성'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              수정 취소 (새 글 작성으로 전환)
            </button>
          )}
        </div>

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
              rows={6}
              placeholder="업데이트된 상세 내용을 입력하세요..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* 사진 첨부 필드 */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">대표 이미지 첨부</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3 relative w-32 h-32 border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
                <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); setExistingImageUrl(null); }}
                  className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 text-[10px] hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-semibold rounded-lg transition-all"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg transition-all"
            >
              {submitting ? '처리 중...' : editingId ? '수정 완료하기' : '개발 일지 등록'}
            </button>
          </div>
        </form>
      </div>

      {/* 등록된 목록 및 수정/삭제 버튼 */}
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
                <div className="space-y-1 overflow-hidden pr-4 flex items-center gap-3">
                  {log.image_url && (
                    <img src={log.image_url} alt="썸네일" className="w-12 h-12 object-cover rounded-lg border border-gray-700 shrink-0" />
                  )}
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-100 truncate">{log.title}</h3>
                      <span className="text-[11px] text-gray-500 font-mono shrink-0">
                        {log.created_at ? log.created_at.split('T')[0] : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{log.content}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleStartEdit(log)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-indigo-300 border border-gray-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900 text-red-300 border border-red-700/50 rounded-lg text-xs font-semibold transition-all"
                  >
                    삭제
                  </button>
                </div>
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
