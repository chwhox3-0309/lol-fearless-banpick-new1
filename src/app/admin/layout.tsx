'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 만약 현재 경로가 로그인 페이지(/admin/login)라면 보안 체크를 하지 않고 바로 통과시킴
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.replace('/admin/login');
        setIsLoading(false);
        return;
      }

      // DB의 admins 테이블에 현재 로그인한 이메일이 존재하는지 확인
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', session.user.email)
        .single();

      if (error || !data) {
        await supabase.auth.signOut();
        router.replace('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAdmin();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        권한 확인 중...
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
