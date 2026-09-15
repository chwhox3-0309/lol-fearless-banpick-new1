import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TftDetailPage({ params }: PageProps) {
  const { id } = await params;

  // URL의 id 값에 해당하는 덱 데이터 1건 조회
  const { data: deck, error } = await supabase
    .from('tft_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !deck) {
    notFound();
  }

  // 콤마(,)로 구분된 핵심 챔피언 문자열을 배열로 변환
  const keyChampions = deck.key_champions
    ? deck.key_champions.split(',').map((champ: string) => champ.trim())
    : [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-4xl mx-auto">
      <Link
        href="/tft"
        className="inline-block mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition"
      >
        ← 덱 목록으로 돌아가기
      </Link>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-6">
        <div className="border-b border-slate-700 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-600/30 text-blue-400 border border-blue-500/30">
              {deck.season}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-600/30 text-amber-400 border border-amber-500/30">
              {deck.tier}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{deck.comp_name}</h1>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-2">핵심 챔피언 조합</h2>
          <div className="flex flex-wrap gap-2">
            {keyChampions.map((champ: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs font-mono text-slate-200"
              >
                {champ}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-1">추천 아이템</h2>
          <p className="text-slate-200 text-sm">{deck.items || '최상위 랭커 우승 아이템 빌드'}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-1">덱 설명 및 운영법</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{deck.description}</p>
        </div>
      </div>
    </div>
  );
}
