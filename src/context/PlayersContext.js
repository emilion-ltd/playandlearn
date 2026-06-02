import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  firebaseEnabled,
  publishPresence,
  touchPresence,
  clearPresence,
  publishPlayer,
  subscribeOnline,
  subscribePlayers,
} from '../services/onlineSync';

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
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [remotePlayers, setRemotePlayers] = useState([]);
  const globalRecordsRef = useRef({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // מנויים גלובליים: מי מחובר עכשיו + כל השחקנים (לטבלת אלופים ושיאים)
  useEffect(() => {
    if (!firebaseEnabled) return undefined;
    const unsubOnline = subscribeOnline(setOnlinePlayers);
    const unsubPlayers = subscribePlayers(setRemotePlayers);
    return () => { unsubOnline(); unsubPlayers(); };
  }, []);

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

  // פרסום נוכחות עבור השחקן הפעיל (מי מחובר עכשיו)
  const currentSig = currentPlayer
    ? `${currentPlayer.id}|${currentPlayer.points}|${JSON.stringify(currentPlayer.records || {})}`
    : '';
  useEffect(() => {
    if (!firebaseEnabled || !currentPlayer) return undefined;
    publishPresence(currentPlayer);
    const iv = setInterval(() => touchPresence(currentPlayer), 30000);
    const id = currentPlayer.id;
    return () => { clearInterval(iv); clearPresence(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSig]);

  // פרסום *כל* השחקנים המקומיים לטבלת האלופים הגלובלית (גיבוי בענן +
  // הופעת כולם בטבלה, לא רק השחקן הפעיל). מתבצע בכל שינוי בנתוני השחקנים.
  const allPlayersSig = state.players
    .map((p) => `${p.id}:${p.points || 0}:${JSON.stringify(p.records || {})}`)
    .join('|');
  useEffect(() => {
    if (!firebaseEnabled) return;
    state.players.forEach((p) => publishPlayer(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlayersSig]);

  // ניקוד הכי טוב במשחק נתון בין כל השחקנים (מקומי + גלובלי)
  const gameBest = useCallback(
    (gameId) => {
      const local = state.players.reduce((max, p) => Math.max(max, p.records?.[gameId] || 0), 0);
      const remote = remotePlayers.reduce((max, p) => Math.max(max, (p.records && p.records[gameId]) || 0), 0);
      return Math.max(local, remote);
    },
    [state.players, remotePlayers]
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
        const localPrev = s.players.reduce((m, p) => Math.max(m, p.records?.[gameId] || 0), 0);
        const remotePrev = globalRecordsRef.current[gameId]?.score || 0;
        const globalPrev = Math.max(localPrev, remotePrev);
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

  // טבלת אלופים גלובלית — ממוזגת בין כל השחקנים מכל המכשירים
  const globalLeaderboard = useMemo(
    () => [...remotePlayers].sort((a, b) => (b.points || 0) - (a.points || 0)),
    [remotePlayers]
  );

  // שיא גלובלי לכל משחק + מי מחזיק בו
  const globalRecords = useMemo(() => {
    const rec = {};
    remotePlayers.forEach((p) => {
      const records = p.records || {};
      Object.keys(records).forEach((gid) => {
        const score = records[gid] || 0;
        if (!rec[gid] || score > rec[gid].score) {
          rec[gid] = { score, name: p.name, emoji: p.emoji, key: p.key };
        }
      });
    });
    return rec;
  }, [remotePlayers]);

  useEffect(() => { globalRecordsRef.current = globalRecords; }, [globalRecords]);

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
    online: firebaseEnabled,
    onlinePlayers,
    globalLeaderboard,
    globalRecords,
  };

  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error('usePlayers must be used within PlayersProvider');
  return ctx;
}
