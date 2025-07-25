import React from 'react';
import { translations } from '@/src/lib/translations';

export default function AnnouncementModal({ onClose, currentLanguage }) {
  const t = translations[currentLanguage];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-4">{t.announcementTitle}</h2>
        <div className="mb-4 text-gray-300">
          <p className="mb-2"><strong>{t.announcementDate}</strong></p>
          <p className="mb-2">{t.announcementGreeting}</p>
          <ul className="list-disc list-inside ml-4">
            <li>{t.announcementUpdate1}</li>
            <li>{t.announcementUpdate2}</li>
            <li>{t.announcementUpdate3}</li>
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
