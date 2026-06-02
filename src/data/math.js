// מחולל תרגילי חשבון לפי פעולה ורמת קושי.
const QUESTIONS_PER_ROUND = 10;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// בניית 4 תשובות (נכונה + 3 מסיחים סבירים)
function buildAnswers(correct) {
  const options = new Set([correct]);
  let guard = 0;
  while (options.size < 4 && guard < 50) {
    guard++;
    const delta = randInt(1, Math.max(3, Math.round(Math.abs(correct) * 0.3) + 2));
    const sign = Math.random() < 0.5 ? -1 : 1;
    const candidate = correct + sign * delta;
    if (candidate >= 0) options.add(candidate);
  }
  // השלמה אם חסר (למספרים קטנים)
  let n = correct + 1;
  while (options.size < 4) {
    if (n >= 0) options.add(n);
    n++;
  }
  const answers = shuffle([...options]).map(String);
  return { answers, correct: answers.indexOf(String(correct)) };
}

function genOne(op, level) {
  let a, b, result, symbol;
  if (op === 'add') {
    const max = level === 1 ? 10 : level === 2 ? 20 : 100;
    a = randInt(0, max);
    b = randInt(0, max);
    result = a + b;
    symbol = '+';
  } else if (op === 'sub') {
    const max = level === 1 ? 10 : level === 2 ? 20 : 100;
    a = randInt(0, max);
    b = randInt(0, a); // למניעת תוצאה שלילית
    result = a - b;
    symbol = '−';
  } else if (op === 'mul') {
    const max = level === 1 ? 5 : level === 2 ? 10 : 12;
    a = randInt(1, max);
    b = randInt(1, max);
    result = a * b;
    symbol = '×';
  } else {
    // div - חילוק מדויק, נגזר מכפל
    const max = level === 1 ? 5 : level === 2 ? 10 : 12;
    b = randInt(1, max);
    result = randInt(1, max);
    a = b * result; // כך a / b = result בדיוק
    symbol = '÷';
  }
  const { answers, correct } = buildAnswers(result);
  return { prompt: `${a} ${symbol} ${b} = ?`, answers, correct };
}

export const mathOps = [
  { id: 'add', label: 'חיבור', emoji: '➕', color: '#51cf66' },
  { id: 'sub', label: 'חיסור', emoji: '➖', color: '#ff922b' },
  { id: 'mul', label: 'כפל', emoji: '✖️', color: '#5b6cf9' },
  { id: 'div', label: 'חילוק', emoji: '➗', color: '#22b8cf' },
];

export const mathLevels = [
  { id: 1, label: 'קל', emoji: '🟢' },
  { id: 2, label: 'בינוני', emoji: '🟡' },
  { id: 3, label: 'מאתגר', emoji: '🔴' },
];

export function makeMathQuestions(op, level) {
  return Array.from({ length: QUESTIONS_PER_ROUND }, () => genOne(op, level));
}

// רמת ברירת מחדל מומלצת לפי כיתה
export function defaultLevelForGrade(grade) {
  if (['א', 'ב'].includes(grade)) return 1;
  if (['ג', 'ד'].includes(grade)) return 2;
  return 3;
}
