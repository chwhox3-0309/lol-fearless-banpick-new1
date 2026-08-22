// components/KakaoAdFitBanner.tsx
'use client';

import { useEffect, useRef } from 'react';

interface KakaoAdFitProps {
  adUnit: string;
  width: string;
  height: string;
}

export default function KakaoAdFitBanner({ adUnit, width, height }: KakaoAdFitProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;
    scriptRef.current = script;

    document.body.appendChild(script);

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  return (
    // minWidth와 minHeight를 고정하여 레이아웃 밀림(CLS) 방지
    <div 
      className="flex justify-center items-center overflow-hidden bg-gray-800/30 rounded"
      style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
    >
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adUnit}
        data-ad-width={width}
        data-ad-height={height}
      />
    </div>
  );
}
