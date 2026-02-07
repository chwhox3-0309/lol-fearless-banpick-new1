'use client';

import { useEffect, useRef } from 'react';

interface KakaoAdFitBannerProps {
  adUnit: string;
  width: string;
  height: string;
}

export default function KakaoAdFitBanner({ adUnit, width, height }: KakaoAdFitBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adContainerRef.current && adContainerRef.current.children.length === 0) {
      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', adUnit);
      ins.setAttribute('data-ad-width', width);
      ins.setAttribute('data-ad-height', height);
      adContainerRef.current.appendChild(ins);

      const script = document.createElement('script');
      script.async = true;
      script.type = 'text/javascript';
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
      document.head.appendChild(script);
    }
  }, [adUnit, width, height]);

  return <div ref={adContainerRef} />;
}