// מאגר שאלות מדע וטבע לפי נושאים. כל שאלה: prompt, display(emoji), answers, correct(index), note.
export const scienceTopics = [
  {
    id: 'animals',
    label: 'עולם החי',
    emoji: '🦁',
    color: '#ff922b',
    questions: [
      { prompt: 'איזו חיה היא היונק הגדול ביותר בעולם?', display: '🐋', answers: ['פיל', 'לווייתן כחול', 'ג׳ירפה', 'היפופוטם'], correct: 1, note: 'הלווייתן הכחול ענק!' },
      { prompt: 'כמה רגליים יש לעכביש?', display: '🕷️', answers: ['6', '8', '10', '4'], correct: 1 },
      { prompt: 'איזו חיה מחליפה צבע כדי להסתתר?', display: '🦎', answers: ['זיקית', 'אריה', 'פרה', 'דג זהב'], correct: 0 },
      { prompt: 'מה אוכלת הפרה?', display: '🐄', answers: ['בשר', 'עשב', 'דגים', 'אגוזים'], correct: 1, note: 'הפרה צמחונית' },
      { prompt: 'איזו חיה ישנה בחורף (שנת חורף)?', display: '🐻', answers: ['דוב', 'נמר', 'זברה', 'תוכי'], correct: 0 },
      { prompt: 'מאיזו חיה מקבלים דבש?', display: '🐝', answers: ['נמלה', 'דבורה', 'זבוב', 'פרפר'], correct: 1 },
      { prompt: 'איזו ציפור לא יכולה לעוף?', display: '🐧', answers: ['יונה', 'נשר', 'פינגווין', 'דרור'], correct: 2 },
      { prompt: 'איזו חיה היא הגבוהה בעולם?', display: '🦒', answers: ['ג׳ירפה', 'פיל', 'גמל', 'סוס'], correct: 0 },
    ],
  },
  {
    id: 'body',
    label: 'גוף האדם',
    emoji: '🧠',
    color: '#ff6b9d',
    questions: [
      { prompt: 'איזה איבר שואב את הדם בגוף?', display: '❤️', answers: ['כבד', 'לב', 'ריאה', 'קיבה'], correct: 1 },
      { prompt: 'בעזרת מה אנחנו נושמים?', display: '🫁', answers: ['ריאות', 'כליות', 'מוח', 'עצמות'], correct: 0 },
      { prompt: 'כמה שיניים יש בערך למבוגר?', display: '🦷', answers: ['12', '20', '32', '50'], correct: 2 },
      { prompt: 'איזה איבר עוזר לנו לחשוב?', display: '🧠', answers: ['מוח', 'לב', 'יד', 'אף'], correct: 0 },
      { prompt: 'באיזה חוש אנחנו מריחים?', display: '👃', answers: ['ראייה', 'ריח', 'שמיעה', 'מגע'], correct: 1 },
      { prompt: 'מה מגן על הגוף מבחוץ?', display: '🧴', answers: ['עור', 'דם', 'שיער', 'ציפורניים'], correct: 0 },
      { prompt: 'כמה אצבעות יש בשתי ידיים?', display: '🙌', answers: ['8', '10', '12', '5'], correct: 1 },
    ],
  },
  {
    id: 'space',
    label: 'חלל וכוכבים',
    emoji: '🚀',
    color: '#5b6cf9',
    questions: [
      { prompt: 'מהו הכוכב שמסביבו מקיפה כדור הארץ?', display: '☀️', answers: ['הירח', 'השמש', 'מאדים', 'נוגה'], correct: 1 },
      { prompt: 'מה מקיף את כדור הארץ בלילה ומאיר?', display: '🌙', answers: ['השמש', 'הירח', 'ענן', 'מטאור'], correct: 1 },
      { prompt: 'כמה כוכבי לכת יש במערכת השמש?', display: '🪐', answers: ['5', '8', '12', '20'], correct: 1 },
      { prompt: 'איך קוראים לכוכב הלכת שלנו?', display: '🌍', answers: ['מאדים', 'כדור הארץ', 'צדק', 'שבתאי'], correct: 1 },
      { prompt: 'מי טס לחלל בחללית?', display: '👨‍🚀', answers: ['אסטרונאוט', 'צולל', 'טייס מטוס', 'נהג'], correct: 0 },
      { prompt: 'איזה כוכב לכת מכונה "הכוכב האדום"?', display: '🔴', answers: ['נוגה', 'מאדים', 'צדק', 'נפטון'], correct: 1 },
    ],
  },
  {
    id: 'nature',
    label: 'צמחים וטבע',
    emoji: '🌱',
    color: '#51cf66',
    questions: [
      { prompt: 'מה הצמח צריך כדי לגדול?', display: '🌻', answers: ['רק חושך', 'מים ושמש', 'רק קור', 'סוכר'], correct: 1 },
      { prompt: 'איזה חלק של הצמח נמצא מתחת לאדמה?', display: '🌿', answers: ['פרח', 'עלה', 'שורש', 'פרי'], correct: 2 },
      { prompt: 'מאיפה מגיע הגשם?', display: '🌧️', answers: ['מהעננים', 'מהאדמה', 'מהשמש', 'מהים ישירות'], correct: 0 },
      { prompt: 'איזו עונה היא הקרה ביותר?', display: '❄️', answers: ['קיץ', 'אביב', 'חורף', 'סתיו'], correct: 2 },
      { prompt: 'מה הצבע של רוב העלים?', display: '🍃', answers: ['ירוק', 'כחול', 'סגול', 'שחור'], correct: 0, note: 'בזכות הכלורופיל' },
      { prompt: 'מה גדל על עץ התפוח?', display: '🍎', answers: ['בננות', 'תפוחים', 'ענבים', 'תפוזים'], correct: 1 },
      { prompt: 'מה הופך זחל יפהפה?', display: '🦋', answers: ['פרפר', 'דבורה', 'נמלה', 'חיפושית'], correct: 0 },
    ],
  },
  {
    id: 'matter',
    label: 'חומרים ומדע',
    emoji: '🔬',
    color: '#22b8cf',
    questions: [
      { prompt: 'מה קורה למים כשמקפיאים אותם?', display: '🧊', answers: ['הופכים לקרח', 'נעלמים', 'הופכים לאש', 'משחירים'], correct: 0 },
      { prompt: 'מה קורה למים כשמרתיחים אותם?', display: '♨️', answers: ['קופאים', 'הופכים לאדים', 'הופכים לאבן', 'נצבעים'], correct: 1 },
      { prompt: 'איזה כוח מושך אותנו לאדמה?', display: '🍎', answers: ['כוח המשיכה', 'חשמל', 'רוח', 'מגנט'], correct: 0 },
      { prompt: 'מה מושך אליו ברזל?', display: '🧲', answers: ['מגנט', 'עץ', 'מים', 'נייר'], correct: 0 },
      { prompt: 'איזה צבע נוצר מערבוב כחול וצהוב?', display: '🎨', answers: ['ירוק', 'אדום', 'שחור', 'כתום'], correct: 0 },
      { prompt: 'מה זז מהר יותר - אור או קול?', display: '⚡', answers: ['אור', 'קול', 'אותו הדבר', 'אף אחד'], correct: 0, note: 'לכן רואים ברק לפני שמיעת הרעם' },
    ],
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ערבוב סדר השאלות וסדר התשובות בכל שאלה
export function makeScienceQuestions(topicId) {
  const topic = scienceTopics.find((t) => t.id === topicId);
  if (!topic) return [];
  return shuffle(topic.questions).map((q) => {
    const correctText = q.answers[q.correct];
    const answers = shuffle(q.answers);
    return { ...q, answers, correct: answers.indexOf(correctText) };
  });
}
