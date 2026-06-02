// שירים לנגינה. כל שיר = רצף תווים עם משך (beats). 1 = רבע, 2 = חצי.
// note: מזהה תו (מתאים ל-notes.js).
function seq(pairs) {
  // pairs: [[id, beats], ...]
  return pairs.map(([id, beats = 1]) => ({ id, beats }));
}

export const songs = [
  {
    id: 'scale',
    title: 'סולם דו (הצעד הראשון)',
    emoji: '🎼',
    level: 'beginner',
    desc: 'מנגנים את שבעת התווים בזה אחר זה',
    notes: seq([
      ['C4'], ['D4'], ['E4'], ['F4'], ['G4'], ['A4'], ['B4'], ['C5', 2],
    ]),
  },
  {
    id: 'twinkle',
    title: 'כוכב קטן',
    emoji: '⭐',
    level: 'beginner',
    desc: 'Twinkle Twinkle Little Star',
    notes: seq([
      ['C4'], ['C4'], ['G4'], ['G4'], ['A4'], ['A4'], ['G4', 2],
      ['F4'], ['F4'], ['E4'], ['E4'], ['D4'], ['D4'], ['C4', 2],
    ]),
  },
  {
    id: 'mary',
    title: 'כבשה קטנה',
    emoji: '🐑',
    level: 'beginner',
    desc: 'Mary Had a Little Lamb',
    notes: seq([
      ['E4'], ['D4'], ['C4'], ['D4'], ['E4'], ['E4'], ['E4', 2],
      ['D4'], ['D4'], ['D4', 2], ['E4'], ['G4'], ['G4', 2],
    ]),
  },
  {
    id: 'jingle',
    title: 'פעמונים',
    emoji: '🔔',
    level: 'beginner',
    desc: 'Jingle Bells (הפזמון)',
    notes: seq([
      ['E4'], ['E4'], ['E4', 2], ['E4'], ['E4'], ['E4', 2],
      ['E4'], ['G4'], ['C4'], ['D4'], ['E4', 2],
    ]),
  },
  {
    id: 'ode',
    title: 'המנון לשמחה',
    emoji: '🎉',
    level: 'advanced',
    desc: 'Ode to Joy - בטהובן',
    notes: seq([
      ['E4'], ['E4'], ['F4'], ['G4'], ['G4'], ['F4'], ['E4'], ['D4'],
      ['C4'], ['C4'], ['D4'], ['E4'], ['E4', 1.5], ['D4', 0.5], ['D4', 2],
    ]),
  },
  {
    id: 'birthday',
    title: 'יום הולדת שמח',
    emoji: '🎂',
    level: 'advanced',
    desc: 'Happy Birthday',
    notes: seq([
      ['C4'], ['C4'], ['D4', 2], ['C4', 2], ['F4', 2], ['E4', 3],
      ['C4'], ['C4'], ['D4', 2], ['C4', 2], ['G4', 2], ['F4', 3],
      ['C4'], ['C4'], ['C5', 2], ['A4', 2], ['F4', 2], ['E4', 2], ['D4', 3],
      ['A#4'], ['A#4'], ['A4', 2], ['F4', 2], ['G4', 2], ['F4', 3],
    ]),
  },
  {
    id: 'odeharder',
    title: 'אצבעות זריזות',
    emoji: '⚡',
    level: 'advanced',
    desc: 'תרגיל מהירות על הסולם',
    notes: seq([
      ['C4'], ['E4'], ['D4'], ['F4'], ['E4'], ['G4'], ['F4'], ['A4'],
      ['G4'], ['B4'], ['A4'], ['C5'], ['B4'], ['C5', 2],
    ]),
  },
];

export const baseBeatSeconds = 0.5;

export function songsByLevel(level) {
  return songs.filter((s) => s.level === level);
}
