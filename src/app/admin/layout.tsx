'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 본인만 사용하는 관리자 이메일 주소 입력
const ADMIN_EMAIL = 'your_email@gmail.com'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // 로그인이 되어있고, 세션의 이메일이 관리자 이메일과 일치하는지 확인
      if (session?.user && session.user.email === ADMIN_EMAIL) {
        setIsAuthenticated(true);
      } else {
        // 권한이 없거나 로그아웃 상태면 로그인 페이지로 이동
        router.replace('/admin/login');
      }
      setIsLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        보안 권한 확인 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 리다이렉트 되는 동안 빈 화면 유지
  }

  return <>{children}</>;
}
