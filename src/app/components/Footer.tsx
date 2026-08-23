'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-6">
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-300">
            소개
          </Link>
          <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">
            이용약관
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-300">
            문의하기
          </Link>
          <Link href="/dev-log" className="text-gray-400 hover:text-white transition-colors duration-300">
            블로그
          </Link>
          <Link href="/recommended-bans" className="text-gray-400 hover:text-white transition-colors duration-300">
            추천 밴
          </Link>
          <Link href="/tier-lists" className="text-gray-400 hover:text-white transition-colors duration-300">
            티어 리스트
          </Link>
        </div>
        <div className="mt-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Draft Lab. All rights reserved.</p>
          <p>Draft Lab isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.</p>
        </div>
      </div>
    </footer>
  );
}
