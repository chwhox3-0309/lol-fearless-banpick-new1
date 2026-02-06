'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center">
        <h1 className="text-xl font-bold mr-8">GG Tools</h1>
        <nav>
          <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            LOL
          </Link>
          <Link href="/wos" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/wos') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            WOS
          </Link>

          <Link href="/j-pop" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/j-pop') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            J-Pop
          </Link>
          <Link href="/guides" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/guides') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            전략 가이드
          </Link>
          <Link href="/ladder" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/ladder') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            사다리 타기
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
