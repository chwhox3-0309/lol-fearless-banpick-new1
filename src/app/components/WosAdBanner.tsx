'use client';

import { useEffect } from 'react';

const WosAdBanner = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="wos-ad-banner-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-5GKZ3xN5XUDDSagS"
        data-ad-width="728"
        data-ad-height="90"
      ></ins>
    </div>
  );
};

export default WosAdBanner;
