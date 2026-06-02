// עיצוב מרכזי לפלטפורמת הלמידה - צבעים, צללים, גופנים
export const theme = {
  colors: {
    primary: '#5b6cf9',
    primaryDark: '#3f4ed6',
    secondary: '#ff8a5b',
    accent: '#ffce54',
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    text: '#2c3e50',
    textLight: '#7f8c9b',
    bg: '#f4f6fc',
    card: '#ffffff',
    border: '#e4e8f5',
  },
  // צבעי כיתות - לכל כיתה זהות צבעונית
  grades: {
    'א': { main: '#ff6b6b', soft: '#ffe3e3' },
    'ב': { main: '#ff922b', soft: '#ffe8cc' },
    'ג': { main: '#fcc419', soft: '#fff3bf' },
    'ד': { main: '#51cf66', soft: '#d3f9d8' },
    'ה': { main: '#22b8cf', soft: '#c5f6fa' },
    'ו': { main: '#845ef7', soft: '#e5dbff' },
  },
  // צבעי אצבעות להקלדה עיוורת (מימין לשמאל בתצוגה)
  fingers: {
    'left-pinky': '#f783ac',
    'left-ring': '#faa2c1',
    'left-middle': '#ffd43b',
    'left-index': '#69db7c',
    'right-index': '#4dabf7',
    'right-middle': '#9775fa',
    'right-ring': '#da77f2',
    'right-pinky': '#ff8787',
    'thumb': '#ced4da',
  },
  shadow: {
    sm: '0 2px 6px rgba(40, 50, 90, 0.08)',
    md: '0 6px 18px rgba(40, 50, 90, 0.12)',
    lg: '0 14px 34px rgba(40, 50, 90, 0.18)',
  },
  radius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
    pill: '999px',
  },
  font: "'Segoe UI', 'Rubik', 'Arial', sans-serif",
};

export const fingerLabels = {
  'left-pinky': 'זרת שמאל',
  'left-ring': 'קמיצה שמאל',
  'left-middle': 'אמה שמאל',
  'left-index': 'אצבע שמאל',
  'right-index': 'אצבע ימין',
  'right-middle': 'אמה ימין',
  'right-ring': 'קמיצה ימין',
  'right-pinky': 'זרת ימין',
  'thumb': 'אגודל',
};
