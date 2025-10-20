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
        </div>
        <div className="mt-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} 강한 라이즈. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
