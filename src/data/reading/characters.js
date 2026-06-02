// דמויות המשחק "אותיות בארץ הפלאים"
export const characters = [
  { id: 'shooli', name: 'שולי השועל', description: 'שועל חכם וסקרן שאוהב לגלות מילים חדשות!', emoji: '🦊', color: '#FF6B35' },
  { id: 'tzipori', name: 'ציפורי הצב', description: 'צב סבלני ואיטי שלומד כל אות בזהירות.', emoji: '🐢', color: '#4ECDC4' },
  { id: 'mili', name: 'מילי החתולה', description: 'חתולה משחקת שקופצת בין האותיות!', emoji: '🐱', color: '#FF6B9D' },
  { id: 'oferet', name: 'עופרת הציפור', description: 'ציפור צעירה שמצייצת כל מילה שהיא לומדת.', emoji: '🐦', color: '#FEC25C' },
  { id: 'nimri', name: 'נמרי הנמרה', description: 'נמרה מהירה וחכמה שקופצת על האותיות!', emoji: '🐆', color: '#F59E0B' },
  { id: 'fishfish', name: 'פישפיש הפישפשית', description: 'פישפשית קטנה וחמודה שמקפצת בין המילים!', emoji: '🦗', color: '#10B981' },
  { id: 'dubi', name: 'דובי הדוב', description: 'דוב חמוד ושמח שאוהב לקרוא סיפורים!', emoji: '🐻', color: '#92400E' },
  { id: 'pili', name: 'פילי הפיל', description: 'פיל חכם עם זיכרון מעולה לכל המילים!', emoji: '🐘', color: '#6B7280' },
  { id: 'dagi', name: 'דגי הדג', description: 'דג צבעוני ושמח ששוחה בים המילים!', emoji: '🐠', color: '#06B6D4' },
  { id: 'zivit', name: 'זיויט הזברה', description: 'זברה מפוספסת שאוהבת לרוץ בין השורות!', emoji: '🦓', color: '#374151' },
  { id: 'arnavi', name: 'ארנבי הארנב', description: 'ארנב מהיר שקופץ על האותיות!', emoji: '🐰', color: '#EC4899' },
  { id: 'kofiko', name: 'קופיקו הקוף', description: 'קוף שובב ואנרגטי שמטפס על המילים!', emoji: '🐵', color: '#D97706' },
];

export const getCharacterById = (id) => characters.find((c) => c.id === id);
