'use client';

import { useState, useEffect } from 'react';

function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const isClient = typeof window !== 'undefined';

  const [state, setState] = useState<T>(() => {
    if (isClient) {
      try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
      } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, state, isClient]);

  return [state, setState];
}

export default usePersistentState;
