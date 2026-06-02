// פריסת מקלדת פיזית (QWERTY) עם מיפוי אצבעות.
// לכל מקש: en = התו באנגלית, he = התו בעברית (פריסת תקן ישראלי SI-1452),
// finger = האצבע שאמורה ללחוץ, home = מקש עוגן (יש לו בליטה במקלדת אמיתית).

export const keyboardRows = [
  [
    { en: 'q', he: '/', finger: 'left-pinky' },
    { en: 'w', he: "'", finger: 'left-ring' },
    { en: 'e', he: 'ק', finger: 'left-middle' },
    { en: 'r', he: 'ר', finger: 'left-index' },
    { en: 't', he: 'א', finger: 'left-index' },
    { en: 'y', he: 'ט', finger: 'right-index' },
    { en: 'u', he: 'ו', finger: 'right-index' },
    { en: 'i', he: 'ן', finger: 'right-middle' },
    { en: 'o', he: 'ם', finger: 'right-ring' },
    { en: 'p', he: 'פ', finger: 'right-pinky' },
  ],
  [
    { en: 'a', he: 'ש', finger: 'left-pinky' },
    { en: 's', he: 'ד', finger: 'left-ring' },
    { en: 'd', he: 'ג', finger: 'left-middle' },
    { en: 'f', he: 'כ', finger: 'left-index', home: true },
    { en: 'g', he: 'ע', finger: 'left-index' },
    { en: 'h', he: 'י', finger: 'right-index' },
    { en: 'j', he: 'ח', finger: 'right-index', home: true },
    { en: 'k', he: 'ל', finger: 'right-middle' },
    { en: 'l', he: 'ך', finger: 'right-ring' },
    { en: ';', he: 'ף', finger: 'right-pinky' },
  ],
  [
    { en: 'z', he: 'ז', finger: 'left-pinky' },
    { en: 'x', he: 'ס', finger: 'left-ring' },
    { en: 'c', he: 'ב', finger: 'left-middle' },
    { en: 'v', he: 'ה', finger: 'left-index' },
    { en: 'b', he: 'נ', finger: 'left-index' },
    { en: 'n', he: 'מ', finger: 'right-index' },
    { en: 'm', he: 'צ', finger: 'right-index' },
    { en: ',', he: 'ת', finger: 'right-middle' },
    { en: '.', he: 'ץ', finger: 'right-ring' },
    { en: '/', he: '.', finger: 'right-pinky' },
  ],
];

export const spaceKey = { en: ' ', he: ' ', finger: 'thumb', label: 'רווח' };

// בניית מפת חיפוש: תו -> פרטי מקש (אצבע, מיקום) לכל שפה.
function buildCharMap(lang) {
  const map = {};
  keyboardRows.forEach((row, rowIndex) => {
    row.forEach((key, keyIndex) => {
      const ch = key[lang];
      if (ch) map[ch] = { finger: key.finger, rowIndex, keyIndex, home: !!key.home };
    });
  });
  map[' '] = { finger: 'thumb', rowIndex: 3, keyIndex: 0, home: false };
  return map;
}

export const charMaps = {
  en: buildCharMap('en'),
  he: buildCharMap('he'),
};

// מחזיר את האצבע המתאימה לתו נתון בשפה נתונה
export function fingerForChar(ch, lang) {
  if (!ch) return null;
  const lower = lang === 'en' ? ch.toLowerCase() : ch;
  return charMaps[lang][lower]?.finger || null;
}

// פריסת מקלדת *נייד* - תואמת למקלדת הטלפון האמיתית (מוצגת משמאל לימין).
// בעברית: ק בצד שמאל, כמו במקלדת המערכת. כולל אותיות סופיות.
export const mobileLayout = {
  he: [
    ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
    ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
    ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'],
  ],
  en: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ],
};
