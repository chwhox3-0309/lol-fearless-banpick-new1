'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'ko',
          includedLanguages: 'ko,en,ja,zh-CN,zh-TW',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="google-translate-container flex items-center">
      <div id="google_translate_element" className="text-xs"></div>
      
      {/* 구글 번역 위젯 기본 디자인을 다크모드에 맞게 강제 커스텀하는 CSS */}
      <style jsx global>{`
        /* 구글 번역 바 전체 감싸는 박스 정리 */
        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 12px !important;
          color: transparent !important;
        }
        .goog-te-gadget span {
          display: none; /* '구글 번역' 텍스트 숨기기 */
        }
        /* 드롭다운 select 박스 디자인 커스텀 */
        .goog-te-combo {
          background-color: #111827 !important; /* 다크 배경 (gray-900) */
          color: #e5e7eb !important; /* 텍스트 색상 (gray-200) */
          border: 1px solid #374151 !important; /* 테두리 (gray-700) */
          padding: 4px 8px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          outline: none !important;
          cursor: pointer;
        }
        .goog-te-combo:hover {
          border-color: #2dd4bf !important; /* 호버 시 테일컬러 */
        }
        /* 구글 번역 상단 배너(바디 밀림 현상) 강제 숨기기 */
        body {
          top: 0 !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        .skiptranslate {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
