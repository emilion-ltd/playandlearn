// אוצר מילים באנגלית לפי קטגוריות. כל פריט: en (אנגלית), he (עברית), emoji.
export const englishCategories = [
  {
    id: 'animals',
    label: 'חיות',
    emoji: '🐾',
    color: '#51cf66',
    words: [
      { en: 'Dog', he: 'כלב', emoji: '🐶' },
      { en: 'Cat', he: 'חתול', emoji: '🐱' },
      { en: 'Lion', he: 'אריה', emoji: '🦁' },
      { en: 'Elephant', he: 'פיל', emoji: '🐘' },
      { en: 'Fish', he: 'דג', emoji: '🐟' },
      { en: 'Bird', he: 'ציפור', emoji: '🐦' },
      { en: 'Horse', he: 'סוס', emoji: '🐴' },
      { en: 'Monkey', he: 'קוף', emoji: '🐵' },
      { en: 'Bear', he: 'דוב', emoji: '🐻' },
      { en: 'Rabbit', he: 'ארנב', emoji: '🐰' },
    ],
  },
  {
    id: 'food',
    label: 'אוכל',
    emoji: '🍎',
    color: '#ff922b',
    words: [
      { en: 'Apple', he: 'תפוח', emoji: '🍎' },
      { en: 'Banana', he: 'בננה', emoji: '🍌' },
      { en: 'Bread', he: 'לחם', emoji: '🍞' },
      { en: 'Milk', he: 'חלב', emoji: '🥛' },
      { en: 'Cheese', he: 'גבינה', emoji: '🧀' },
      { en: 'Egg', he: 'ביצה', emoji: '🥚' },
      { en: 'Cake', he: 'עוגה', emoji: '🍰' },
      { en: 'Water', he: 'מים', emoji: '💧' },
      { en: 'Ice cream', he: 'גלידה', emoji: '🍦' },
      { en: 'Pizza', he: 'פיצה', emoji: '🍕' },
    ],
  },
  {
    id: 'colors',
    label: 'צבעים',
    emoji: '🎨',
    color: '#a855f7',
    words: [
      { en: 'Red', he: 'אדום', emoji: '🔴' },
      { en: 'Blue', he: 'כחול', emoji: '🔵' },
      { en: 'Green', he: 'ירוק', emoji: '🟢' },
      { en: 'Yellow', he: 'צהוב', emoji: '🟡' },
      { en: 'Orange', he: 'כתום', emoji: '🟠' },
      { en: 'Purple', he: 'סגול', emoji: '🟣' },
      { en: 'Black', he: 'שחור', emoji: '⚫' },
      { en: 'White', he: 'לבן', emoji: '⚪' },
      { en: 'Brown', he: 'חום', emoji: '🟤' },
    ],
  },
  {
    id: 'numbers',
    label: 'מספרים',
    emoji: '🔢',
    color: '#22b8cf',
    words: [
      { en: 'One', he: 'אחת', emoji: '1️⃣' },
      { en: 'Two', he: 'שתיים', emoji: '2️⃣' },
      { en: 'Three', he: 'שלוש', emoji: '3️⃣' },
      { en: 'Four', he: 'ארבע', emoji: '4️⃣' },
      { en: 'Five', he: 'חמש', emoji: '5️⃣' },
      { en: 'Six', he: 'שש', emoji: '6️⃣' },
      { en: 'Seven', he: 'שבע', emoji: '7️⃣' },
      { en: 'Eight', he: 'שמונה', emoji: '8️⃣' },
      { en: 'Nine', he: 'תשע', emoji: '9️⃣' },
      { en: 'Ten', he: 'עשר', emoji: '🔟' },
    ],
  },
  {
    id: 'family',
    label: 'משפחה',
    emoji: '👪',
    color: '#ff6b9d',
    words: [
      { en: 'Mother', he: 'אמא', emoji: '👩' },
      { en: 'Father', he: 'אבא', emoji: '👨' },
      { en: 'Brother', he: 'אח', emoji: '👦' },
      { en: 'Sister', he: 'אחות', emoji: '👧' },
      { en: 'Baby', he: 'תינוק', emoji: '👶' },
      { en: 'Grandmother', he: 'סבתא', emoji: '👵' },
      { en: 'Grandfather', he: 'סבא', emoji: '👴' },
      { en: 'Family', he: 'משפחה', emoji: '👪' },
    ],
  },
  {
    id: 'nature',
    label: 'טבע',
    emoji: '🌳',
    color: '#10b981',
    words: [
      { en: 'Sun', he: 'שמש', emoji: '☀️' },
      { en: 'Moon', he: 'ירח', emoji: '🌙' },
      { en: 'Star', he: 'כוכב', emoji: '⭐' },
      { en: 'Tree', he: 'עץ', emoji: '🌳' },
      { en: 'Flower', he: 'פרח', emoji: '🌸' },
      { en: 'Rain', he: 'גשם', emoji: '🌧️' },
      { en: 'Cloud', he: 'ענן', emoji: '☁️' },
      { en: 'Mountain', he: 'הר', emoji: '⛰️' },
      { en: 'Sea', he: 'ים', emoji: '🌊' },
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

export function makeEnglishQuestions(categoryId) {
  const cat = englishCategories.find((c) => c.id === categoryId);
  if (!cat) return [];
  const picked = shuffle(cat.words).slice(0, Math.min(10, cat.words.length));
  return picked.map((word) => {
    const distractors = shuffle(cat.words.filter((w) => w.en !== word.en)).slice(0, 3);
    const answers = shuffle([word, ...distractors]).map((w) => w.en);
    return {
      display: word.emoji,
      prompt: `איך אומרים "${word.he}" באנגלית?`,
      answers,
      correct: answers.indexOf(word.en),
    };
  });
}
