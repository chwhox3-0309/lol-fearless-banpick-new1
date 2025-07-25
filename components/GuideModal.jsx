import React from 'react';
import { translations } from '@/src/lib/translations';

export default function GuideModal({ onClose, currentLanguage }) {
  const t = translations[currentLanguage];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-4">{t.siteGuideTitle}</h2>
        <div className="mb-4 text-gray-300">
          <p className="mb-2">{t.siteGuideContent1}</p>
          <ul className="list-disc list-inside ml-4">
            <li><strong>밴/픽 진행:</strong> {t.siteGuideContent2}</li>
            <li><strong>챔피언 선택:</strong> {t.siteGuideContent3}</li>
            <li><strong>선택된 챔피언:</strong> {t.siteGuideContent4}</li>
            <li><strong>팀별 현황:</strong> {t.siteGuideContent5}</li>
            <li><strong>다음 세트:</strong> {t.siteGuideContent6}</li>
            <li><strong>전부 초기화:</strong> {t.siteGuideContent7}</li>
            <li><strong>언어 변경:</strong> {t.siteGuideContent8}</li>
          </ul>
          <p className="mt-4">{t.announcementClosing}</p>
        </div>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}
