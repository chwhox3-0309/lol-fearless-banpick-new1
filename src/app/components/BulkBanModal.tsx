'use client';

import React, { useState } from 'react';

interface BulkBanModalProps {
  onClose: () => void;
  onConfirm: (championNames: string) => void;
}

const BulkBanModal: React.FC<BulkBanModalProps> = ({ onClose, onConfirm }) => {
  const [text, setText] = useState('');

  const handleConfirm = () => {
    onConfirm(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">대량 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <p className="text-gray-400 mb-4">
          정확히 10명의 챔피언 이름을 쉼표(,)나 줄바꿈으로 구분하여 입력하세요.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 p-2 rounded bg-gray-700 text-white border border-gray-600"
          placeholder="예: 라이즈, 아리, 가렌"
        />
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkBanModal;