import Link from 'next/link';
import path from 'path';
import { promises as fs } from 'fs';

interface GuideContent {
  title: string;
  date: string;
  contentHtml: string;
  slug: string;
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  let guide: GuideContent | null = null;
  let error: string | null = null;

  try {
    const guidesDirectory = path.join(process.cwd(), 'src', 'data'); // Read from data directory
    const fileContents = await fs.readFile(path.join(guidesDirectory, 'guides.json'), 'utf8');
    const allGuides = JSON.parse(fileContents);

    // Find the guide from the parsed data
    const foundGuide = allGuides.find((g: GuideContent) => g.slug === slug);

    if (foundGuide) {
      guide = foundGuide;
    } else {
      error = 'Guide not found';
    }
  } catch (e: unknown) {
    console.error("Error processing guide data:", e);
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

export async function generateStaticParams() {
  const guidesDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(path.join(guidesDirectory, 'guides.json'), 'utf8');
  const allGuides: GuideContent[] = JSON.parse(fileContents);

  return allGuides.map((guide) => ({
    slug: guide.slug,
  }));
}
