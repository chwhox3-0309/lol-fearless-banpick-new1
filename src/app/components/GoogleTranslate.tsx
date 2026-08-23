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
    // 중복 스크립트 로드 방지
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'ko', // 사이트의 기본 원본 언어 (한국어)
          includedLanguages: 'ko,en,ja,zh-CN,zh-TW', // 지원할 언어 목록 (한국어, 영어, 일본어, 중국어 간/번체)
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
    <div className="inline-block">
      <div id="google_translate_element" className="text-xs"></div>
    </div>
  );
}
