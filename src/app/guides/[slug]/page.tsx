import Link from 'next/link';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import path from 'path';
import { promises as fs } from 'fs';

interface GuideContent {
  title: string;
  date: string;
  contentHtml: string;
}

export default async function GuidePage({ params }: { params: { slug: string } }) { // Made async
  const { slug } = params;
  let guide: GuideContent | null = null;
  let error: string | null = null;

  try {
    const guidesDirectory = path.join(process.cwd(), 'src', 'guides');
    const filePath = path.join(guidesDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(filePath, 'utf8');

    const { data, content } = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    guide = {
      title: data.title,
      date: data.date,
      contentHtml,
    };
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">가이드를 불러오는데 실패했습니다: {error}</div>;
  }

  if (!guide) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">가이드를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <Link href="/guides" className="absolute top-8 left-8 text-white text-3xl hover:text-gray-400 transition-colors">
        &larr; 가이드 목록으로
      </Link>
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold mb-4 text-blue-400">{guide.title}</h1>
        <p className="text-sm text-gray-400 mb-6">{guide.date}</p>
        <div className="prose prose-invert max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: guide.contentHtml }} />
      </div>
    </div>
  );
}
