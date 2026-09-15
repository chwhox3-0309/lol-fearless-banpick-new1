// src/app/tft/TftListClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TftMetaItem {
  id: number;
  season: string;
  tier: string;
  comp_name: string;
  key_champions: string;
  items: string;
  description: string;
}

interface ChampMap {
  [key: string]: {
    cleanName: string;
    krName: string;
    iconUrl: string;
  };
}

export default function TftListClient({ initialItems }: { initialItems: TftMetaItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [champMap, setChampMap] = useState<ChampMap>({});
  const [latestVersion, setLatestVersion] = useState<string>('14.24.1');
  const [isLoading, setIsLoading] = useState(true);

  // 라이엇 Data Dragon API에서 최신 한글 챔피언 데이터 자동 수집
  useEffect(() => {
    async function loadRiotApiData() {
      try {
        // 1. 최신 패치 버전 자동 조회
        const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await verRes.json();
        const ver = versions[0];
        setLatestVersion(ver);

        // 2. 라이엇 공식 TFT 한글 데이터 및 일반 챔피언 한글 데이터 동시 조회
        const [tftRes, lolRes] = await Promise.all([
          fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/tft-champion.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/champion.json`),
        ]);

        const tftData = await tftRes.json();
        const lolData = await lolRes.json();

        const newMap: ChampMap = {};

        // TFT 챔피언 한글 매핑
        if (tftData?.data) {
          Object.values(tftData.data).forEach((champ: any) => {
            const rawId = champ.id || '';
            const cleanId = rawId.replace(/^TFT\d+_?/i, '').replace(/^DA_\d+_?/i, '');
            const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/tft-champion/${champ.image?.full || `${rawId}.png`}`;

            newMap[rawId.toLowerCase()] = { cleanName: rawId, krName: champ.name, iconUrl: imgUrl };
            newMap[cleanId.toLowerCase()] = { cleanName: cleanId, krName: champ.name, iconUrl: imgUrl };
          });
        }

        // 일반 롤 챔피언 한글 매핑 (TFT 전용 이미지 없는 경우 보완)
        if (lolData?.data) {
          Object.values(lolData.data).forEach((champ: any) => {
            const cleanId = champ.id;
            const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${champ.id}.png`;

            if (!newMap[cleanId.toLowerCase()]) {
              newMap[cleanId.toLowerCase()] = { cleanName: cleanId, krName: champ.name, iconUrl: imgUrl };
            }
          });
        }

        setChampMap(newMap);
      } catch (err) {
        console.error('라이엇 API 자동 동기화 실패:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRiotApiData();
  }, []);

  // 입력된 원본 ID(예: DA_18_Yorick, TFT18_Karma)를 한글 정보로 자동 파싱
  const parseChampion = (rawName: string) => {
    if (!rawName) return { cleanName: '', krName: '', iconUrl: '' };

    let cleaned = rawName.trim();
    cleaned = cleaned
      .replace(/^DA_\d+_?/i, '')
      .replace(/^DA_/i, '')
      .replace(/^TFT\d+_?/i, '')
      .replace(/^TFT_/i, '')
      .replace(/\d+$/g, '')
      .replace(/_(AD|AP|Tank|Carry)$/i, '');

    const key = cleaned.toLowerCase();
    const matched = champMap[key] || champMap[rawName.toLowerCase()];

    if (matched) {
      return matched;
    }

    // API 로딩 전이거나 데이터에 없을 경우 Fallback
    const formattedName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return {
      cleanName: formattedName,
      krName: formattedName,
      iconUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${formattedName}.png`,
    };
  };

  // 한글/영문/티어/덱이름 통합 실시간 필터링
  const filteredItems = initialItems.filter((item) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const rawChamps = item.key_champions ? item.key_champions.split(',') : [];
    const parsedChamps = rawChamps.map(parseChampion);

    const matchesName = item.comp_name.toLowerCase().includes(query);
    const matchesTier = item.tier?.toLowerCase().includes(query);
    const matchesSeason = item.season?.toLowerCase().includes(query);
    const matchesItems = item.items ? item.items.toLowerCase().includes(query) : false;

    const matchesChampions = parsedChamps.some(
      (c) => c.krName.toLowerCase().includes(query) || c.cleanName.toLowerCase().includes(query)
    );

    return matchesName || matchesTier || matchesSeason || matchesItems || matchesChampions;
  });

  const getTierBadgeStyle = (tier: string) => {
    if (tier?.includes('1')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (tier?.includes('2')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (tier?.includes('3')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

  return (
    <div className="space-y-6">
      {/* 검색 입력창 */}
      <div className="relative">
        <input
          type="text"
          placeholder="덱 이름, 챔피언 한글/영문, 아이템, 시즌 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-4 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-lg"
        />
        <svg
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 덱 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const rawChamps = item.key_champions ? item.key_champions.split(',') : [];
          const parsedChamps = rawChamps.map(parseChampion).filter((c) => c.cleanName !== '');

          // 자동으로 가져온 한글 이름을 결합해 덱 타이틀 생성
          const displayTitle =
            parsedChamps.length > 0
              ? `${parsedChamps.slice(0, 3).map((c) => c.krName).join(' ')} 덱`
              : item.comp_name;

          return (
            <Link
              key={item.id}
              href={`/tft/${item.id}`}
              className="group relative bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-5 hover:border-indigo-500/60 hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="space-y-4 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  {/* DB 시즌 데이터 표기 (없을 경우 시즌 18 표기) */}
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/50">
                    {item.season || '시즌 18'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getTierBadgeStyle(item.tier)}`}>
                    {item.tier || '1티어'}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                  {displayTitle}
                </h2>

                {/* 라이엇 API로 자동 수집된 챔피언 초상화 & 한글명 */}
                <div className="flex flex-wrap gap-2 pt-1 max-w-full">
                  {parsedChamps.slice(0, 5).map((champ, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-800 shadow-md flex-shrink-0 group/img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={champ.iconUrl}
                          alt={champ.krName}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.cleanName}.png`;
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 max-w-[48px] truncate text-center">
                        {isLoading ? '...' : champ.krName}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/50 border border-slate-800/60 rounded-xl p-3">
                  <span className="text-slate-400 font-semibold block mb-0.5">추천 아이템</span>
                  <span className="text-slate-200">{item.items}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold group-hover:text-indigo-300">
                <span>상세 공략 및 배치도</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
          검색 결과에 해당하는 메타 덱이 없습니다.
        </div>
      )}
    </div>
  );
}
