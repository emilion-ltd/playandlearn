import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PlayersContext = createContext(null);
const STORAGE_KEY = 'learn-he-players-v2';

export const avatarOptions = ['🦊', '🐼', '🦄', '🐲', '🦁', '🐧', '🐸', '🐯', '🦉', '🐙', '🦖', '🐝', '🐱', '🐶', '🐰', '🐵'];

// שמות המשחקים לתצוגה בטבלת השיאים
export const gameMeta = {
  math: { label: 'חשבון', emoji: '🔢', icon: 'math', color: '#51cf66', unit: 'נק׳' },
  english: { label: 'אנגלית', emoji: '🇬🇧', icon: 'english', color: '#22b8cf', unit: 'נק׳' },
  science: { label: 'מדע', emoji: '🔬', icon: 'science', color: '#845ef7', unit: 'נק׳' },
  reading: { label: 'קריאה', emoji: '📖', icon: 'reading', color: '#a855f7', unit: 'נק׳' },
  typing: { label: 'הקלדה', emoji: '⌨️', icon: 'typing', color: '#5b6cf9', unit: 'מל״ד' },
  'typing-mobile': { label: 'מהירות נייד', emoji: '📱', icon: 'typing', color: '#4dabf7', unit: 'נק׳' },
  music: { label: 'פסנתר', emoji: '🎹', icon: 'music', color: '#e64980', unit: 'נק׳' },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { players: [], currentId: null };
}

let idCounter = 0;
function newId() {
  return `p_${Date.now()}_${idCounter++}`;
}

export function PlayersProvider({ children }) {
  const [state, setState] = useState(load);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const addPlayer = useCallback((name, emoji) => {
    const id = newId();
    setState((s) => ({
      players: [...s.players, { id, name: name.trim() || 'שחקן', emoji: emoji || '🦊', points: 0, records: {} }],
      currentId: id,
    }));
    return id;
  }, []);

  const selectPlayer = useCallback((id) => {
    setState((s) => ({ ...s, currentId: id }));
  }, []);

  const removePlayer = useCallback((id) => {
    setState((s) => {
      const players = s.players.filter((p) => p.id !== id);
      const currentId = s.currentId === id ? players[0]?.id || null : s.currentId;
      return { players, currentId };
    });
  }, []);

  const currentPlayer = state.players.find((p) => p.id === state.currentId) || null;

  // ניקוד הכי טוב במשחק נתון בין כל השחקנים
  const gameBest = useCallback(
    (gameId) => state.players.reduce((max, p) => Math.max(max, p.records?.[gameId] || 0), 0),
    [state.players]
  );

  // הגשת תוצאה: מעדכן נקודות ושיא אישי, מחזיר מידע על שבירת שיא
  const submitScore = useCallback(
    (gameId, score) => {
      if (!gameId || typeof score !== 'number' || Number.isNaN(score)) {
        return { isRecord: false, isGlobalRecord: false, prevBest: 0, best: 0 };
      }
      let result = { isRecord: false, isGlobalRecord: false, prevBest: 0, best: score };
      setState((s) => {
        if (!s.currentId) return s;
        const globalPrev = s.players.reduce((m, p) => Math.max(m, p.records?.[gameId] || 0), 0);
        const players = s.players.map((p) => {
          if (p.id !== s.currentId) return p;
          const prevBest = p.records?.[gameId] || 0;
          const best = Math.max(prevBest, score);
          result = {
            isRecord: score > prevBest,
            isGlobalRecord: score > globalPrev,
            prevBest,
            best,
          };
          return {
            ...p,
            points: (p.points || 0) + score,
            records: { ...p.records, [gameId]: best },
          };
        });
        return { ...s, players };
      });
      if (result.isRecord && score > 0) {
        setCelebration({ gameId, score, isGlobal: result.isGlobalRecord, prevBest: result.prevBest });
      }
      return result;
    },
    []
  );

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  const leaderboard = [...state.players].sort((a, b) => (b.points || 0) - (a.points || 0));

  const value = {
    players: state.players,
    currentPlayer,
    addPlayer,
    selectPlayer,
    removePlayer,
    submitScore,
    gameBest,
    leaderboard,
    celebration,
    dismissCelebration,
  };

  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error('usePlayers must be used within PlayersProvider');
  return ctx;
}
