import { getPostData, getAllPostIds } from '@/lib/posts';
import React from 'react';
import Link from 'next/link';

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map(p => p.params);
}

export default async function Post({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <article className="container mx-auto prose prose-xl prose-invert">
        <div className="mb-8">
          <Link href="/blog" className="text-blue-400 hover:text-blue-300 font-semibold">
            &larr; 목록으로 돌아가기
          </Link>
        </div>
        <h1 className="font-bold mb-2">{postData.title}</h1>
        <div className="text-gray-400 mb-6">{postData.date}</div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>
  );
}
