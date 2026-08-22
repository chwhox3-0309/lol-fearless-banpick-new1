'use client';

import React from 'react';

interface AdPlaceholderProps {
  type?: 'top' | 'sidebar' | 'interstitial';
  label?: string;
  children?: React.ReactNode;
}

export default function AdPlaceholder({
  type = 'top',
  label = '광고 영역',
  children,
}: AdPlaceholderProps) {
  // CLS(레이아웃 흔들림) 방지를 위해 규격별 고정 사이즈 지정
  const sizeClasses = {
    top: 'w-full max-w-[728px] h-[90px]',
    sidebar: 'w-[160px] h-[600px]',
    interstitial: 'w-full h-[120px]',
  };

  return (
    <div
      className={`${sizeClasses[type]} bg-gray-800/50 border border-amber-500/30 rounded flex flex-col items-center justify-center text-xs text-amber-300 shrink-0 overflow-hidden relative group`}
    >
      {/* 실제 광고 컴포넌트(KakaoAdFitBanner 등)가 전달되면 그것을 렌더링, 없으면 디폴트 가이드 노출 */}
      {children ? (
        children
      ) : (
        <div className="flex flex-col items-center gap-1 select-none">
          <span className="font-semibold px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/40">
            AD
          </span>
          <span className="text-gray-400">{label}</span>
        </div>
      )}
    </div>
  );
}
