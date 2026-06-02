// שכבת סנכרון מקוון מעל Firebase Realtime Database.
// אחראית על: נוכחות שחקנים מחוברים (presence), טבלת אלופים גלובלית,
// ושיאים גלובליים לכל משחק. כל הפעולות בטוחות-כשל: אם אין Firebase, הן
// פשוט לא עושות כלום והפלטפורמה ממשיכה לעבוד מקומית.
import { ref, onValue, set, update, remove, onDisconnect, serverTimestamp } from 'firebase/database';
import { database, firebaseEnabled, ROOT } from '../config/firebase';

const DEVICE_KEY = 'learn-he-device-id';

// מזהה מכשיר יציב (כדי שמפתחות שחקנים יהיו ייחודיים גלובלית בין מכשירים)
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = 'd_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// מפתח גלובלי לשחקן = מכשיר + מזהה מקומי
export function playerKey(localId) {
  return `${getDeviceId()}__${localId}`;
}

export { firebaseEnabled };

// ----- נוכחות (מי מחובר עכשיו) -----
export function publishPresence(player) {
  if (!firebaseEnabled || !player) return;
  const key = playerKey(player.id);
  const node = ref(database, `${ROOT}/presence/${key}`);
  set(node, {
    name: player.name || 'שחקן',
    emoji: player.emoji || '🦊',
    points: player.points || 0,
    lastActive: serverTimestamp(),
  }).catch(() => {});
  onDisconnect(node).remove();
}

export function touchPresence(player) {
  if (!firebaseEnabled || !player) return;
  const key = playerKey(player.id);
  update(ref(database, `${ROOT}/presence/${key}`), {
    points: player.points || 0,
    lastActive: serverTimestamp(),
  }).catch(() => {});
}

export function clearPresence(localId) {
  if (!firebaseEnabled || !localId) return;
  remove(ref(database, `${ROOT}/presence/${playerKey(localId)}`)).catch(() => {});
}

// ----- טבלת אלופים גלובלית (נתונים מצטברים לכל שחקן) -----
export function publishPlayer(player) {
  if (!firebaseEnabled || !player) return;
  const key = playerKey(player.id);
  set(ref(database, `${ROOT}/players/${key}`), {
    name: player.name || 'שחקן',
    emoji: player.emoji || '🦊',
    points: player.points || 0,
    records: player.records || {},
    updatedAt: serverTimestamp(),
  }).catch(() => {});
}

// ----- מנויים (subscriptions) -----
const ACTIVE_WINDOW = 5 * 60 * 1000; // 5 דקות

export function subscribeOnline(cb) {
  if (!firebaseEnabled) { cb([]); return () => {}; }
  const node = ref(database, `${ROOT}/presence`);
  return onValue(node, (snap) => {
    const data = snap.val() || {};
    const now = Date.now();
    const list = Object.entries(data)
      .map(([key, v]) => ({ key, ...v }))
      .filter((p) => !p.lastActive || now - p.lastActive < ACTIVE_WINDOW);
    cb(list);
  }, () => cb([]));
}

export function subscribePlayers(cb) {
  if (!firebaseEnabled) { cb([]); return () => {}; }
  const node = ref(database, `${ROOT}/players`);
  return onValue(node, (snap) => {
    const data = snap.val() || {};
    const list = Object.entries(data).map(([key, v]) => ({ key, ...v }));
    cb(list);
  }, () => cb([]));
}
