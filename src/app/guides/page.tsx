import Link from 'next/link';
import matter from 'gray-matter';
import path from 'path';
import { promises as fs } from 'fs';

interface GuideMeta {
  slug: string;
  title: string;
  date: string;
}

export default async function GuidesPage() { // Made async
  let guides: GuideMeta[] = [];
  let error: string | null = null;

  try {
    const guidesDirectory = path.join(process.cwd(), 'src', 'guides');
    const filenames = await fs.readdir(guidesDirectory);

    const allGuides = await Promise.all(filenames.map(async (filename) => {
      const filePath = path.join(guidesDirectory, filename);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug: data.slug,
        title: data.title,
        date: data.date,
      };
    }));

    // Sort guides by date in descending order
    guides = allGuides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">가이드를 불러오는데 실패했습니다: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <Link href="/" className="absolute top-8 left-8 text-white text-3xl hover:text-gray-400 transition-colors">
        &larr;
      </Link>
      <h1 className="text-4xl font-bold mb-8 text-center">전략 가이드</h1>
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        {guides.length === 0 ? (
          <p className="text-center text-gray-400">등록된 가이드가 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {guides.map((guide) => (
              <li key={guide.slug} className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                <Link href={`/guides/${guide.slug}`} className="block hover:text-blue-400 transition-colors">
                  <h2 className="text-2xl font-semibold">{guide.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{guide.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
