'use client';

import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-16">
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">문의하기</h1>
        
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">피드백 및 문의</h2>
          <p className="text-lg leading-relaxed mb-6">
            LoL Fearless Banpick 시뮬레이터에 대한 질문, 버그 리포트, 기능 제안 등 모든 피드백을 환영합니다.
            <br />
            아래 이메일 주소로 연락주시면 최대한 빠르게 확인하고 답변드리겠습니다.
          </p>
          <a 
            href="mailto:chcorps0705@gmail.com" 
            className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
          >
            chcorps0705@gmail.com
          </a>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold text-xl">
            &larr; 밴픽 시뮬레이터로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
