/* =========================================================================
   אולפן הנפשה — הופך ציור לדמות מדברת (ליפסינק) + ייצוא וידאו + הוק ל-AI
   טכניקה: "בובה" — מציירים את הציור כרקע, ומעליו מנפישים את אזור הפה
   (פתיחה/סגירה) בסנכרון לקול (הקראת TTS או הקלטת קול אמיתי), עם נדנוד ראש
   ומצמוץ עיניים. ייצוא דרך canvas.captureStream + MediaRecorder.
   ========================================================================= */

'use strict';

const studio = {
    canvas: null,
    ctx: null,
    baseImage: null,        // תמונת הציור (רקע)
    mouth: null,            // {x,y,w,h}
    eyes: null,             // {x,y,w,h}
    marking: null,          // 'mouth' | 'eyes' | null
    dragStart: null,
    raf: null,
    openness: 0,            // 0..1 פתיחת פה (תאימות לאחור)
    targetOpen: 0,
    // צורת פה לפי הברה (visemes)
    shape: { open: 0.03, wide: 0.45, round: 0, teeth: 0, tongue: 0 },
    targetShape: { open: 0.03, wide: 0.45, round: 0, teeth: 0, tongue: 0 },
    blink: 0,               // 0..1
    nextBlink: 0,
    t0: 0,
    // אודיו
    audioCtx: null,
    analyser: null,
    mediaRecorder: null,
    recordedChunks: [],
    recordedBlob: null,
    // ייצוא
    videoRecorder: null,
    videoChunks: [],
};

function initStudio() {
    studio.canvas = document.getElementById('studio-canvas');
    if (!studio.canvas) return;
    studio.ctx = studio.canvas.getContext('2d');

    document.getElementById('studio-close').onclick = closeStudio;
    document.getElementById('studio-detect').onclick = () => autoDetectFace(true);
    document.getElementById('studio-mark-mouth').onclick = () => startMarking('mouth');
    document.getElementById('studio-mark-eyes').onclick = () => startMarking('eyes');
    document.getElementById('studio-play').onclick = playTalk;
    document.getElementById('studio-record-voice').onclick = toggleRecordVoice;
    document.getElementById('studio-export').onclick = exportVideo;
    document.getElementById('studio-ai').onclick = runAiMakeReal;

    bindStudioPointer();
    bindStudioSliders();
    populateVoices();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = populateVoices;
}

function bindStudioSliders() {
    const rate = document.getElementById('studio-rate');
    const pitch = document.getElementById('studio-pitch');
    rate.oninput = () => document.getElementById('studio-rate-value').textContent = rate.value;
    pitch.oninput = () => document.getElementById('studio-pitch-value').textContent = pitch.value;
}

