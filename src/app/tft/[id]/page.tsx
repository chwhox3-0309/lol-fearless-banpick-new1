import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

// 챔피언 한글명 매핑 테이블
const CHAMPION_KO_MAP: Record<string, string> = {
  Kennen: '케넨',
  ElderDragon: '장로 드래곤',
  Maokai: '마오카이',
  Draven: '드레이븐',
  Ivern: '아이번',
  Talon: '탈론',
  Ahri: '아리',
  Akali: '아칼리',
  Ashe: '애쉬',
  Blitzcrank: '블리츠크랭크',
  Ezreal: '이즈리얼',
  Garen: '가렌',
  Jinx: '징크스',
  Kassadin: '카사딘',
  Katarina: '카타리나',
  Kayle: '케일',
  LeeSin: '리 신',
  Lulu: '룰루',
  Lux: '럭스',
  Malphite: '말파이트',
  Morgana: '모르가나',
  Nami: '나미',
  Nautilus: '노틸러스',
  Neeko: '니코',
  Nunu: '누누와 윌럼프',
  Olaf: '올라프',
  Poppy: '뽀삐',
  Pyke: '파이크',
  Riven: '리븐',
  Rumble: '럼블',
  Samira: '사미라',
  Sejuani: '세주아니',
  Sett: '세트',
  Shen: '쉔',
  Shyvana: '쉬바나',
  Sion: '사이온',
  Sona: '소나',
  Swain: '스웨인',
  Syndra: '신드라',
  TahmKench: '탐 켄치',
  Taliyah: '탈리야',
  Taric: '타릭',
  Teemo: '티모',
  Thresh: '쓰레쉬',
  Tristana: '트리스티나',
  TwistedFate: '트위스티드 페이트',
  Twitch: '트위치',
  Udyr: '우디르',
  Urgot: '우르곳',
  Vayne: '베인',
  Veigar: '베이가',
  Velkoz: '벨코즈',
  Vex: '벡스',
  Vi: '바이',
  Viego: '비에고',
  Viktor: '빅토르',
  Vladimir: '블라디미르',
  Volibear: '볼리베어',
  Warwick: '워윅',
  Xayah: '자야',
  Xerath: '제라스',
  XinZhao: '신 짜오',
  Yasuo: '야스오',
  Yone: '요네',
  Yorick: '요릭',
  Yuumi: '유미',
  Zac: '자크',
  Zed: '제드',
  Zeri: '제리',
  Ziggs: '직스',
  Zilean: '질리언',
  Zoe: '조이',
  Zyra: '자이라',
};

// DB의 챔피언 식별자 정제 및 이미지/한글이름 추출
function getChampionInfo(rawChampId: string) {
  if (!rawChampId) return { cleanName: '', displayName: '', imageUrl: '' };

  // 'DA_18_Kennen', 'TDA_18_ElderDragon', 'DA_Draven18' 등 접두사와 숫자 정제
  let cleanName = rawChampId
    .trim()
    .replace(/^(TFT|TDA|DA|Set)?_?\d*_?/i, '') // 접두사(DA_18_, TDA_18_ 등) 제거
    .replace(/\d+$/, '');                      // 접미 숫자(Draven18 등) 제거

  // 첫 글자 대문자 처리
  if (cleanName.length > 0) {
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  // 한글 표기명 (없으면 영문 정제명 사용)
  const displayName = CHAMPION_KO_MAP[cleanName] || cleanName || rawChampId;

  // Riot Data Dragon 최신 CDN 이미지 경로
  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${cleanName}.png`;

  return { cleanName, displayName, imageUrl };
}

export default async function TftDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  const supabase = getSupabase();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold text-red-400 mb-2">⚠️ Vercel 환경 변수 누락</h1>
        <p className="text-slate-400 text-sm text-center">
          Vercel 대시보드에 <code className="bg-slate-800 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> 및{' '}
          <code className="bg-slate-800 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>를 추가해 주세요.
        </p>
      </div>
    );
  }

  const { data: deck, error } = await supabase
    .from('tft_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !deck) {
    notFound();
  }

  // 수정 전 코드 대신 아래 코드로 교체
  const rawChampions = deck.key_champions
    ? String(deck.key_champions)
        .split(/[,;\n/]+/) // 콤마, 세미콜론, 줄바꿈 등 어떤 구분자든 완벽히 분리
        .map((champ: string) => champ.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-5xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <Link
        href="/tft"
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 transition"
      >
        ← 목록으로 돌아가기
      </Link>

      {/* 메인 덱 카운트 & 메타 정보 카드 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8">
        
        {/* 헤더 영역 */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {deck.season || '시즌 18'}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {deck.tier || '1티어 (우승)'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {deck.comp_name}
            </h1>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400 text-sm font-semibold">
            🥇 1등 달성 우승 덱
          </div>
        </div>

        {/* 핵심 챔피언 조합 */}
        <div>
          <h2 className="text-base font-bold text-slate-300 mb-4 flex items-center gap-2">
            <span>🛡️</span> 핵심 기물 스쿼드
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {rawChampions.map((champId: string, idx: number) => {
              const { displayName, imageUrl } = getChampionInfo(champId);
              const starRating = idx < 2 ? '⭐⭐⭐' : '⭐⭐';

              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 flex flex-col items-center transition group shadow-md"
                >
                  {/* 성급 (별표) */}
                  <div className="text-xs text-amber-400 mb-1 font-bold tracking-widest">
                    {starRating}
                  </div>

                  {/* 챔피언 초상화 */}
                  <div className="relative w-16 h-16 mb-2 rounded-lg overflow-hidden border-2 border-amber-500/60 shadow-lg group-hover:scale-105 transition-transform bg-slate-800 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 한글 챔피언 이름 */}
                  <span className="text-xs font-semibold text-slate-200 text-center truncate w-full">
                    {displayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추천 아이템 & 덱 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
            <h2 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
              <span>⚔️</span> 주요 추천 아이템
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {deck.items || '최상위 랭커 우승 아이템 빌드'}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
            <h2 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
              <span>💡</span> 운영 가이드 & 팁
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {deck.description || '한국 서버 랭킹 1위 랭커가 최근 1등을 달성한 실전 조합입니다.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
