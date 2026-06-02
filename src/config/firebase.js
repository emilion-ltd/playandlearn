// חיבור ל-Firebase של otiot-game (אותו פרויקט של "אותיות בארץ הפלאים").
// הפלטפורמה החדשה כותבת תחת namespace נפרד: playandlearn/ — כדי לא להתנגש
// בנתוני המשחק המקורי. אם האתחול נכשל (אופליין/חסום) — הפלטפורמה ממשיכה
// לעבוד מקומית בלבד.
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAASaVs14y0jHzeQh9yNM95DGjCXZRplfA',
  authDomain: 'otiot-game.firebaseapp.com',
  databaseURL: 'https://otiot-game-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'otiot-game',
  storageBucket: 'otiot-game.firebasestorage.app',
  messagingSenderId: '988083656890',
  appId: '1:988083656890:web:95b6b39230fc7301bf4a83',
  measurementId: 'G-T71BDXTJBN',
};

// השורש לכל נתוני הפלטפורמה החדשה ב-Realtime Database
export const ROOT = 'playandlearn';

let database = null;
try {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (e) {
  console.warn('Firebase init failed — running offline only', e);
}

export { database };
export const firebaseEnabled = !!database;
