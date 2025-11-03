'use client';

import React, { useEffect } from 'react';

// 타입스크립트를 위해 window 객체에 adsbygoogle 속성 확장
declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

const AdsenseBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Adsense error:", err);
    }
  }, []);

  return (
    <div className="w-full text-center my-4">
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6831227862636699" // [중요] 본인의 애드센스 게시자 ID로 변경하세요
        data-ad-slot="4789335747"       // [중요] 본인의 애드센스 광고 슬롯 ID로 변경하세요
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdsenseBanner;
