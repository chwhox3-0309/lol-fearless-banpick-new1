'use client';

import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 브라우저에 이미 로그인된 세션이 있는지 확인
  useEffect(() => {
    const authStatus = sessionStorage.getItem('is_admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: 본인이 원하는 관리자 비밀번호로 변경하세요!
    const ADMIN_PASSWORD = 'my_secret_password123'; 

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('is_admin_authenticated', 'true');
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-955 text-white flex items-center justify-center">보안 확인 중...</div>;
  }

  // 로그인이 안 되어 있으면 비밀번호 입력 화면 출력
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">🔒 관리자 인증</h1>
            <p className="text-sm text-gray-400">관리자 페이지만의 접근 권한이 필요합니다.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="관리자 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-600/30"
            >
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 인증 완료 시 원래의 관리자 페이지 컨텐츠 렌더링
  return <>{children}</>;
}
