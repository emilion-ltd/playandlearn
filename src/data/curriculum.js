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
    description: 'חיבור, חיסור ומשחקי מספרים',
    comingSoon: true,
    grades: ['א', 'ב', 'ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'english',
    title: 'אנגלית',
    emoji: '🇬🇧',
    color: '#22b8cf',
    description: 'מילים, אותיות ומשחקי שפה באנגלית',
    comingSoon: true,
    grades: ['ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'science',
    title: 'מדע וטבע',
    emoji: '🔬',
    color: '#845ef7',
    description: 'גילויים, ניסויים והרפתקאות בעולם המדע',
    comingSoon: true,
    grades: ['ג', 'ד', 'ה', 'ו'],
  },
  {
    id: 'reading',
    title: 'קריאה והבנה',
    emoji: '📚',
    color: '#ff922b',
    description: 'סיפורים, מילים והבנת הנקרא',
    comingSoon: true,
    grades: ['א', 'ב', 'ג', 'ד'],
  },
];

export function subjectsForGrade(grade) {
  return subjects.filter((s) => s.grades.includes(grade));
}
