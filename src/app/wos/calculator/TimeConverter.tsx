'use client';

import { useState } from 'react';

const TimeConverter = () => {
  const [utcTime, setUtcTime] = useState('');
  const [kstTime, setKstTime] = useState('');

  const handleUtcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setUtcTime(time);

    if (time) {
      try {
        // Append 'Z' to ensure the date string is parsed as UTC
        const utcDate = new Date(time + 'Z');
        if (isNaN(utcDate.getTime())) {
          setKstTime('Invalid Date');
          return;
        }
        // Create a new Date object for KST (UTC+9)
        const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
        // toISOString() returns UTC, which is what we need to represent KST in a neutral way
        // and then we format it for the datetime-local input.
        setKstTime(kstDate.toISOString().slice(0, 16));
      } catch (error) {
        setKstTime('Invalid Date');
      }
    } else {
      setKstTime('');
    }
  };

  const handleKstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setKstTime(time);

    if (time) {
      try {
        // Treat the input time as a UTC time string to perform calculations, 
        // then subtract 9 hours to get the real UTC time.
        const pseudoUtcDate = new Date(time + 'Z');
        if (isNaN(pseudoUtcDate.getTime())) {
          setUtcTime('Invalid Date');
          return;
        }
        // Create a new Date object for the actual UTC time
        const utcDate = new Date(pseudoUtcDate.getTime() - 9 * 60 * 60 * 1000);
        setUtcTime(utcDate.toISOString().slice(0, 16));
      } catch (error) {
        setUtcTime('Invalid Date');
      }
    } else {
      setUtcTime('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="utcTime" className="block text-lg font-medium text-gray-300 mb-2">UTC</label>
          <input
            type="datetime-local"
            id="utcTime"
            value={utcTime}
            onChange={handleUtcChange}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="kstTime" className="block text-lg font-medium text-gray-300 mb-2">KST (UTC+9)</label>
          <input
            type="datetime-local"
            id="kstTime"
            value={kstTime}
            onChange={handleKstChange}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="text-sm text-gray-400 text-center">
        <p>날짜와 시간을 선택하면 자동으로 변환됩니다.</p>
        <p>대한민국 표준시(KST)는 서머타임을 적용하지 않습니다.</p>
      </div>
    </div>
  );
};

export default TimeConverter;