function populateVoices() {
    const sel = document.getElementById('studio-voice');
    if (!sel || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    sel.innerHTML = '';
    voices.forEach((v, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.textContent = `${v.name} (${v.lang})`;
        if (v.lang && v.lang.toLowerCase().startsWith('he')) o.selected = true;
        sel.appendChild(o);
    });
}

function openStudio() {
    const main = document.getElementById('drawing-canvas');
    const img = new Image();
    img.onload = () => {
        studio.baseImage = img;
        // התאמת גודל אולפן ליחס הציור
        const maxW = 520, maxH = 520;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        studio.canvas.width = Math.round(img.width * scale);
        studio.canvas.height = Math.round(img.height * scale);
        // ברירת מחדל לפה: מרכז-תחתון של הציור
        studio.mouth = {
            x: studio.canvas.width * 0.35,
            y: studio.canvas.height * 0.6,
            w: studio.canvas.width * 0.3,
            h: studio.canvas.height * 0.12,
        };
        studio.eyes = null;
        document.getElementById('studio-overlay').classList.remove('hidden');
        startRenderLoop();
        // זיהוי אוטומטי בשקט; אם נכשל — נשארות ברירות המחדל
        const found = autoDetectFace(false);
        if (found) {
            setStudioStatus('✅ זוהו פה ועיניים אוטומטית. כתוב טקסט ולחץ ▶️ נגן');
        } else {
            setStudioStatus('סמן את הפה בגרירה, כתוב טקסט ולחץ ▶️ נגן');
        }
        document.getElementById('studio-instructions').textContent = 'אפשר לגרור לסימון מחדש, או ללחוץ "זהה פנים אוטומטית"';
    };
    img.src = main.toDataURL('image/png');
}

function closeStudio() {
    stopRenderLoop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.getElementById('studio-overlay').classList.add('hidden');
}

/* ----------------------------- סימון אזורים ----------------------------- */
function startMarking(what) {
    studio.marking = what;
    setStudioStatus(what === 'mouth' ? 'גרור על הפה של הדמות' : 'גרור על העיניים');
}

function bindStudioPointer() {
    const c = studio.canvas;
    const pos = (e) => {
        const r = c.getBoundingClientRect();
        const src = (e.touches && e.touches[0]) ? e.touches[0] : e;
        return { x: (src.clientX - r.left) * (c.width / r.width), y: (src.clientY - r.top) * (c.height / r.height) };
    };
    const down = (e) => { if (!studio.marking) return; e.preventDefault(); studio.dragStart = pos(e); };
    const move = (e) => {
        if (!studio.marking || !studio.dragStart) return;
        e.preventDefault();
        const p = pos(e);
        const rect = normRect(studio.dragStart, p);
        if (studio.marking === 'mouth') studio.mouth = rect; else studio.eyes = rect;
    };
    const up = () => {
        if (studio.marking && studio.dragStart) { studio.marking = null; studio.dragStart = null; setStudioStatus('סומן! אפשר לנגן ▶️'); }
    };
    c.addEventListener('mousedown', down);
    c.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    c.addEventListener('touchstart', down, { passive: false });
    c.addEventListener('touchmove', move, { passive: false });
    c.addEventListener('touchend', up);
}

function normRect(a, b) {
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
}

/* ----------------------------- זיהוי פנים היוריסטי -----------------------------
   מותאם לציורי ילדים: מזהה "כתמי דיו" (רכיבים קשירים) על רקע בהיר.
   כתמים בחלק העליון של הראש = עיניים; כתם רחב בחלק התחתון = פה.
   רץ אופליין לחלוטין, ללא מודל חיצוני. מחזיר true אם זוהה לפחות פה. */
function autoDetectFace(verbose) {
    if (!studio.baseImage) return false;
    const SCALE_W = 130;                       // רוחב מוקטן לעיבוד מהיר
    const ratio = studio.baseImage.height / studio.baseImage.width;
    const w = SCALE_W, h = Math.max(1, Math.round(SCALE_W * ratio));

    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.fillStyle = '#fff';
    octx.fillRect(0, 0, w, h);
    octx.drawImage(studio.baseImage, 0, 0, w, h);
    const data = octx.getImageData(0, 0, w, h).data;

    // מסכת דיו: פיקסל כהה/צבעוני (לא לבן)
    const ink = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
        const r = data[i*4], g = data[i*4+1], b = data[i*4+2];
        const lum = (r + g + b) / 3;
        if (lum < 200) ink[i] = 1;             // כל מה שאינו כמעט-לבן נחשב דיו
    }

    // רכיבים קשירים (BFS) — bbox, שטח, מרכז
    const labels = new Int32Array(w * h).fill(-1);
    const comps = [];
    const stack = [];
    for (let start = 0; start < w * h; start++) {
        if (!ink[start] || labels[start] !== -1) continue;
        const id = comps.length;
        let minX = w, minY = h, maxX = 0, maxY = 0, area = 0, sx = 0, sy = 0;
        stack.length = 0; stack.push(start); labels[start] = id;
        while (stack.length) {
            const p = stack.pop();
            const x = p % w, y = (p / w) | 0;
            area++; sx += x; sy += y;
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            const nbrs = [p-1, p+1, p-w, p+w];
            for (const n of nbrs) {
                if (n < 0 || n >= w * h) continue;
                if (Math.abs((n % w) - x) > 1) continue; // מנע גלישת שורה
                if (ink[n] && labels[n] === -1) { labels[n] = id; stack.push(n); }
            }
        }
        comps.push({ id, minX, minY, maxX, maxY, area, cx: sx/area, cy: sy/area,
                     bw: maxX-minX+1, bh: maxY-minY+1 });
    }
    if (comps.length === 0) return false;

    // אזור הראש = איחוד כל הדיו
    let hMinX = w, hMinY = h, hMaxX = 0, hMaxY = 0;
    for (const c of comps) {
        if (c.minX < hMinX) hMinX = c.minX; if (c.minY < hMinY) hMinY = c.minY;
        if (c.maxX > hMaxX) hMaxX = c.maxX; if (c.maxY > hMaxY) hMaxY = c.maxY;
    }
    const headW = hMaxX - hMinX + 1, headH = hMaxY - hMinY + 1;
    const headCx = (hMinX + hMaxX) / 2;
    const minArea = Math.max(2, (w * h) * 0.0008);

    // מועמדי תווי-פנים: רכיבים פנימיים (לא קו-המתאר הגדול ביותר), בגודל סביר
    const largest = comps.reduce((a, b) => b.area > a.area ? b : a, comps[0]);
    const feats = comps.filter(c =>
        c !== largest && c.area >= minArea &&
        c.bw < headW * 0.7 && c.bh < headH * 0.6);

    const sx = studio.canvas.width / w, sy = studio.canvas.height / h;
    const toRect = (c, padX, padY) => ({
        x: (c.minX - padX) * sx, y: (c.minY - padY) * sy,
        w: (c.bw + 2*padX) * sx, h: (c.bh + 2*padY) * sy,
    });

    // עיניים: מועמדים בחצי העליון של הראש, זוג סימטרי סביב מרכז הראש
    const upper = feats.filter(c => c.cy < hMinY + headH * 0.6);
    let eyesRect = null;
    if (upper.length >= 2) {
        upper.sort((a, b) => b.area - a.area);
        const top = upper.slice(0, 6);
        let best = null, bestScore = 1e9;
        for (let i = 0; i < top.length; i++) for (let j = i+1; j < top.length; j++) {
            const a = top[i], b = top[j];
            const ySim = Math.abs(a.cy - b.cy);
            const symmetry = Math.abs((a.cx - headCx) + (b.cx - headCx));
            const score = ySim * 2 + symmetry;
            if (Math.abs(a.cx - b.cx) > headW * 0.1 && score < bestScore) { bestScore = score; best = [a, b]; }
        }
        if (best) {
            const mnX = Math.min(best[0].minX, best[1].minX), mnY = Math.min(best[0].minY, best[1].minY);
            const mxX = Math.max(best[0].maxX, best[1].maxX), mxY = Math.max(best[0].maxY, best[1].maxY);
            eyesRect = { x: mnX*sx, y: mnY*sy, w: (mxX-mnX+1)*sx, h: (mxY-mnY+1)*sy };
        }
    }

    // פה: מועמד בחלק התחתון, הרחב ביותר
    const lower = feats.filter(c => c.cy > hMinY + headH * 0.5);
    let mouthRect = null;
    if (lower.length) {
        lower.sort((a, b) => b.bw - a.bw);
        mouthRect = toRect(lower[0], 1, Math.max(1, lower[0].bh * 0.3));
    }

    if (mouthRect) studio.mouth = mouthRect;
    if (eyesRect) studio.eyes = eyesRect;

    if (verbose) {
        const parts = [];
        parts.push(mouthRect ? 'פה ✓' : 'פה ✗');
        parts.push(eyesRect ? 'עיניים ✓' : 'עיניים ✗');
        setStudioStatus('זיהוי אוטומטי: ' + parts.join(' · ') + (mouthRect ? '' : ' — סמן פה ידנית'));
    }
    return !!mouthRect;
}

