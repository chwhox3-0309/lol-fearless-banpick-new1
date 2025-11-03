'use client';

import React, { useState, useEffect } from 'react';
import tierData from '@/data/tier-lists.json';
import { getLatestVersion, getChampionThumbnailUrl } from '@/lib/riot-api';
import Image from 'next/image';
import Link from 'next/link';

const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const TIERS = ['S', 'A', 'B', 'C', 'D'];

interface ChampionTierData {
  id: string;
  name: string;
  reason: string;
}

export default function TierListPage() {
  const [selectedRole, setSelectedRole] = useState('TOP');
  const [version, setVersion] = useState<string | '' >('');

  useEffect(() => {
    getLatestVersion().then(setVersion);
  }, []);

  const roleTierData = (tierData as Record<string, Record<string, ChampionTierData[]>>)[selectedRole] || {};

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold">
            &larr; 메인 페이지로 돌아가기
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center">밴픽 티어 리스트</h1>
        <p className="text-center text-gray-400 mb-8">
          프로 경기와 팀 게임의 밴픽 관점에서 본 챔피언 티어 리스트입니다.
        </p>

        <div className="flex justify-center gap-2 mb-8 bg-gray-800 p-2 rounded-lg">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 font-semibold rounded-md transition-colors duration-200 ${
                selectedRole === role
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {TIERS.map(tier => {
            const champions = roleTierData[tier];
            if (!champions || champions.length === 0) return null;

            return (
              <div key={tier} className="bg-gray-800 p-6 rounded-lg">
                <h2 className={`text-4xl font-bold mb-4 border-b-4 pb-2 ${tier === 'S' ? 'border-red-500' : tier === 'A' ? 'border-orange-500' : 'border-gray-600'}`}>
                  {tier} Tier
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {champions.map(champ => (
                    <div key={champ.id} className="flex items-start gap-4 bg-gray-700 p-4 rounded-lg">
                      {version && (
                        <Image
                          src={getChampionThumbnailUrl(version, champ.id)}
                          alt={champ.name}
                          width={64}
                          height={64}
                          className="rounded-md"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-white">{champ.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{champ.reason}</p>
                        <a 
                          href={`mailto:chcorps0705@gmail.com?subject=${encodeURIComponent('티어 리스트 정보 신고')}&body=${encodeURIComponent(`포지션: ${selectedRole}\n티어: ${tier}\n챔피언: ${champ.name}\n사유: ${champ.reason}\n\n---잘못된 내용이나 수정 제안 사항을 여기에 작성해주세요.---\n`)}`}
                          className="text-xs text-gray-500 hover:underline mt-1 inline-block"
                        >
                          정보 신고
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
