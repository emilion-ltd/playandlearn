// ניהול התקדמות למשחק הקריאה ב-localStorage
const KEYS = {
  PLAYER_NAME: 'reading-playerName',
  CHARACTER: 'reading-character',
  TOTAL_STARS: 'reading-totalStars',
  COMPLETED: 'reading-completedQuestions',
  BEST_TIME: 'reading-bestTime',
};

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

export const savePlayerName = (name) => localStorage.setItem(KEYS.PLAYER_NAME, name);
export const getPlayerName = () => read(KEYS.PLAYER_NAME, '') || '';

export const saveSelectedCharacter = (id) => localStorage.setItem(KEYS.CHARACTER, id);
export const getSelectedCharacter = () => read(KEYS.CHARACTER, '') || '';

export const getTotalStars = () => parseInt(read(KEYS.TOTAL_STARS, '0'), 10) || 0;
export const addStars = (stars) => {
  const total = getTotalStars() + stars;
  localStorage.setItem(KEYS.TOTAL_STARS, String(total));
  return total;
};

export const getCompletedQuestions = () => {
  try {
    return JSON.parse(read(KEYS.COMPLETED, '[]'));
  } catch {
    return [];
  }
};
export const saveCompletedQuestion = (id) => {
  const done = getCompletedQuestions();
  if (!done.includes(id)) {
    done.push(id);
    localStorage.setItem(KEYS.COMPLETED, JSON.stringify(done));
  }
};

export const getBestTime = () => parseInt(read(KEYS.BEST_TIME, '0'), 10) || 0;
export const saveBestTime = (time) => {
  const best = getBestTime();
  if (best === 0 || time < best) localStorage.setItem(KEYS.BEST_TIME, String(time));
};

export const resetProgress = () => {
  localStorage.removeItem(KEYS.TOTAL_STARS);
  localStorage.removeItem(KEYS.COMPLETED);
};
