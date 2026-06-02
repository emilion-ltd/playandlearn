// מנוע צליל פשוט מבוסס Web Audio API - מנגן תווים ללא קבצי שמע.
let ctx = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

// יש לקרוא בעקבות אינטראקציית משתמש כדי "להעיר" את האודיו בדפדפנים
export function resumeAudio() {
  const ac = getCtx();
  if (ac && ac.state === 'suspended') ac.resume();
}

// נגינת תדר בודד עם מעטפת דמוית-פסנתר (שני אוסילטורים לצליל עשיר יותר)
export function playFrequency(freq, duration = 0.7) {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume();

  const now = ac.currentTime;
  const master = ac.createGain();
  master.connect(ac.destination);

  // מעטפת ADSR מקורבת
  const peak = 0.32;
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  master.gain.exponentialRampToValueAtTime(peak * 0.5, now + 0.12);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // צליל בסיס + אוקטבה עליונה חלשה לגוון חם
  const partials = [
    { type: 'triangle', mult: 1, gain: 1 },
    { type: 'sine', mult: 2, gain: 0.25 },
  ];

  const oscs = partials.map((p) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = p.type;
    osc.frequency.value = freq * p.mult;
    g.gain.value = p.gain;
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.05);
    return osc;
  });

  return oscs;
}

// נגינת רצף תווים (לתצוגת הדגמה של שיר). notes = [{freq, dur}]
export function playSequence(notes, onStep) {
  const ac = getCtx();
  if (!ac) return () => {};
  if (ac.state === 'suspended') ac.resume();

  let cancelled = false;
  const timers = [];
  let t = 0;
  notes.forEach((n, i) => {
    const timer = setTimeout(() => {
      if (cancelled) return;
      playFrequency(n.freq, n.dur * 0.95);
      onStep?.(i);
    }, t * 1000);
    timers.push(timer);
    t += n.dur;
  });

  // ביטול
  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
