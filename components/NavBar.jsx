'use client';

import React, { useState } from 'react';
import AnnouncementModal from './AnnouncementModal';
import GuideModal from './GuideModal';
import { translations } from '@/src/lib/translations';

export default function NavBar({
  onNextSet,
  onResetAll,
  onLoadSummoner,
  onLanguageChange,
  currentLanguage,
}) {
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const handleOpenAnnouncementModal = () => setIsAnnouncementModalOpen(true);
  const handleCloseAnnouncementModal = () => setIsAnnouncementModalOpen(false);

  const handleOpenGuideModal = () => setIsGuideModalOpen(true);
  const handleCloseGuideModal = () => setIsGuideModalOpen(false);

  const t = translations[currentLanguage];

  return (
    <nav className="fixed top-0 w-full bg-gray-800 p-4 flex flex-col sm:flex-row justify-between items-center z-50">
      <div className="flex space-x-4 mb-2 sm:mb-0">
        <button
          onClick={onNextSet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.nextSet}
        </button>
        <button
          onClick={onResetAll}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.resetAll}
        </button>
        <button
          onClick={onLoadSummoner}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.loadSummoner}
        </button>
        <button
          onClick={handleOpenGuideModal}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full w-10 h-10 flex items-center justify-center"
        >
          {t.guide}
        </button>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span className="text-white text-2xl font-bold">CU LOL PICKS</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleOpenAnnouncementModal}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.announcement}
        </button>
        <select
          onChange={(e) => onLanguageChange(e.target.value)}
          value={currentLanguage}
          className="bg-gray-700 text-white py-2 px-4 rounded"
        >
          <option value="ko_KR">한국어</option>
          <option value="en_US">English</option>
          <option value="ja_JP">日本語</option>
        </select>
      </div>
      {isAnnouncementModalOpen && <AnnouncementModal onClose={handleCloseAnnouncementModal} currentLanguage={currentLanguage} />}
      {isGuideModalOpen && <GuideModal onClose={handleCloseGuideModal} currentLanguage={currentLanguage} />}
    </nav>
  );
}
