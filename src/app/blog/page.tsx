import React from 'react';
import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';

export default function BlogPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold">
            &larr; 메인 페이지로 돌아가기
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center">블로그</h1>
        <p className="text-center text-gray-400 mb-8">
          최신 패치 분석, 메타 리포트 등 다양한 소식이 업데이트될 예정입니다.
        </p>
        <section>
          <ul className="space-y-4">
            {allPostsData.map(({ id, date, title }) => (
              <li key={id} className="bg-gray-800 shadow-md rounded-lg p-4 hover:bg-gray-700 transition-colors duration-200">
                <Link href={`/blog/${id}`}>
                  <h2 className="text-2xl font-semibold text-blue-400 hover:underline">{title}</h2>
                </Link>
                <small className="text-gray-400">{date}</small>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