/* ----------------------------- לולאת רינדור ----------------------------- */
function startRenderLoop() {
    studio.t0 = performance.now();
    studio.nextBlink = 1500 + Math.random() * 2500;
    const loop = (now) => {
        renderFrame(now - studio.t0);
        studio.raf = requestAnimationFrame(loop);
    };
    studio.raf = requestAnimationFrame(loop);
}
function stopRenderLoop() { if (studio.raf) cancelAnimationFrame(studio.raf); studio.raf = null; }

function renderFrame(elapsed) {
    const ctx = studio.ctx, c = studio.canvas;
    if (!studio.baseImage) return;

    // החלקת צורת הפה לכיוון היעד (ליפסינק לפי הברות)
    const s = studio.shape, t = studio.targetShape;
    s.open   += (t.open   - s.open)   * 0.5;
    s.wide   += (t.wide   - s.wide)   * 0.5;
    s.round  += (t.round  - s.round)  * 0.4;
    s.teeth  += (t.teeth  - s.teeth)  * 0.5;
    s.tongue += (t.tongue - s.tongue) * 0.5;
    studio.openness = s.open;

    // מצמוץ
    if (elapsed > studio.nextBlink) { studio.blink = 1; if (elapsed > studio.nextBlink + 150) { studio.blink = 0; studio.nextBlink = elapsed + 1500 + Math.random() * 2500; } }

    ctx.clearRect(0, 0, c.width, c.height);

    // נדנוד ראש עדין
    const bob = Math.sin(elapsed / 600) * 3 + s.open * 2;
    const tilt = Math.sin(elapsed / 1300) * 0.02;

    ctx.save();
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(tilt);
    ctx.translate(-c.width / 2, -c.height / 2 + bob);
    ctx.drawImage(studio.baseImage, 0, 0, c.width, c.height);

    if (studio.mouth) drawMouth(ctx, studio.mouth, s);
    if (studio.eyes && studio.blink > 0) drawBlink(ctx, studio.eyes);
    ctx.restore();
}

