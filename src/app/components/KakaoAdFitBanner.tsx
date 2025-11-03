'use client';

import { useEffect, useRef } from 'react';

export default function KakaoAdFitBanner() {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adContainerRef.current && adContainerRef.current.children.length === 0) {
      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-BKOeD7FOllmXhljU');
      ins.setAttribute('data-ad-width', '160');
      ins.setAttribute('data-ad-height', '600');
      adContainerRef.current.appendChild(ins);

      const script = document.createElement('script');
      script.async = true;
      script.type = 'text/javascript';
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
      document.head.appendChild(script);
    }
  }, []);

  return <div ref={adContainerRef} />;
}