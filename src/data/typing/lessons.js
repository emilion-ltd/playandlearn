// שיעורי הקלדה עיוורת מדורגים. כל שיעור: מקשים חדשים + טקסט תרגול.
// המנוע מציג את הטקסט, מדגיש את התו הבא ואת האצבע במקלדת.

export const hebrewLessons = [
  {
    id: 'he-1',
    title: 'שורת הבית - אצבעות מנוחה',
    subtitle: 'המקשים שעליהם נחות האצבעות: ש ד ג כ ח ל ך ף',
    newKeys: ['ש', 'ד', 'ג', 'כ', 'ח', 'ל', 'ך', 'ף'],
    text: 'כח כח חכ חכ כל כל לח לח ככ חח לל ככ דש דש שד גכ כג חל לח ךף ףך כחל שדג',
  },
  {
    id: 'he-2',
    title: 'שורת הבית המלאה',
    subtitle: 'מוסיפים את אצבעות המורה: ע י',
    newKeys: ['ע', 'י'],
    text: 'עי עי יע יע גע עג יח חי כע עכ לי יל שי יש דע עד עיר חיל גיל ילד שיר עץ',
  },
  {
    id: 'he-3',
    title: 'השורה העליונה',
    subtitle: 'מטפסים למעלה: ק ר א ט ו ן ם פ',
    newKeys: ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
    text: 'קר רק את טא וו ןן םם פפ אור רוח קור פרי ארי טור אופן ראש פרח קרן רקפת',
  },
  {
    id: 'he-4',
    title: 'השורה התחתונה',
    subtitle: 'יורדים למטה: ז ס ב ה נ מ צ ת ץ',
    newKeys: ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'],
    text: 'זה סם בה הם נמ צת תץ זמן סבא בית הבן נמר מים צבע תות בצל סבתא נחמה זהב',
  },
  {
    id: 'he-5',
    title: 'מילים שלמות',
    subtitle: 'מחברים הכול יחד למילים',
    newKeys: [],
    text: 'שלום ילד ילדה ספר בית מים שמש ירח כוכב פרח עץ חתול כלב סוס דג ציפור גן',
  },
  {
    id: 'he-6',
    title: 'משפטים קצרים',
    subtitle: 'הקלדה זורמת של משפטים',
    newKeys: [],
    text: 'הילד הולך לבית הספר. השמש זורחת בבוקר. החתול ישן על הספה. אני אוהב ללמוד.',
  },
];

export const englishLessons = [
  {
    id: 'en-1',
    title: 'Home Row - Resting Fingers',
    subtitle: 'The keys your fingers rest on: a s d f j k l ;',
    newKeys: ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'],
    text: 'fj fj jf jf ff jj df kd dk sl ls aa ;; fjf jfj dkd sls asdf jkl; fjdk sla;',
  },
  {
    id: 'en-2',
    title: 'Home Row Words',
    subtitle: 'Add g and h, make real words',
    newKeys: ['g', 'h'],
    text: 'gh hg gas had has lad sad gall hall fall flask glad jak ash dash lash half',
  },
  {
    id: 'en-3',
    title: 'Top Row',
    subtitle: 'Reach up: q w e r t y u i o p',
    newKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    text: 'we re you it to type quiet power write enter outer pretty report quote try',
  },
  {
    id: 'en-4',
    title: 'Bottom Row',
    subtitle: 'Reach down: z x c v b n m',
    newKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    text: 'zoo box cave van numb climb brave mix zone cabin maze vivid comb branch buzz',
  },
  {
    id: 'en-5',
    title: 'Common Words',
    subtitle: 'Type everyday words smoothly',
    newKeys: [],
    text: 'the and you that have with this from they will what about which their there',
  },
  {
    id: 'en-6',
    title: 'Sentences',
    subtitle: 'Flowing sentence practice',
    newKeys: [],
    text: 'The quick brown fox jumps over the lazy dog. Learning to type is fun and easy.',
  },
];

export const lessonsByLang = {
  he: hebrewLessons,
  en: englishLessons,
};

// מאגר מילים למשחק המהירות בנייד
export const mobileWords = {
  he: [
    'שלום', 'ילד', 'בית', 'ספר', 'מים', 'שמש', 'ירח', 'כוכב', 'פרח', 'עץ',
    'חתול', 'כלב', 'סוס', 'דג', 'ציפור', 'גן', 'ים', 'הר', 'חבר', 'משחק',
    'אוכל', 'תפוח', 'בננה', 'גלידה', 'אופניים', 'כדור', 'מורה', 'תלמיד', 'שיר', 'ריקוד',
  ],
  en: [
    'cat', 'dog', 'sun', 'moon', 'star', 'tree', 'fish', 'bird', 'home', 'play',
    'book', 'game', 'ball', 'jump', 'run', 'swim', 'read', 'write', 'learn', 'happy',
    'apple', 'water', 'house', 'friend', 'school', 'music', 'dance', 'smile', 'green', 'light',
  ],
};
