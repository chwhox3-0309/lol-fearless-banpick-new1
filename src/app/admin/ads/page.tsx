'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Advertisement {
  id: string;
  title: string;
  position: string;
  size: string;
  ad_type: string;
  ad_content: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// 💡 관리자로 허용할 이메일 주소 목록 (본인의 Supabase 계정 이메일 입력)
const ADMIN_EMAILS = ['admin@example.com', 'your-real-email@gmail.com'];

export default function AdminAdsPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 로그인 폼 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // 💡 수정 모드 상태 관리 (null이면 등록 모드, string(id)이면 수정 모드)
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // 광고 폼 입력 상태
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('main_top');
  const [size, setSize] = useState('728x90');
  const [adContent, setAdContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. 페이지 진입 시 Supabase 세션 확인
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthLoading(false);

      if (session?.user && ADMIN_EMAILS.includes(session.user.email || '')) {
        fetchAds();
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user && ADMIN_EMAILS.includes(session.user.email || '')) {
        fetchAds();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase Auth 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!ADMIN_EMAILS.includes(email)) {
      setLoginError('관리자 권한이 없는 이메일 계정입니다.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError('로그인 실패: ' + error.message);
    } else {
      setUser(data.user);
      fetchAds();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const fetchAds = async () => {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('광고 목록 불러오기 실패:', error.message);
    } else {
      setAds(data || []);
    }
    setDataLoading(false);
  };

  // datetime-local input용 ISO 포맷 변환 (YYYY-MM-DDTHH:mm)
  const formatToLocalISO = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // 💡 특정 광고 '수정' 버튼 클릭 시 폼에 데이터 채우기
  const handleStartEdit = (ad: Advertisement) => {
    setEditingAdId(ad.id);
    setTitle(ad.title);
    setPosition(ad.position);
    setSize(ad.size);
    setAdContent(ad.ad_content);
    setStartDate(formatToLocalISO(ad.start_date));
    setEndDate(formatToLocalISO(ad.end_date));

    // 화면 스크롤을 상단 폼으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 💡 수정 취소 및 폼 초기화
  const handleCancelEdit = () => {
    setEditingAdId(null);
    setTitle('');
    setPosition('main_top');
    setSize('728x90');
    setAdContent('');
    setStartDate('');
    setEndDate('');
  };

  // 💡 광고 등록 및 수정 전송 제출 함수
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !adContent || !startDate || !endDate) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    const payload = {
      title,
      position,
      size,
      ad_type: 'iframe',
      ad_content: adContent,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
    };

    if (editingAdId) {
      // ✏️ 기존 광고 수정 (UPDATE)
      const { error } = await supabase
        .from('advertisements')
        .update(payload)
        .eq('id', editingAdId);

      if (error) {
        alert('광고 수정 실패: ' + error.message);
      } else {
        alert('광고가 성공적으로 수정되었습니다.');
        handleCancelEdit();
        fetchAds();
      }
    } else {
      // ➕ 새 광고 등록 (INSERT)
      const { error } = await supabase.from('advertisements').insert([
        {
          ...payload,
          is_active: true,
        },
      ]);

      if (error) {
        alert('광고 등록 실패: ' + error.message);
      } else {
        alert('광고가 성공적으로 등록되었습니다.');
        handleCancelEdit();
        fetchAds();
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('상태 변경 실패: ' + error.message);
    } else {
      fetchAds();
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('정말 이 광고를 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('advertisements').delete().eq('id', id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      if (editingAdId === id) handleCancelEdit();
      fetchAds();
    }
  };

  if (authLoading) {
    return <div className="flex min-h-[70vh] items-center justify-center text-gray-400 text-xs">권한 확인 중...</div>;
  }

  // 🔒 로그인하지 않았거나 관리자 이메일이 아닌 경우 로그인 폼 노출
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 w-full max-w-md">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-2xl">🔒</span>
            <h2 className="text-xl font-bold text-white">관리자 전용 페이지</h2>
            <p className="text-xs text-gray-400">Supabase 관리자 계정으로 로그인해주세요.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xl font-medium">
              {loginError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">관리자 이메일</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer mt-2">
            관리자 로그인
          </button>
        </form>
      </div>
    );
  }

  // ✅ 인증된 관리자 대시보드 화면
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 py-6 text-gray-200 px-4">
      <div className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-full font-bold">ADMIN MODE</span>
            <span className="text-xs text-gray-400 font-mono">{user.email}</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">광고 관리 대시보드</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          로그아웃
        </button>
      </div>

      {/* 광고 등록/수정 폼 */}
      <form onSubmit={handleSubmitForm} className={`bg-gray-900 border p-6 rounded-2xl shadow-xl flex flex-col gap-4 transition-all ${
        editingAdId ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-gray-800'
      }`}>
        <div className="flex justify-between items-center">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${editingAdId ? 'text-amber-400' : 'text-teal-400'}`}>
            {editingAdId ? '✏️ 광고 정보 수정' : '➕ 새 광고 등록'}
          </h2>
          {editingAdId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
            >
              수정 취소하고 등록 모드로 전환
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">광고 이름</label>
            <input
              type="text"
              placeholder="예: 쿠팡 메인 배너"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">노출 위치 (Position)</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white"
            >
              <option value="main_top">main_top (메인 하단 배너)</option>
              <option value="completion_box">completion_box (밴픽 완료 모달)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">사이즈 규격</label>
            <input
              type="text"
              placeholder="예: 728x90"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">노출 시작일시</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">노출 종료일시</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400 font-medium">광고 HTML 코드 (iframe 등)</label>
          <textarea
            rows={3}
            placeholder="<iframe src='...' width='...' height='...'></iframe>"
            value={adContent}
            onChange={(e) => setAdContent(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white font-mono"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {editingAdId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            className={`px-6 py-2.5 text-white font-bold text-xs rounded-xl transition-all cursor-pointer ${
              editingAdId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-teal-600 hover:bg-teal-500'
            }`}
          >
            {editingAdId ? '수정 완료하기' : '광고 등록하기'}
          </button>
        </div>
      </form>

      {/* 등록된 광고 목록 테이블 */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
        <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">📋 등록된 광고 목록</h2>
        {dataLoading ? (
          <p className="text-xs text-gray-400 text-center py-8">불러오는 중...</p>
        ) : ads.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">등록된 광고가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-3">제목</th>
                  <th className="p-3">위치</th>
                  <th className="p-3">규격</th>
                  <th className="p-3">기간</th>
                  <th className="p-3 text-center">상태 (ON/OFF)</th>
                  <th className="p-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {ads.map((ad) => (
                  <tr key={ad.id} className={`hover:bg-gray-950/50 ${editingAdId === ad.id ? 'bg-amber-950/20' : ''}`}>
                    <td className="p-3 font-bold text-white">{ad.title}</td>
                    <td className="p-3 text-teal-300 font-mono">{ad.position}</td>
                    <td className="p-3 text-gray-400">{ad.size}</td>
                    <td className="p-3 text-gray-400 text-[11px]">
                      {new Date(ad.start_date).toLocaleDateString()} ~ {new Date(ad.end_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleActive(ad.id, ad.is_active)}
                        className={`px-3 py-1 rounded-full font-bold text-[10px] cursor-pointer transition-all ${
                          ad.is_active ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {ad.is_active ? 'ACTIVE (ON)' : 'INACTIVE (OFF)'}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {/* 💡 [수정] 버튼 클릭 시 해당 광고 데이터로 상단 폼이 채워집니다 */}
                      <button
                        onClick={() => handleStartEdit(ad)}
                        className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
