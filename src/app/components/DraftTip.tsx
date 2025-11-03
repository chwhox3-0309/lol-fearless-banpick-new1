'use client';

import { useState, useEffect } from 'react';
import recommendations from '@/data/ban-recommendations.json';
import tierData from '@/data/tier-lists.json';

// --- TYPE DEFINITIONS ---
interface ChampionTierInfo {
  id: string;
  name: string;
  reason: string;
}

interface TierListData {
  [role: string]: {
    [tier: string]: ChampionTierInfo[];
  };
}

interface BanRecommendation {
  championId: string;
  championName: string;
  reason: string;
}

interface BanRecommendationData {
  [championId: string]: BanRecommendation[];
}

// Helper function to get a random element from an array
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DraftTip() {
  const [tip, setTip] = useState<{ title: string; content: string; } | null>(null);

  useEffect(() => {
    try {
      const tipTypes = ['recommendation', 'tier'];
      const chosenType = getRandomElement(tipTypes);

      let generatedTip: { title: string; content: string; } | null = null;

      if (chosenType === 'recommendation') {
        const allChampsWithRecs = Object.keys(recommendations);
        if (allChampsWithRecs.length > 0) {
          const randomChampId = getRandomElement(allChampsWithRecs);
          const recs = (recommendations as BanRecommendationData)[randomChampId];
          if (recs && recs.length > 0) {
            const randomRec = getRandomElement(recs);
            generatedTip = {
              title: `알고 계셨나요?`,
              content: `${randomChampId} 상대 추천 밴: **${randomRec.championName}**. ${randomRec.reason}`
            };
          }
        }
      } else { // 'tier'
        const allRoles = Object.keys(tierData);
        if (allRoles.length > 0) {
          const randomRole = getRandomElement(allRoles);
          const tiers = (tierData as TierListData)[randomRole];
          const sTiers = tiers['S'];
          if (sTiers && sTiers.length > 0) {
            const randomChamp = getRandomElement(sTiers);
            generatedTip = {
              title: `S-티어 ${randomRole}`,
              content: `**${randomChamp.name}**: ${randomChamp.reason}`
            };
          }
        }
      }
      setTip(generatedTip);
    } catch (error) {
      console.error("Error generating draft tip:", error);
      setTip(null);
    }
  }, []); // Empty dependency array means this runs once on mount

  if (!tip) {
    return null; // Don't render if no tip could be generated or still loading
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-purple-300">오늘의 밴픽 팁</h2>
      <div className="text-lg leading-relaxed">
        <h3 className="font-semibold">{tip.title}</h3>
        <p dangerouslySetInnerHTML={{ __html: tip.content.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-yellow-400">$1</strong>') }} />
      </div>
    </div>
  );
}
