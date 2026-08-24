'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: '리그 오브 레전드', href: '/' },
    { name: 'WOS', href: '/wos' },
    { name: 'J-Pop', href: '/j-pop' },
    { name: 'TFT', href: '/tft' },
    { name: '사다리 타기', href: '/ladder' },
  ];

  return (
    <header className="w-full bg-gray-950/90 border-b border-gray-800/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 영역 */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            🧪
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-teal-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              DRAFT LAB
            </span>
            <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 border border-teal-500/30 px-1.5 py-0.2 rounded uppercase tracking-wider">
              BETA
            </span>
          </div>
        </Link>

        {/* 데스크톱 네비게이션 (md 이상 노출) */}
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'text-teal-300 font-bold bg-teal-950/50 border border-teal-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 햄버거 버튼 (md 미만 노출) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
          aria-label="메뉴 열기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'text-teal-300 bg-teal-950/60 font-bold border-l-4 border-teal-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
