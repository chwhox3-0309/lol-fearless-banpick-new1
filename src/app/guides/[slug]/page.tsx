import Link from 'next/link';
import path from 'path';
import { promises as fs } from 'fs';
import { notFound } from 'next/navigation';

interface Guide {
  slug: string;
  title: string;
  date: string;
  contentHtml: string;
}

// This function fetches all guides from the JSON file.
async function getGuides(): Promise<Guide[]> {
  const guidesDirectory = path.join(process.cwd(), 'src', 'data');
  try {
    const fileContents = await fs.readFile(path.join(guidesDirectory, 'guides.json'), 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read guides.json:", error);
    return [];
  }
}

// This function generates the static paths for each guide.
export async function generateStaticParams() {
  const guides = await getGuides();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

// This function gets the data for a single guide.
async function getGuide(slug: string): Promise<Guide | undefined> {
  const guides = await getGuides();
  return guides.find((guide) => guide.slug === slug);
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = await getGuide(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <Link href="/guides" className="absolute top-8 left-8 text-white text-3xl hover:text-gray-400 transition-colors">
        &larr;
      </Link>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">{guide.title}</h1>
        <p className="text-sm text-gray-400 text-center mb-8">{guide.date}</p>
        <div 
          className="prose prose-invert prose-lg max-w-none bg-gray-800 rounded-lg shadow-lg p-6"
          dangerouslySetInnerHTML={{ __html: guide.contentHtml }} 
        />
      </div>
    </div>
  );
}
