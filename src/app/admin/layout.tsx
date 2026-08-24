'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // 프로젝트 내 기존 supabase 클라이언트 경로

// 본인만 사용하는 관리자 이메일 주소 입력
const ADMIN_EMAIL = 'your_email@gmail.com'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // 로그인이 되어있고, 세션의 이메일이 관리자 이메일과 일치하는지 확인
      if (session?.user && session.user.email === ADMIN_EMAIL) {
        setIsAuthenticated(true);
      } else {
        router.replace('/admin/login');
      }
      setIsLoading(false);
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        보안 권한 확인 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
