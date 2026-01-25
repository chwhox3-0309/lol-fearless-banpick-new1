'use client';

import Image from 'next/image';
import { getChampionThumbnailUrl } from '@/lib/riot-api';
import { useDraft } from '../context/DraftContext';
import KakaoAdFitBanner from './KakaoAdFitBanner';
import Link from 'next/link';

export default function TeamDisplay({ teamName, teamColor, teamType, picks, bans }: { teamName: string; teamColor: string; teamType: 'blue' | 'red'; picks: string[]; bans: string[]; }) {
  const {
    version,
    completedDrafts,
  } = useDraft();

  return (
    <div className="w-full lg:col-span-1 bg-gray-800 p-4 overflow-y-auto">
      <h2 className={`text-xl font-bold mb-4 ${teamColor}`}>{teamName}</h2>
      <h3 className="text-lg font-semibold mb-2">밴:</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {bans.map((champId) => (
          <div key={`${teamType}-ban-${champId}`} className="w-12 h-12 sm:w-16 sm:h-16 relative">
            {version && (
              <Image
                src={getChampionThumbnailUrl(version, champId)}
                alt={champId}
                fill
                className="rounded-md object-cover"
              />
            )}
          </div>
        ))}
      </div>
      <h3 className="text-lg font-semibold mb-2">픽:</h3>
      <div className="flex flex-wrap gap-2">
        {picks.map((champId) => (
          <div key={`${teamType}-pick-${champId}`} className="flex flex-col items-center">
            <div className="w-16 h-16 relative mb-1">
              {version && (
                <Image
                  src={getChampionThumbnailUrl(version, champId)}
                  alt={champId}
                  fill
                  className="rounded-md object-cover"
                />
              )}
            </div>
            <Link href={`/recommended-bans?champion=${champId}`} className="text-xs text-blue-400 hover:underline">
              추천 밴 보기
            </Link>
          </div>
        ))}
      </div>
      {completedDrafts.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-2">이전 밴픽 ({teamName}):</h3>
          {completedDrafts.map((draft, index) => (
            <div key={`${teamType}-draft-${index}`} className="mb-2">
              <p className="text-sm font-medium mt-1">세트 {index + 1} 픽:</p>
              <div className="flex flex-wrap gap-1">
                {(teamType === 'blue' ? draft.blueTeamPicks : draft.redTeamPicks).map((champId) => (
                  <div key={`prev-${teamType}-pick-${index}-${champId}`} className="w-8 h-8 sm:w-10 sm:h-10 relative opacity-70">
                    {version && (
                      <Image
                        src={getChampionThumbnailUrl(version, champId)}
                        alt={champId}
                        fill
                        className="rounded-md object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
      <div className="mt-4">
        <KakaoAdFitBanner />
      </div>
    </div>
  );
}