'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getLatestVersion, getChampionData, getChampionThumbnailUrl } from '@/lib/riot-api';

interface Champion {
  id: string;
  name: string;
}

interface SimpleChampionGridProps {
  onChampionSelect: (champion: Champion) => void;
}

export default function SimpleChampionGrid({ onChampionSelect }: SimpleChampionGridProps) {
  const [version, setVersion] = useState<string | null>(null);
  const [allChampions, setAllChampions] = useState<Champion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const latestVersion = await getLatestVersion();
        setVersion(latestVersion);
        const koChampionsData = await getChampionData(latestVersion, 'ko_KR');
        const championsArray = Object.values(koChampionsData).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        setAllChampions(championsArray);
      } catch (error) {
        console.error("Failed to fetch champion data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredChampions = useMemo(() => {
    if (!searchTerm) {
      return allChampions;
    }
    return allChampions.filter((champion) =>
      champion.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allChampions, searchTerm]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <input
        type="text"
        placeholder="챔피언 검색..."
        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p className="text-center text-gray-400">챔피언 목록을 불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {filteredChampions.map((champion) => (
            <div
              key={champion.id}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => onChampionSelect(champion)}
            >
              <div className="w-16 h-16 relative">
                {version && (
                  <Image
                    src={getChampionThumbnailUrl(version, champion.id)}
                    alt={champion.name}
                    fill
                    className="rounded-md object-cover"
                  />
                )}
              </div>
              <p className="text-xs text-center mt-1">{champion.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
