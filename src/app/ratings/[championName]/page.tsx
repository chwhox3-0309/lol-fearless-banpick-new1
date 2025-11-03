'use client';

import React, { useState, useEffect } from 'react';
import { getLatestVersion, getChampionData, getChampionThumbnailUrl } from '@/lib/riot-api';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Champion {
  id: string;
  name: string;
}

interface ChampionRatingsData {
  ratings: { userId: string; score: number }[];
  average: number;
}

interface ChampionRatingsPageProps {
  params: { championName: string };
}

const StarRating: React.FC<{ currentRating: number; onRate: (score: number) => void; disabled: boolean }> = ({ currentRating, onRate, disabled }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer text-3xl ${star <= (hoverRating || currentRating) ? 'text-yellow-400' : 'text-gray-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && onRate(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function ChampionRatingsPage({ params }: ChampionRatingsPageProps) {
  const { championName: championId } = params;
  const decodedChampionId = decodeURIComponent(championId);
  const { data: session } = useSession();
  const router = useRouter();

  const [champion, setChampion] = useState<Champion | null>(null);
  const [ratingsData, setRatingsData] = useState<ChampionRatingsData | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  const fetchChampionAndRatings = async () => {
    setLoading(true);
    setError(null);
    try {
      const latestVersion = await getLatestVersion();
      setVersion(latestVersion);
      const koChampionsData = await getChampionData(latestVersion, 'ko_KR');
      const foundChampion = Object.values(koChampionsData).find(c => c.id === decodedChampionId) as Champion;
      setChampion(foundChampion);

      const res = await fetch(`/api/ratings?championId=${decodedChampionId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch ratings');
      }
      const data: ChampionRatingsData = await res.json();
      setRatingsData(data);

      if (session?.user) {
        const userId = session.user.email || session.user.name;
        const existingRating = data.ratings.find(r => r.userId === userId);
        if (existingRating) {
          setUserRating(existingRating.score);
        }
      }
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChampionAndRatings();
  }, [session, decodedChampionId]);

  const handleRate = async (score: number) => {
    if (!session) {
      alert('평점을 남기려면 로그인해야 합니다.');
      router.push('/api/auth/signin');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ championId: decodedChampionId, score }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '평점 제출에 실패했습니다.');
      }

      const result = await res.json();
      setUserRating(score);
      // Optimistically update average or refetch
      fetchChampionAndRatings(); // Refetch to get updated average and distribution
      alert('평점이 성공적으로 제출되었습니다!');
    } catch (err: any) {
      setError(err.message || '평점 제출 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingsData) {
      ratingsData.ratings.forEach(r => {
        if (r.score >= 1 && r.score <= 5) {
          distribution[r.score as keyof typeof distribution]++;
        }
      });
    }
    return distribution;
  };

  const renderStars = (average: number) => {
    const fullStars = Math.floor(average);
    const halfStar = average % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <div className="flex justify-center items-center text-2xl">
        {'★'.repeat(fullStars)}
        {'☆'.repeat(halfStar)}
        {'☆'.repeat(emptyStars)}
      </div>
    );
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">데이터를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">오류: {error}</div>;
  }

  if (!champion) {
    return <div className="container mx-auto p-4 text-center">챔피언을 찾을 수 없습니다.</div>;
  }

  const distribution = getRatingDistribution();
  const totalRatings = ratingsData ? ratingsData.ratings.length : 0;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{champion.name} 평점 상세</h1>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex-shrink-0">
          {version && (
            <Image
              src={getChampionThumbnailUrl(version, champion.id)}
              alt={champion.name}
              width={120}
              height={120}
              className="rounded-md object-cover"
            />
          )}
        </div>
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-2">평균 평점: {ratingsData?.average ? ratingsData.average.toFixed(2) : 'N/A'}</h2>
          {ratingsData?.average !== undefined && renderStars(ratingsData.average)}
          <p className="text-gray-600 mt-2">총 {totalRatings}명 참여</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-medium mb-4 text-center">내 평점 남기기:</h3>
        {session ? (
          <div className="flex flex-col items-center">
            <StarRating currentRating={userRating} onRate={handleRate} disabled={submitting} />
            {submitting && <p className="text-blue-500 mt-2">제출 중...</p>}
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            <Link href="/api/auth/signin" className="text-blue-500 hover:underline">로그인</Link>하여 평점을 남겨주세요.
          </p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-medium mb-4 text-center">평점 분포:</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(score => (
            <div key={score} className="flex items-center">
              <span className="w-8 text-right mr-2">{score}점</span>
              <div className="flex-grow bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${totalRatings > 0 ? (distribution[score as keyof typeof distribution] / totalRatings) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="w-12 text-left ml-2">{distribution[score as keyof typeof distribution]}명</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
