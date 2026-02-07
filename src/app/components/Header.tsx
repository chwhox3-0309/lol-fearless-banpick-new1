'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">GG Tools</h1>
        <button
          className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        <nav className={`${isMenuOpen ? 'block' : 'hidden'} lg:block absolute lg:relative top-16 lg:top-auto left-0 w-full lg:w-auto bg-gray-800 lg:bg-transparent p-4 lg:p-0 z-10`}>
          <div className="flex flex-col lg:flex-row lg:space-x-4 lg:items-center">
            <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setIsMenuOpen(false)}>
              LOL
            </Link>
            <Link href="/wos" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/wos') ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setIsMenuOpen(false)}>
              WOS
            </Link>

            <Link href="/j-pop" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/j-pop') ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setIsMenuOpen(false)}>
              J-Pop
            </Link>
            <Link href="/guides" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/guides') ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setIsMenuOpen(false)}>
              전략 가이드
            </Link>
            <Link href="/ladder" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/ladder') ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => setIsMenuOpen(false)}>
              사다리 타기
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
