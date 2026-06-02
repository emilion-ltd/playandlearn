// מבנה תוכנית הלימודים: כיתות א'-ו' והנושאים בכל כיתה.
// כל נושא מצביע על "screen" שאליו מנווטים. נושאים עתידיים מסומנים ב-comingSoon.

export const grades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

export const gradeMeta = {
  'א': { label: 'כיתה א׳', emoji: '🌱', age: 'גיל 6-7' },
  'ב': { label: 'כיתה ב׳', emoji: '🌿', age: 'גיל 7-8' },
  'ג': { label: 'כיתה ג׳', emoji: '🪴', age: 'גיל 8-9' },
  'ד': { label: 'כיתה ד׳', emoji: '🌳', age: 'גיל 9-10' },
  'ה': { label: 'כיתה ה׳', emoji: '🌲', age: 'גיל 10-11' },
  'ו': { label: 'כיתה ו׳', emoji: '🌟', age: 'גיל 11-12' },
};

// נושאי לימוד. grades = באילו כיתות הנושא מוצג.
export const subjects = [
  {
    id: 'typing',
    title: 'הקלדה עיוורת',
    emoji: '⌨️',
    color: '#5b6cf9',
    description: 'ללמוד להקליד מהר ובלי להסתכל - בעברית ובאנגלית',
    screen: 'typing-home',
    grades: ['ב', 'ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'art',
    title: 'אומנות וציור',
    emoji: '🎨',
    color: '#fa5252',
    description: 'עולם הציורים: ציור, צביעה, מדבקות ודמות מדברת',
    screen: 'art',
    grades: ['א', 'ב', 'ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'music',
    title: 'מוסיקה ופסנתר',
    emoji: '🎹',
    color: '#e64980',
    description: 'נגנו פסנתר אמיתי, למדו תווים ונגנו שירים מוכרים',
    screen: 'music-home',
    grades: ['א', 'ב', 'ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'letters',
    title: 'האלף-בית',
    emoji: '🔤',
    color: '#ff6b6b',
    description: 'מכירים את אותיות האלף-בית בעברית',
    screen: 'letters',
    grades: ['א', 'ב'],
  },
  {
    id: 'math',
    title: 'חשבון וחשיבה',
    emoji: '🔢',
    color: '#51cf66',
    description: 'חיבור, חיסור, כפל וחילוק - לפי רמות',
    screen: 'math',
    grades: ['א', 'ב', 'ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'english',
    title: 'אנגלית',
    emoji: '🇬🇧',
    color: '#22b8cf',
    description: 'אוצר מילים באנגלית לפי קטגוריות',
    screen: 'english',
    grades: ['ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'science',
    title: 'מדע וטבע',
    emoji: '🔬',
    color: '#845ef7',
    description: 'טריוויה מרתקת על חיות, גוף האדם, חלל וטבע',
    screen: 'science',
    grades: ['ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'reading',
    title: 'אותיות בארץ הפלאים',
    emoji: '📖',
    color: '#a855f7',
    description: 'משחק קריאה: זיהוי אותיות, השלמת מילים וקריאת משפטים',
    screen: 'reading-home',
    grades: ['א', 'ב', 'ג'],
  },
];

export function subjectsForGrade(grade) {
  return subjects.filter((s) => s.grades.includes(grade));
}
