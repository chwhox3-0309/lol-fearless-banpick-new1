'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
}

export default function LatestPostBanner() {
  const [latestPost, setLatestPost] = useState<Post | null>(null);

  useEffect(() => {
    async function fetchLatestPost() {
      try {
        const res = await fetch('/api/blog/latest');
        if (res.ok) {
          const post = await res.json();
          setLatestPost(post);
        }
      } catch (error) {
        console.error('Failed to fetch latest post:', error);
      }
    }

    fetchLatestPost();
  }, []);

  if (!latestPost) {
    return null; // Don't render anything if there is no post or it hasn't loaded yet
  }

  return (
    <div className="bg-purple-600 text-white p-3 text-center relative">
      <p>
        <span className="font-bold mr-2">최신 글:</span>
        <Link href={`/blog/${latestPost.id}`} className="hover:underline">
          {latestPost.title}
        </Link>
      </p>
    </div>
  );
}