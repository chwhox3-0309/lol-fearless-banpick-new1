'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800/80 bg-[#0b0f19] text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-6">
        
        {/* 네비게이션 링크 목록 */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/about" className="hover:text-amber-400 transition-colors duration-300">
            소개
          </Link>
          <Link href="/privacy" className="hover:text-amber-400 transition-colors duration-300">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-amber-400 transition-colors duration-300">
            이용약관
          </Link>
          <Link href="/contact" className="hover:text-amber-400 transition-colors duration-300">
            문의하기
          </Link>
          <Link href="/dev-log" className="hover:text-amber-400 transition-colors duration-300">
            블로그
          </Link>
          <Link href="/recommended-bans" className="hover:text-amber-400 transition-colors duration-300">
            추천 밴
          </Link>
          <Link href="/tier-lists" className="hover:text-amber-400 transition-colors duration-300">
            티어 리스트
          </Link>
        </div>

        {/* 저작권 및 고지 문구 영역 */}
        <div className="space-y-2 text-xs text-gray-500 max-w-3xl leading-relaxed">
          <p>&copy; {new Date().getFullYear()} Draft Lab. All rights reserved.</p>
          <p>
            Draft Lab isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </div>

      </div>
    </footer>
  );
}
