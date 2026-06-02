// תווים: תדרים (A4=440, טמפרמנט שווה), שמות סולפג' בעברית, וצבעים (לפי שיטת בומווקרס).
// צבע לכל דרגה (מתחדש בכל אוקטבה)
const stepColors = {
  C: '#e74c3c', // דו - אדום
  D: '#e67e22', // רה - כתום
  E: '#f1c40f', // מי - צהוב
  F: '#2ecc71', // פה - ירוק
  G: '#1abc9c', // סול - טורקיז
  A: '#3498db', // לה - כחול
  B: '#9b59b6', // סי - סגול
};

const solfege = {
  C: 'דו', D: 'רה', E: 'מי', F: 'פה', G: 'סול', A: 'לה', B: 'סי',
};

// חצי-טונים בתוך אוקטבה, עם סימון אם שחור
const semitones = [
  { step: 'C', black: false },
  { step: 'C', black: true, sharpOf: 'C' },
  { step: 'D', black: false },
  { step: 'D', black: true, sharpOf: 'D' },
  { step: 'E', black: false },
  { step: 'F', black: false },
  { step: 'F', black: true, sharpOf: 'F' },
  { step: 'G', black: false },
  { step: 'G', black: true, sharpOf: 'G' },
  { step: 'A', black: false },
  { step: 'A', black: true, sharpOf: 'A' },
  { step: 'B', black: false },
];

// חישוב תדר לפי מספר חצאי-טונים מ-A4
function freqFromA4(semitonesFromA4) {
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// בניית תווים מאוקטבה 4 עד דו 6
export function buildNotes() {
  const notes = [];
  const startOctave = 4;
  const endOctave = 5; // נוסיף C6 בנפרד
  for (let oct = startOctave; oct <= endOctave; oct++) {
    semitones.forEach((s, idx) => {
      const id = `${s.step}${s.black ? '#' : ''}${oct}`;
      // מספר חצאי-טונים מ-A4: A4 הוא ב-oct 4 אינדקס 9
      const semisFromA4 = (oct - 4) * 12 + (idx - 9);
      notes.push({
        id,
        step: s.step,
        octave: oct,
        black: s.black,
        name: s.black ? `${solfege[s.sharpOf]}#` : solfege[s.step],
        color: s.black ? '#2c3e50' : stepColors[s.step],
        freq: freqFromA4(semisFromA4),
      });
    });
  }
  // דו 6
  notes.push({
    id: 'C6',
    step: 'C',
    octave: 6,
    black: false,
    name: solfege.C,
    color: stepColors.C,
    freq: freqFromA4((6 - 4) * 12 + (0 - 9)),
  });
  return notes;
}

export const notes = buildNotes();

export const noteById = notes.reduce((acc, n) => {
  acc[n.id] = n;
  return acc;
}, {});

export const stepColorMap = stepColors;
export const solfegeMap = solfege;
