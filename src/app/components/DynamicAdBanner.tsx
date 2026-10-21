'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DynamicAdBannerProps {
  position: string; // 광고 위치 (예: 'top_banner', 'sidebar_left')
  className?: string;
}

interface AdItem {
  id: string;
  title: string;
  ad_type: string;
  ad_content: string; // iframe 태그 전체 또는 HTML 코드
}

export default function DynamicAdBanner({ position, className = '' }: DynamicAdBannerProps) {
  const [ad, setAd] = useState<AdItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveAd() {
      try {
        const now = new Date().toISOString();

        // 현재 시간에 유효하고 해당 위치에 맞는 활성화된 광고 조회
        const { data, error } = await supabase
          .from('advertisements')
          .select('id, title, ad_type, ad_content')
          .eq('position', position)
          .eq('is_active', true)
          .lte('start_date', now)
          .gte('end_date', now)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('광고 불러오기 실패:', error.message);
        } else if (data && data.length > 0) {
          setAd(data[0]);
        }
      } catch (e) {
        console.error('광고 로드 중 예외 발생:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveAd();
  }, [position]);

  if (loading) {
    return <div className={`animate-pulse bg-gray-800/40 rounded-xl ${className}`} />;
  }

  // 유효한 광고가 없으면 공간만 유지하거나 빈 상태 유지
  if (!ad) {
    return null; 
  }

  return (
    <div className={`flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <span className="text-[9px] text-gray-500 mb-1 tracking-wider uppercase">ADVERTISEMENT</span>
      <div 
        className="w-full flex justify-center items-center overflow-hidden"
        dangerouslySetInnerHTML={{ __html: ad.ad_content }}
      />
    </div>
  );
}
