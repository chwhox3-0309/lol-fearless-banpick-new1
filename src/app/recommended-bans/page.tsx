'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SimpleChampionGrid from '../components/SimpleChampionGrid';
import recommendations from '@/data/ban-recommendations.json';
import { getLatestVersion, getChampionData, getChampionThumbnailUrl } from '@/lib/riot-api';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// This is a simplified version of the Champion interface
interface Champion {
  id: string;
  name: string;
}

interface Recommendation {
  championId: string;
  championName: string;
  reason: string;
}

export default function RecommendedBansPage() {
  const searchParams = useSearchParams();
  const initialChampionId = searchParams.get('champion');

  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [version, setVersion] = useState<string | '' >('');
  const [allChampionsData, setAllChampionsData] = useState<Record<string, Champion>>({});

  // Fetch version and all champion data once
  useEffect(() => {
    async function fetchData() {
      const latestVersion = await getLatestVersion();
      setVersion(latestVersion);
      const koChampionsData = await getChampionData(latestVersion, 'ko_KR');
      setAllChampionsData(koChampionsData);

      // If there's an initial champion ID from the URL, set it
      if (initialChampionId && koChampionsData[initialChampionId]) {
        setSelectedChampion(koChampionsData[initialChampionId]);
      }
    }
    fetchData();
  }, [initialChampionId]);

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
  };

  const recommendedBans: Recommendation[] = useMemo(() => {
    if (!selectedChampion) return [];
    return (recommendations as Record<string, Recommendation[]>)[selectedChampion.id] || [];
  }, [selectedChampion]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold">
            &larr; 메인 페이지로 돌아가기
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center">추천 밴</h1>
        <p className="text-center text-gray-400 mb-8">
          챔피언을 선택하면, 해당 챔피언을 상대할 때 밴하면 좋은 챔피언 목록을 추천해 드립니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <SimpleChampionGrid onChampionSelect={handleChampionSelect} />
          </div>

          <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {selectedChampion ? `${selectedChampion.name} 상대 추천 밴` : '챔피언을 선택하세요'}
            </h2>
            {selectedChampion && recommendedBans.length > 0 ? (
              <ul className="space-y-4">
                {recommendedBans.map((ban) => (
                  <li key={ban.championId} className="flex items-start gap-4 bg-gray-700 p-3 rounded-lg">
                    {version && (
                        <Image
                            src={getChampionThumbnailUrl(version, ban.championId)}
                            alt={ban.championName}
                            width={48}
                            height={48}
                            className="rounded-md"
                        />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-red-400">{ban.championName}</h3>
                      <p className="text-sm text-gray-300">{ban.reason}</p>
                      <a 
                        href={`mailto:chcorps0705@gmail.com?subject=${encodeURIComponent('추천 밴 정보 신고')}&body=${encodeURIComponent(`챔피언: ${selectedChampion.name}\n추천 밴: ${ban.championName}\n사유: ${ban.reason}\n\n---잘못된 내용이나 수정 제안 사항을 여기에 작성해주세요.---\n`)}`}
                        className="text-xs text-gray-500 hover:underline mt-1 inline-block"
                      >
                        정보 신고
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : selectedChampion ? (
              <p className="text-center text-gray-500">추천 밴 데이터가 없습니다.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
