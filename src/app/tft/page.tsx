import { createClient } from '@supabase/supabase-js';
import TftListClient from './TftListClient'; // 프로젝트 내 TftListClient 경로 확인

// DB 변경 시 화면에 즉시 반영되도록 캐시 비활성화
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
      <TftListClient initialData={posts || []} />
    </div>
  );
}
