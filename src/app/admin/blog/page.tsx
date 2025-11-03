'use client';

import React, { useState, useEffect } from 'react';
import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface PostData {
  id: string;
  title: string;
  date: string;
}

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    // This function is synchronous, but we wrap it in useEffect
    // to ensure it runs only on the client side.
    setPosts(getSortedPostsData());
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(`'${id}' 게시물을 정말로 삭제하시겠습니까?`)) {
      return;
    }

    const res = await fetch(`/api/blog/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setPosts(posts.filter((post) => post.id !== id));
      alert('게시물이 삭제되었습니다.');
    } else {
      alert('삭제에 실패했습니다.');
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <p>이 페이지에 접근할 권한이 없습니다. 관리자로 로그인해주세요.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">블로그 관리</h1>
        <Link href="/admin/blog/new" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          새 글 작성
        </Link>
      </div>
      <div className="bg-gray-800 shadow-md rounded-lg p-4">
        <ul className="space-y-4">
          {posts.map(({ id, title, date }) => (
            <li key={id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="text-gray-400 text-sm">{date}</p>
              </div>
              <div className="space-x-2">
                <Link href={`/admin/blog/edit/${id}`} className="text-green-400 hover:text-green-300">
                  수정
                </Link>
                <button onClick={() => handleDelete(id)} className="text-red-400 hover:text-red-300">
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
