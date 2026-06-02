// שאלות המשחק "אותיות בארץ הפלאים" - מיון לפי רמות ושלבים
export const questions = [
  // שלב 1 - רמה 1: זיהוי אות ראשונה
  { id: 1, level: 1, stage: 1, question: 'באיזו אות מתחילה המילה "סוּס"?', answers: ['א', 'ס', 'ב', 'ש'], correctAnswer: 1, stars: 1, hint: 'תסתכל על האות הראשונה במילה' },
  { id: 2, level: 1, stage: 1, question: 'באיזו אות מתחילה המילה "כֶּלֶב"?', answers: ['כ', 'ל', 'ב', 'ד'], correctAnswer: 0, stars: 1, hint: 'האות הראשונה היא...' },
  { id: 3, level: 1, stage: 1, question: 'באיזו אות מתחילה המילה "דָּג"?', answers: ['ג', 'ד', 'ה', 'ו'], correctAnswer: 1, stars: 1 },
  { id: 4, level: 1, stage: 1, question: 'באיזו אות מתחילה המילה "אִמָּא"?', answers: ['מ', 'א', 'ב', 'ת'], correctAnswer: 1, stars: 1 },
  // רמה 2: זיהוי אות אחרונה
  { id: 5, level: 2, stage: 1, question: 'באיזו אות נגמרת המילה "חַלּוֹן"?', answers: ['ח', 'ל', 'ו', 'ן'], correctAnswer: 3, stars: 2, hint: 'תסתכל על האות האחרונה' },
  { id: 6, level: 2, stage: 1, question: 'באיזו אות נגמרת המילה "סֵפֶר"?', answers: ['ס', 'פ', 'ר', 'ל'], correctAnswer: 2, stars: 2 },
  { id: 7, level: 2, stage: 1, question: 'באיזו אות נגמרת המילה "בַּיִת"?', answers: ['ב', 'י', 'ת', 'ה'], correctAnswer: 2, stars: 2 },
  // רמה 3: השלמת מילה
  { id: 8, level: 3, stage: 1, question: 'מה חסר? "שָׁ_לוֹם"', answers: ['י', 'ל', 'מ', 'ו'], correctAnswer: 1, stars: 3, hint: 'המילה היא "שָׁלוֹם"' },
  { id: 9, level: 3, stage: 1, question: 'מה חסר? "בּוּ_ָה"', answers: ['ו', 'ב', 'מ', 'א'], correctAnswer: 1, stars: 3, hint: 'המילה היא "בּוּבָה"' },
  { id: 10, level: 3, stage: 1, question: 'מה חסר? "יֶ_ֶד"', answers: ['י', 'ר', 'ל', 'מ'], correctAnswer: 2, stars: 3, hint: 'המילה היא "יֶלֶד"' },
  // רמה 4: בחירת מילה נכונה
  { id: 11, level: 4, stage: 1, question: 'איך כותבים נכון? 🐱', answers: ['חָתוּל', 'חָטוּל', 'הָתוּל', 'כָּתוּל'], correctAnswer: 0, stars: 3 },
  { id: 12, level: 4, stage: 1, question: 'איך כותבים נכון? 🏠', answers: ['בִּיט', 'בַּיִת', 'פִּית', 'בַּיִּיט'], correctAnswer: 1, stars: 3 },
  { id: 13, level: 4, stage: 1, question: 'איך כותבים נכון? 🌸', answers: ['פֶּרֶךְ', 'פֶּרֶת', 'פֶּרֶץ', 'פֶּרַח'], correctAnswer: 3, stars: 3 },
  // רמה 5: קריאת משפטים קצרים
  { id: 14, level: 5, stage: 1, question: 'מה כתוב? "אֲנִי אוֹהֵב"', answers: ['אֲנִי רוֹצֶה', 'אֲנִי אוֹהֵב', 'אֲנִי הוֹלֵךְ', 'אֲנִי רוֹאֶה'], correctAnswer: 1, stars: 3 },
  { id: 15, level: 5, stage: 1, question: 'מה כתוב? "שָׁלוֹם חָבֵר"', answers: ['בֹּקֶר טוֹב', 'לַיְלָה טוֹב', 'שָׁלוֹם חָבֵר', 'תּוֹדָה רַבָּה'], correctAnswer: 2, stars: 3 },

  // שלב 2 - רמה 1
  { id: 16, level: 1, stage: 2, question: 'באיזו אות מתחילה המילה "נָחָשׁ"?', answers: ['מ', 'נ', 'ח', 'ש'], correctAnswer: 1, stars: 1 },
  { id: 17, level: 1, stage: 2, question: 'באיזו אות מתחילה המילה "תַּפּוּחַ"?', answers: ['ת', 'פ', 'ח', 'ט'], correctAnswer: 0, stars: 1 },
  { id: 18, level: 1, stage: 2, question: 'באיזו אות מתחילה המילה "רַכֶּבֶת"?', answers: ['ר', 'כ', 'ב', 'ל'], correctAnswer: 0, stars: 1 },
  // רמה 2
  { id: 19, level: 2, stage: 2, question: 'באיזו אות נגמרת המילה "גָּמָל"?', answers: ['ג', 'מ', 'ל', 'ן'], correctAnswer: 2, stars: 2 },
  { id: 20, level: 2, stage: 2, question: 'באיזו אות נגמרת המילה "שֻׁלְחָן"?', answers: ['ש', 'ח', 'ל', 'ן'], correctAnswer: 3, stars: 2 },
  { id: 21, level: 2, stage: 2, question: 'באיזו אות נגמרת המילה "אוֹר"?', answers: ['א', 'ו', 'ר', 'ה'], correctAnswer: 2, stars: 2 },
  // רמה 3
  { id: 22, level: 3, stage: 2, question: 'מה חסר? "כַּ_וּר"', answers: ['ד', 'ב', 'ר', 'מ'], correctAnswer: 0, stars: 3, hint: 'המילה היא "כַּדּוּר"' },
  { id: 23, level: 3, stage: 2, question: 'מה חסר? "חָ_וֹן"', answers: ['ל', 'מ', 'ר', 'ש'], correctAnswer: 0, stars: 3, hint: 'המילה היא "חָלוֹן"' },
  { id: 24, level: 3, stage: 2, question: 'מה חסר? "אִ_ָּא"', answers: ['י', 'מ', 'ג', 'ל'], correctAnswer: 1, stars: 3, hint: 'המילה היא "אִמָּא"' },
  // רמה 4
  { id: 25, level: 4, stage: 2, question: 'איך כותבים נכון? 🌳', answers: ['עץ', 'עס', 'אץ', 'עצ'], correctAnswer: 0, stars: 3 },
  { id: 26, level: 4, stage: 2, question: 'איך כותבים נכון? 🌞', answers: ['שמש', 'שמס', 'סמש', 'שמח'], correctAnswer: 0, stars: 3 },
  { id: 27, level: 4, stage: 2, question: 'איך כותבים נכון? 🍎', answers: ['תפוח', 'תפות', 'תאוח', 'טפוח'], correctAnswer: 0, stars: 3 },
  // רמה 5
  { id: 28, level: 5, stage: 2, question: 'מה כתוב? "תּוֹדָה רַבָּה"', answers: ['שָׁלוֹם חָבֵר', 'תּוֹדָה רַבָּה', 'בֹּקֶר טוֹב', 'לַיְלָה טוֹב'], correctAnswer: 1, stars: 3 },
  { id: 29, level: 5, stage: 2, question: 'מה כתוב? "אֲנִי שָׂמֵחַ"', answers: ['אֲנִי רוֹצֶה', 'אֲנִי עָצוּב', 'אֲנִי שָׂמֵחַ', 'אֲנִי הוֹלֵךְ'], correctAnswer: 2, stars: 3 },
  { id: 30, level: 5, stage: 2, question: 'מה כתוב? "בֹּקֶר טוֹב"', answers: ['בֹּקֶר טוֹב', 'לַיְלָה טוֹב', 'שָׁלוֹם חָבֵר', 'תּוֹדָה רַבָּה'], correctAnswer: 0, stars: 3 },
];

export const getQuestionsByStage = (stage) => questions.filter((q) => q.stage === stage);
