import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'learn-he-progress-v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function AppProvider({ children }) {
  // ניווט מבוסס מצב (stack) ללא תלות חיצונית
  const [stack, setStack] = useState([{ screen: 'home', params: {} }]);
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // התעלמות משגיאות אחסון (מצב פרטי וכד')
    }
  }, [progress]);

  const navigate = useCallback((screen, params = {}) => {
    setStack((prev) => [...prev, { screen, params }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goHome = useCallback(() => {
    setStack([{ screen: 'home', params: {} }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // שמירת הישג לשיעור: כוכבים (0-3) ותוצאות שיא
  const saveLessonResult = useCallback((lessonId, { stars = 0, wpm = 0, accuracy = 0 } = {}) => {
    setProgress((prev) => {
      const existing = prev[lessonId] || { stars: 0, bestWpm: 0, bestAccuracy: 0, completed: false };
      return {
        ...prev,
        [lessonId]: {
          stars: Math.max(existing.stars, stars),
          bestWpm: Math.max(existing.bestWpm, Math.round(wpm)),
          bestAccuracy: Math.max(existing.bestAccuracy, Math.round(accuracy)),
          completed: true,
        },
      };
    });
  }, []);

  const getLessonProgress = useCallback(
    (lessonId) => progress[lessonId] || { stars: 0, bestWpm: 0, bestAccuracy: 0, completed: false },
    [progress]
  );

  const current = stack[stack.length - 1];

  const value = {
    current,
    canGoBack: stack.length > 1,
    navigate,
    goBack,
    goHome,
    progress,
    saveLessonResult,
    getLessonProgress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
