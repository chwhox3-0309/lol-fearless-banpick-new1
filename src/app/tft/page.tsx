import { createClient } from '@supabase/supabase-js';
import TftListClient from './TftListClient';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function TftPage() {
  const { data: posts, error } = await supabase
    .from('tft_posts')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Supabase 조회 실패:', error.message);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🏆 챌린저 실시간 우승 메타 덱
      </h1>
      {/* initialData -> initialItems 로 수정 */}
      <TftListClient initialItems={posts || []} />
    </div>
  );
}