/* ציור פה לפי צורת הברה: open=פתיחה אנכית, wide=רוחב, round=עיגול,
   teeth=שיניים גלויות, tongue=לשון */
function drawMouth(ctx, m, s) {
    const cx = m.x + m.w / 2;
    const cy = m.y + m.h / 2;

    // כיסוי הפה המקורי (תמיד ברוחב מלא כדי להסתיר אותו)
    ctx.save();
    ctx.fillStyle = 'rgba(255,233,223,0.92)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, (m.w / 2) * 1.12, (m.h / 2) * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    const wideFactor = (0.55 + s.wide * 0.6) * (1 - s.round * 0.5);
    const rx = Math.max(3, (m.w / 2) * wideFactor);
    const ry = Math.max(2, (m.h / 2) * (0.12 + s.open * 1.05));

    // חלל הפה
    ctx.fillStyle = '#7a1f1f';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // שיניים עליונות (F/V, חיוך רחב)
    if (s.teeth > 0.12 && ry > 4) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx, cy - ry * 0.55, rx * 0.92, ry * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // לשון
    if (s.open > 0.3 && s.tongue > 0.2) {
        ctx.fillStyle = '#e06666';
        ctx.beginPath();
        ctx.ellipse(cx, cy + ry * 0.35, rx * 0.55, ry * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // קו שפתיים עדין למסגור
    ctx.strokeStyle = 'rgba(150,70,70,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/* ----------------------------- מנוע הברות (Visemes) ----------------------------- */
const VISEMES = {
    SIL:  { open: 0.03, wide: 0.45, round: 0.0, teeth: 0, tongue: 0 },
    PP:   { open: 0.0,  wide: 0.45, round: 0.0, teeth: 0, tongue: 0 },   // מ/ב/פ סגורות
    AA:   { open: 0.95, wide: 0.70, round: 0.0, teeth: 0, tongue: 0.4 }, // א/ה/ע פתוחות
    EE:   { open: 0.45, wide: 1.00, round: 0.0, teeth: 0.4, tongue: 0 }, // י/ש/ס רחבות
    OO:   { open: 0.75, wide: 0.30, round: 1.0, teeth: 0, tongue: 0.2 }, // ו עגולה
    UU:   { open: 0.40, wide: 0.20, round: 1.0, teeth: 0, tongue: 0 },
    FF:   { open: 0.22, wide: 0.60, round: 0.0, teeth: 1, tongue: 0 },   // פ/ו(v) שיניים
    CONS: { open: 0.50, wide: 0.60, round: 0.1, teeth: 0, tongue: 0.1 },
};

function setVisemeShape(key) {
    const v = VISEMES[key] || VISEMES.CONS;
    studio.targetShape = { open: v.open, wide: v.wide, round: v.round, teeth: v.teeth, tongue: v.tongue };
}

function letterToViseme(ch) {
    if (/[\s.,!?;:'"`~()\-–—]/.test(ch)) return 'SIL';
    if (/[אהעחר]/.test(ch)) return 'AA';
    if (/[ו]/.test(ch)) return 'OO';
    if (/[ישסזצ]/.test(ch)) return 'EE';
    if (/[מםב]/.test(ch)) return 'PP';
    if (/[פף]/.test(ch)) return 'FF';
    if (/[לנןגכךדטתצץק ]/.test(ch)) return 'CONS';
    const c = ch.toLowerCase();
    if ('a'.includes(c)) return 'AA';
    if ('ei'.includes(c)) return 'EE';
    if ('o'.includes(c)) return 'OO';
    if ('u'.includes(c)) return 'UU';
    if ('mbp'.includes(c)) return 'PP';
    if ('fv'.includes(c)) return 'FF';
    if (/[a-z]/.test(c)) return 'CONS';
    return 'CONS';
}

function textToVisemes(text) {
    return Array.from(text).map(letterToViseme);
}

let visArr = [], visIndex = 0, visTimer = null;
function startVisemeSpeak(text, rate) {
    visArr = textToVisemes(text);
    visIndex = 0;
    const stepMs = Math.max(55, 80 / (rate || 1));
    stopVisemeSpeak();
    visTimer = setInterval(() => {
        if (visIndex >= visArr.length) { setVisemeShape('SIL'); return; }
        setVisemeShape(visArr[visIndex]);
        visIndex++;
    }, stepMs);
}
function stopVisemeSpeak() {
    if (visTimer) clearInterval(visTimer);
    visTimer = null;
    setVisemeShape('SIL');
}
function resyncVisemes(charIndex) {
    if (typeof charIndex === 'number' && charIndex >= 0) visIndex = Math.min(visArr.length - 1, charIndex);
}

function drawBlink(ctx, e) {
    ctx.save();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = Math.max(2, e.h * 0.15);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.x, e.y + e.h / 2);
    ctx.lineTo(e.x + e.w, e.y + e.h / 2);
    ctx.stroke();
    ctx.restore();
}

/* ----------------------------- דיבור (TTS) + ליפסינק ----------------------------- */
function playTalk() {
    if (studio.recordedBlob) { playRecorded(); return; }
    if (!('speechSynthesis' in window)) { setStudioStatus('אין תמיכה בהקראה בדפדפן זה'); return; }
    const text = document.getElementById('studio-text').value.trim();
    if (!text) { setStudioStatus('כתוב טקסט לדיבוב'); return; }

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const sel = document.getElementById('studio-voice');
    const voices = window.speechSynthesis.getVoices();
    if (voices[sel.value]) u.voice = voices[sel.value];
    u.lang = (u.voice && u.voice.lang) || 'he-IL';
    u.rate = Number(document.getElementById('studio-rate').value);
    u.pitch = Number(document.getElementById('studio-pitch').value);

    u.onstart = () => { setStudioStatus('🗣️ מדבר...'); startVisemeSpeak(text, u.rate); };
    u.onboundary = (e) => resyncVisemes(e.charIndex);
    u.onend = () => { stopVisemeSpeak(); setStudioStatus('סיום'); };
    window.speechSynthesis.speak(u);
}

/* ----------------------------- הקלטת קול אמיתי ----------------------------- */
async function toggleRecordVoice() {
    const btn = document.getElementById('studio-record-voice');
    if (studio.mediaRecorder && studio.mediaRecorder.state === 'recording') {
        studio.mediaRecorder.stop();
        btn.textContent = '🎤 הקלט קול';
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        studio.recordedChunks = [];
        studio.mediaRecorder = new MediaRecorder(stream);
        studio.mediaRecorder.ondataavailable = (e) => { if (e.data.size) studio.recordedChunks.push(e.data); };
        studio.mediaRecorder.onstop = () => {
            studio.recordedBlob = new Blob(studio.recordedChunks, { type: 'audio/webm' });
            stream.getTracks().forEach(t => t.stop());
            setStudioStatus('הוקלט קול! לחץ ▶️ נגן או 🎥 ייצא');
        };
        studio.mediaRecorder.start();
        btn.textContent = '⏹️ עצור הקלטה';
        setStudioStatus('🔴 מקליט... דבר עכשיו');
    } catch (err) {
        setStudioStatus('לא ניתן לגשת למיקרופון: ' + err.message);
    }
}

async function playRecorded() {
    try {
        ensureAudioCtx();
        const arrayBuf = await studio.recordedBlob.arrayBuffer();
        const audioBuf = await studio.audioCtx.decodeAudioData(arrayBuf);
        const src = studio.audioCtx.createBufferSource();
        src.buffer = audioBuf;
        src.connect(studio.analyser);
        studio.analyser.connect(studio.audioCtx.destination);
        startAmplitudeLipSync();
        src.onended = () => { stopAmplitudeLipSync(); setStudioStatus('סיום'); };
        src.start();
        setStudioStatus('🗣️ מנגן הקלטה...');
    } catch (err) {
        setStudioStatus('שגיאה בנגינה: ' + err.message);
    }
}

function ensureAudioCtx() {
    if (!studio.audioCtx) {
        studio.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        studio.analyser = studio.audioCtx.createAnalyser();
        studio.analyser.fftSize = 512;
    }
    if (studio.audioCtx.state === 'suspended') studio.audioCtx.resume();
}

let ampRaf = null;
function startAmplitudeLipSync() {
    const buf = new Uint8Array(studio.analyser.frequencyBinCount);
    const tick = () => {
        studio.analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        const open = Math.min(1, rms * 4);
        // עוצמה גבוהה → פה פתוח ורחב; נמוכה → כמעט סגור
        studio.targetShape = { open, wide: 0.4 + open * 0.4, round: 0, teeth: 0, tongue: open > 0.5 ? 0.4 : 0 };
        ampRaf = requestAnimationFrame(tick);
    };
    ampRaf = requestAnimationFrame(tick);
}
function stopAmplitudeLipSync() { if (ampRaf) cancelAnimationFrame(ampRaf); ampRaf = null; setVisemeShape('SIL'); }

/* ----------------------------- ייצוא וידאו ----------------------------- */
async function exportVideo() {
    if (!studio.canvas.captureStream) { setStudioStatus('הדפדפן לא תומך בייצוא וידאו'); return; }
    const videoStream = studio.canvas.captureStream(30);
    let tracks = [...videoStream.getVideoTracks()];
    let audioSource = null;

    // אם יש הקלטת קול — נשלב אותה בקובץ
    if (studio.recordedBlob) {
        try {
            ensureAudioCtx();
            const arrayBuf = await studio.recordedBlob.arrayBuffer();
            const audioBuf = await studio.audioCtx.decodeAudioData(arrayBuf.slice(0));
            const dest = studio.audioCtx.createMediaStreamDestination();
            audioSource = studio.audioCtx.createBufferSource();
            audioSource.buffer = audioBuf;
            audioSource.connect(studio.analyser);
            studio.analyser.connect(dest);
            studio.analyser.connect(studio.audioCtx.destination);
            tracks = tracks.concat(dest.stream.getAudioTracks());
        } catch (err) { /* נמשיך בלי אודיו */ }
    }

    const mixed = new MediaStream(tracks);
    studio.videoChunks = [];
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    studio.videoRecorder = new MediaRecorder(mixed, { mimeType: mime });
    studio.videoRecorder.ondataavailable = (e) => { if (e.data.size) studio.videoChunks.push(e.data); };
    studio.videoRecorder.onstop = () => {
        const blob = new Blob(studio.videoChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `דמות-מדברת-${Date.now()}.webm`; a.click();
        setStudioStatus('✅ הווידאו ירד! (פורמט webm)');
    };

    studio.videoRecorder.start();
    setStudioStatus('🎥 מקליט וידאו...');

    if (audioSource) {
        startAmplitudeLipSync();
        audioSource.onended = () => { stopAmplitudeLipSync(); studio.videoRecorder.stop(); };
        audioSource.start();
    } else {
        // ללא הקלטה — נדבר ב-TTS ונקליט וידאו (ללא קול בקובץ, מגבלת דפדפן)
        const text = document.getElementById('studio-text').value.trim() || 'שלום';
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'he-IL';
        u.rate = Number(document.getElementById('studio-rate').value);
        u.pitch = Number(document.getElementById('studio-pitch').value);
        const voices = window.speechSynthesis.getVoices();
        const sel = document.getElementById('studio-voice');
        if (voices[sel.value]) u.voice = voices[sel.value];
        u.onstart = () => startVisemeSpeak(text, u.rate);
        u.onboundary = (e) => resyncVisemes(e.charIndex);
        u.onend = () => { stopVisemeSpeak(); studio.videoRecorder.stop(); };
        setStudioStatus('🎥 מקליט (לקול בקובץ — הקלט קול אמיתי)');
        window.speechSynthesis.speak(u);
        // גיבוי: עצירה אוטומטית אחרי זמן משוער
        setTimeout(() => { if (studio.videoRecorder.state === 'recording') studio.videoRecorder.stop(); }, Math.max(4000, text.length * 120));
    }
}

/* ----------------------------- הוק ל-AI דרך שרת-התיווך -----------------------------
   הקריאה עוברת לשרת המקומי (server.js) ששומר את המפתח בצד-שרת.
   מנסה קודם אותו origin, ואז localhost:3000. אם אין שרת — מסביר למשתמש. */
const AI_BASES = ['', 'http://localhost:3000'];

async function findAiServer() {
    for (const base of AI_BASES) {
        try {
            const r = await fetch(base + '/api/status', { method: 'GET' });
            if (r.ok) { const j = await r.json(); return { base, configured: j.configured }; }
        } catch (e) { /* ננסה את הבא */ }
    }
    return null;
}

async function runAiMakeReal() {
    setStudioStatus('✨ מתחבר לשרת ה-AI...');
    const srv = await findAiServer();
    if (!srv) {
        setStudioStatus('לא נמצא שרת AI. הרץ: npm install ואז npm start, ופתח את המשחק דרך http://localhost:3000');
        return;
    }
    if (!srv.configured) {
        setStudioStatus('השרת רץ אך חסר מפתח. צור קובץ .env עם OPENAI_API_KEY והפעל מחדש.');
        return;
    }
    setStudioStatus('✨ יוצר גרסה מציאותית... זה עשוי לקחת 10-30 שניות');
    try {
        const image = studio.canvas.toDataURL('image/png');
        const resp = await fetch(srv.base + '/api/make-real', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image }),
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.message || json.error || ('HTTP ' + resp.status));
        const img = new Image();
        img.onload = () => {
            studio.baseImage = img;
            autoDetectFace(false);
            setStudioStatus('✅ הציור הפך למציאות! עכשיו אפשר להנפיש ולדבב');
        };
        img.src = json.image;
    } catch (err) {
        setStudioStatus('שגיאת AI: ' + err.message);
    }
}

/* ----------------------------- עזר ----------------------------- */
function setStudioStatus(msg) {
    const el = document.getElementById('studio-status');
    if (el) el.textContent = msg;
}
