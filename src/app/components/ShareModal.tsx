'use client';

import React from 'react';

interface ShareModalProps {
  onClose: () => void;
  onShareUrl: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, onShareUrl }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">공유하기</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="space-y-4">
          <button
            onClick={onShareUrl}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors duration-300"
          >
            URL 복사하여 공유
          </button>
        </div>
        <div className="mt-4 text-center">
          <button onClick={onClose} className="text-gray-400 hover:underline">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;