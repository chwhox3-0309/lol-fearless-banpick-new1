// src/app/tft/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import TftBoardClient from './TftBoardClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: post } = await supabase
    .from('tft_posts')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!post) {
    return { title: 'TFT 메타 덱을 찾을 수 없습니다.' };
  }

  return {
    title: `${post.comp_name} - TFT 메타 덱 공략 & 배치도 | LoL Fearless`,
    description: post.description || `${post.comp_name} 메타 조합의 28칸 배치도 및 추천 아이템 정보입니다.`,
  };
}

export default async function TftDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  const { data: post, error } = await supabase
    .from('tft_posts')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <TftBoardClient post={post} />
      </div>
    </main>
  );
}
