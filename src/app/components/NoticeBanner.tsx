'use client';

import { useState, useEffect } from 'react';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
}

export default function NoticeBanner() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await fetch('/api/notices');
        if (!res.ok) {
          throw new Error('Failed to fetch notices');
        }
        const data = await res.json();
        // API가 날짜순으로 정렬된 공지를 반환한다고 가정하고 최신 공지를 가져옵니다.
        if (data.notices && data.notices.length > 0) {
          const latestNotice = data.notices.sort((a: Notice, b: Notice) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          setNotice(latestNotice);
          
          // 이 공지가 이전에 닫혔는지 확인합니다.
          const dismissedNoticeId = localStorage.getItem('dismissedNoticeId');
          if (dismissedNoticeId !== String(latestNotice.id)) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchNotices();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (notice) {
      localStorage.setItem('dismissedNoticeId', String(notice.id));
    }
  };

  if (!isVisible || !notice) {
    return null;
  }

  return (
    <div className="bg-blue-600 text-white p-4 text-center relative">
      <p>
        <span className="font-bold mr-2">공지:</span>
        {notice.title}
      </p>
      <button
        onClick={handleDismiss}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-2xl font-bold"
      >
        &times;
      </button>
    </div>
  );
}
