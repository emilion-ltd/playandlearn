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
    mouth: null,            // {x,y,w,h} — פה דמות 1
    eyes: null,             // {x,y,w,h} — עיניים דמות 1
    mouth2: null,           // {x,y,w,h} — פה דמות 2 (שיחה)
    eyes2: null,            // {x,y,w,h} — עיניים דמות 2
    activeWho: 1,           // איזו דמות מדברת כרגע (1/2)
    dialog: [],             // [{ who:1|2, text }] — תסריט שיחה
    marking: null,          // 'mouth' | 'eyes' | 'mouth2' | 'eyes2' | null
    editMode: true,         // הצגת ידיות כיוונון + גרירה/שינוי-גודל
    drag: null,             // { region, mode, startX, startY, orig }
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
    // סצנות / פריימים
    scenes: [],             // [{ src, text, mouth, eyes, rate, pitch, voiceIndex }]
    sceneIndex: -1,
    activeSrc: null,        // dataURL של הציור הפעיל
    lastVideoBlob: null,    // הווידאו האחרון שיוצא (לשיתוף)
    lastVideoExt: 'webm',
    exporting: false,
    // קולות פרימיום (ElevenLabs)
    elKey: '',
    elVoice: '',
    elCache: {},            // טקסט -> AudioBuffer (לחיסכון בקריאות חוזרות בייצוא)
    // קולות פרימיום (OpenAI)
    oaKey: '',
    oaVoice: 'nova',
};

const EL_KEY_LS = 'studio-el-key';
const EL_VOICE_LS = 'studio-el-voice';
// eleven_v3 הוא המודל היחיד של ElevenLabs שתומך בעברית (וגם הכי אקספרסיבי).
// multilingual_v2 / flash / turbo *לא* תומכים עברית — ומחזירים ג'יבריש.
const EL_MODEL = 'eleven_v3';
const OA_KEY_LS = 'studio-oa-key';
const OA_VOICE_LS = 'studio-oa-voice';
const OA_MODEL = 'gpt-4o-mini-tts';
const OA_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];

// עזר עמיד: מקשר handler לאלמנט רק אם הוא קיים — כך כפתור חסר לא שובר את כל האתחול
function on(id, evt, fn) {
    const el = document.getElementById(id);
    if (el) el[evt] = fn;
    return el;
}

function initStudio() {
    studio.canvas = document.getElementById('studio-canvas');
    if (!studio.canvas) return;
    studio.ctx = studio.canvas.getContext('2d');

    on('studio-close', 'onclick', closeStudio);
    on('studio-detect', 'onclick', () => autoDetectFace(true));
    on('studio-mark-mouth', 'onclick', () => startMarking('mouth'));
    on('studio-mark-eyes', 'onclick', () => startMarking('eyes'));
    on('studio-adjust', 'onclick', toggleEditMode);
    on('studio-play', 'onclick', playTalk);
    on('studio-record-voice', 'onclick', toggleRecordVoice);
    on('studio-export', 'onclick', exportVideo);
    on('studio-ai', 'onclick', runAiMakeReal);

    // סצנות / פריימים
    on('studio-add-current', 'onclick', addCurrentDrawingScene);
    on('studio-add-gallery', 'onclick', toggleGalleryPicker);
    on('studio-add-file', 'onclick', () => document.getElementById('studio-file-input').click());
    on('studio-file-input', 'onchange', onStudioFilePicked);
    on('studio-export-all', 'onclick', exportAllScenes);
    on('studio-share-shot', 'onclick', shareSnapshot);

    // נגן תצוגה מקדימה של הסרטון בתוך האתר
    on('studio-preview-replay', 'onclick', () => { const v = document.getElementById('studio-preview-video'); if (v) { v.currentTime = 0; v.play().catch(() => {}); } });
    on('studio-preview-download', 'onclick', saveVideo);
    on('studio-preview-share', 'onclick', shareVideo);

    // הכתבה קולית (דיבור → טקסט)
    const micBtn = document.getElementById('studio-mic');
    const dlgMic = document.getElementById('dlg-mic');
    if (!supportsDictation()) {
        if (micBtn) micBtn.classList.add('hidden');
        if (dlgMic) dlgMic.classList.add('hidden');
    } else {
        if (micBtn) micBtn.onclick = () => toggleDictation('studio-text', micBtn);
        if (dlgMic) dlgMic.onclick = () => toggleDictation('dlg-text', dlgMic);
    }

    // שיחה בין שתי דמויות
    on('dlg-toggle', 'onclick', toggleDialog);
    on('dlg-mark-1', 'onclick', () => startMarking('mouth'));
    on('dlg-mark-2', 'onclick', () => startMarking('mouth2'));
    on('dlg-add-1', 'onclick', () => addDialogLine(1));
    on('dlg-add-2', 'onclick', () => addDialogLine(2));
    on('dlg-play', 'onclick', playDialog);
    on('dlg-export', 'onclick', exportDialog);

    // קולות פרימיום + הגדרות מתקדמות
    on('studio-adv-toggle', 'onclick', toggleAdvanced);
    on('el-save', 'onclick', saveElevenConfig);
    on('el-test', 'onclick', testElevenVoice);
    on('el-clear', 'onclick', clearElevenConfig);
    loadElevenConfig();

    // קול OpenAI
    populateOpenAiVoices();
    on('oa-save', 'onclick', saveOpenAiConfig);
    on('oa-test', 'onclick', testOpenAiVoice);
    on('oa-clear', 'onclick', clearOpenAiConfig);
    loadOpenAiConfig();

    // בחירת קול מהירה (חינם): גבר / אישה / ילד
    on('voice-male', 'onclick', () => applyVoicePreset('male'));
    on('voice-female', 'onclick', () => applyVoicePreset('female'));
    on('voice-child', 'onclick', () => applyVoicePreset('child'));

    bindStudioPointer();
    bindStudioSliders();
    populateVoices();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = populateVoices;
}

function bindStudioSliders() {
    const rate = document.getElementById('studio-rate');
    const pitch = document.getElementById('studio-pitch');
    if (rate) rate.oninput = () => { const l = document.getElementById('studio-rate-value'); if (l) l.textContent = rate.value; };
    if (pitch) pitch.oninput = () => { const l = document.getElementById('studio-pitch-value'); if (l) l.textContent = pitch.value; };
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
    const src = main.toDataURL('image/png');
    document.getElementById('studio-overlay').classList.remove('hidden');
    // אם זו פתיחה ראשונה / אין סצנות — הציור הנוכחי הופך לסצנה הראשונה
    if (studio.scenes.length === 0) {
        studio.scenes = [makeScene(src)];
        studio.sceneIndex = 0;
        loadSceneIntoStudio(0, true);
    } else {
        loadSceneIntoStudio(studio.sceneIndex < 0 ? 0 : studio.sceneIndex, false);
    }
    renderScenesStrip();
}

function makeScene(src, text) {
    return {
        src,
        text: text || 'שלום! אני הדמות שציירתם.',
        mouth: null,
        eyes: null,
        rate: 1,
        pitch: 1.2,
        voiceIndex: null,
    };
}

// טוען תמונה ל-baseImage ומתאים את גודל הקנבס; מחזיר Promise
function loadStudioImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            studio.baseImage = img;
            studio.activeSrc = src;
            const maxW = 520, maxH = 520;
            const scale = Math.min(maxW / img.width, maxH / img.height, 1);
            studio.canvas.width = Math.round(img.width * scale);
            studio.canvas.height = Math.round(img.height * scale);
            resolve(img);
        };
        img.src = src;
    });
}

// טוען סצנה למצב העריכה הפעיל
async function loadSceneIntoStudio(i, autodetect) {
    const scene = studio.scenes[i];
    if (!scene) return;
    studio.sceneIndex = i;
    await loadStudioImage(scene.src);
    // פה/עיניים: אם נשמרו — נשתמש בהם, אחרת זיהוי אוטומטי
    studio.mouth2 = scene.mouth2 || null;
    studio.eyes2 = scene.eyes2 || null;
    studio.activeWho = 1;
    if (scene.mouth) {
        studio.mouth = scene.mouth;
        studio.eyes = scene.eyes || null;
    } else {
        studio.mouth = { x: studio.canvas.width * 0.35, y: studio.canvas.height * 0.6, w: studio.canvas.width * 0.3, h: studio.canvas.height * 0.12 };
        studio.eyes = { x: studio.canvas.width * 0.3, y: studio.canvas.height * 0.32, w: studio.canvas.width * 0.4, h: studio.canvas.height * 0.12 };
        if (autodetect !== false) autoDetectFace(false);
    }
    // ערכי הטקסט/קול
    document.getElementById('studio-text').value = scene.text || '';
    const rate = document.getElementById('studio-rate');
    const pitch = document.getElementById('studio-pitch');
    if (scene.rate) { rate.value = scene.rate; document.getElementById('studio-rate-value').textContent = scene.rate; }
    if (scene.pitch) { pitch.value = scene.pitch; document.getElementById('studio-pitch-value').textContent = scene.pitch; }
    if (scene.voiceIndex != null) { const v = document.getElementById('studio-voice'); if (v) v.value = scene.voiceIndex; }
    if (!studio.raf) startRenderLoop();
    setStudioStatus(`סצנה ${i + 1}/${studio.scenes.length} — כתוב טקסט ולחץ ▶️ נגן`);
    renderScenesStrip();
}

// שומר את מצב העריכה הנוכחי לתוך הסצנה הפעילה
function saveActiveToScene() {
    const s = studio.scenes[studio.sceneIndex];
    if (!s) return;
    s.src = studio.activeSrc || s.src;
    s.text = document.getElementById('studio-text').value;
    s.mouth = studio.mouth;
    s.eyes = studio.eyes;
    s.mouth2 = studio.mouth2;
    s.eyes2 = studio.eyes2;
    s.rate = Number(document.getElementById('studio-rate').value);
    s.pitch = Number(document.getElementById('studio-pitch').value);
    s.voiceIndex = document.getElementById('studio-voice').value;
}

async function addSceneFromSrc(src) {
    saveActiveToScene();
    studio.scenes.push(makeScene(src));
    await loadSceneIntoStudio(studio.scenes.length - 1, true);
}

function addCurrentDrawingScene() {
    const main = document.getElementById('drawing-canvas');
    addSceneFromSrc(main.toDataURL('image/png'));
    setStudioStatus('✅ הציור הנוכחי נוסף כסצנה חדשה');
}

function onStudioFilePicked(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { addSceneFromSrc(reader.result); setStudioStatus('✅ התמונה נוספה כסצנה'); };
    reader.readAsDataURL(file);
    e.target.value = '';
}

function deleteScene(i) {
    if (studio.scenes.length <= 1) { setStudioStatus('צריך לפחות סצנה אחת'); return; }
    studio.scenes.splice(i, 1);
    if (studio.sceneIndex >= studio.scenes.length) studio.sceneIndex = studio.scenes.length - 1;
    loadSceneIntoStudio(studio.sceneIndex, false);
    renderScenesStrip();
}

// בחירת ציור מהגלריה של השחקן
function toggleGalleryPicker() {
    const strip = document.getElementById('studio-scenes');
    let picker = document.getElementById('studio-gallery-picker');
    if (picker) { picker.remove(); return; }
    picker = document.createElement('div');
    picker.id = 'studio-gallery-picker';
    picker.className = 'studio-gallery-picker';
    let drawings = [];
    try { drawings = (state.players[state.currentPlayer] || {}).savedDrawings || []; } catch (e) { /* ignore */ }
    if (!drawings.length) {
        picker.innerHTML = '<div class="studio-text">אין ציורים שמורים. שמרו ציור (💾) או העלו תמונה.</div>';
    } else {
        drawings.slice().reverse().forEach((src) => {
            const im = document.createElement('img');
            im.src = src; im.className = 'studio-pick-thumb';
            im.onclick = () => { addSceneFromSrc(src); picker.remove(); };
            picker.appendChild(im);
        });
    }
    strip.parentNode.insertBefore(picker, strip.nextSibling);
}

function renderScenesStrip() {
    const strip = document.getElementById('studio-scenes');
    if (!strip) return;
    strip.innerHTML = '';
    studio.scenes.forEach((scene, i) => {
        const cell = document.createElement('div');
        cell.className = 'studio-scene-cell' + (i === studio.sceneIndex ? ' active' : '');
        const im = document.createElement('img');
        im.src = scene.src;
        im.onclick = () => { saveActiveToScene(); loadSceneIntoStudio(i, false); };
        const num = document.createElement('span');
        num.className = 'scene-num';
        num.textContent = i + 1;
        const del = document.createElement('button');
        del.className = 'scene-del';
        del.textContent = '✕';
        del.title = 'מחק סצנה';
        del.onclick = (ev) => { ev.stopPropagation(); deleteScene(i); };
        cell.appendChild(im);
        cell.appendChild(num);
        cell.appendChild(del);
        strip.appendChild(cell);
    });
}

function closeStudio() {
    stopRenderLoop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.getElementById('studio-overlay').classList.add('hidden');
}

/* ----------------------------- סימון אזורים ----------------------------- */
function startMarking(what) {
    studio.marking = what;
    studio.editMode = true;
    setStudioStatus(what === 'mouth' ? 'גררו על הפה של הדמות' : 'גררו על העיניים');
}

function toggleEditMode() {
    studio.editMode = !studio.editMode;
    setStudioStatus(studio.editMode ? '✋ גררו את הריבועים להזזה, את הפינות לשינוי גודל' : 'הכיוונון הוסתר');
}

// גודל ידית האחיזה בפינה (בקואורדינטות הקנבס)
function handleSize() { return Math.max(12, studio.canvas.width * 0.05); }

const REGION_NAMES = ['mouth', 'mouth2', 'eyes', 'eyes2'];
function regionRect(name) {
    return name === 'mouth' ? studio.mouth : name === 'mouth2' ? studio.mouth2
        : name === 'eyes' ? studio.eyes : studio.eyes2;
}
function setRegion(name, r) {
    if (name === 'mouth') studio.mouth = r;
    else if (name === 'mouth2') studio.mouth2 = r;
    else if (name === 'eyes') studio.eyes = r;
    else studio.eyes2 = r;
}

// בדיקה על איזה אזור/ידית לחצו
function hitTest(p) {
    const hs = handleSize();
    // קודם ידיות פינה (כל האזורים)
    for (const name of REGION_NAMES) {
        const r = regionRect(name);
        if (!r) continue;
        const corners = {
            nw: { x: r.x, y: r.y }, ne: { x: r.x + r.w, y: r.y },
            sw: { x: r.x, y: r.y + r.h }, se: { x: r.x + r.w, y: r.y + r.h },
        };
        for (const mode in corners) {
            const cpt = corners[mode];
            if (Math.abs(p.x - cpt.x) <= hs && Math.abs(p.y - cpt.y) <= hs) return { region: name, mode };
        }
    }
    // גוף הריבוע = הזזה
    for (const name of REGION_NAMES) {
        const r = regionRect(name);
        if (!r) continue;
        if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return { region: name, mode: 'move' };
    }
    return null;
}

function bindStudioPointer() {
    const c = studio.canvas;
    const pos = (e) => {
        const r = c.getBoundingClientRect();
        const src = (e.touches && e.touches[0]) ? e.touches[0] : e;
        return { x: (src.clientX - r.left) * (c.width / r.width), y: (src.clientY - r.top) * (c.height / r.height) };
    };
    const down = (e) => {
        const p = pos(e);
        // מצב ציור ריבוע חדש (פה/עיניים)
        if (studio.marking) { e.preventDefault(); studio.dragStart = p; return; }
        // מצב כיוונון: הזזה/שינוי-גודל של ריבוע קיים
        if (studio.editMode) {
            const hit = hitTest(p);
            if (hit) {
                e.preventDefault();
                const orig = regionRect(hit.region);
                studio.drag = { region: hit.region, mode: hit.mode, startX: p.x, startY: p.y, orig: { ...orig } };
            }
        }
    };
    const move = (e) => {
        const p = pos(e);
        if (studio.marking && studio.dragStart) {
            e.preventDefault();
            const rect = normRect(studio.dragStart, p);
            if (studio.marking === 'mouth') studio.mouth = rect; else studio.eyes = rect;
            return;
        }
        if (studio.drag) {
            e.preventDefault();
            applyDrag(p);
        }
    };
    const up = () => {
        if (studio.marking && studio.dragStart) {
            studio.marking = null; studio.dragStart = null;
            setStudioStatus('✅ סומן! אפשר לגרור לכיוונון או לנגן ▶️');
        }
        if (studio.drag) { studio.drag = null; saveActiveToScene(); }
    };
    c.addEventListener('mousedown', down);
    c.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    c.addEventListener('touchstart', down, { passive: false });
    c.addEventListener('touchmove', move, { passive: false });
    c.addEventListener('touchend', up);
}

function applyDrag(p) {
    const d = studio.drag;
    const o = d.orig;
    const dx = p.x - d.startX, dy = p.y - d.startY;
    const MIN = 8;
    let r = { ...o };
    if (d.mode === 'move') {
        r.x = o.x + dx; r.y = o.y + dy;
    } else {
        let left = o.x, top = o.y, right = o.x + o.w, bottom = o.y + o.h;
        if (d.mode === 'nw') { left = o.x + dx; top = o.y + dy; }
        if (d.mode === 'ne') { right = o.x + o.w + dx; top = o.y + dy; }
        if (d.mode === 'sw') { left = o.x + dx; bottom = o.y + o.h + dy; }
        if (d.mode === 'se') { right = o.x + o.w + dx; bottom = o.y + o.h + dy; }
        r.x = Math.min(left, right); r.y = Math.min(top, bottom);
        r.w = Math.max(MIN, Math.abs(right - left)); r.h = Math.max(MIN, Math.abs(bottom - top));
    }
    setRegion(d.region, r);
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

    // בזמן כיוונון מבטלים נדנוד כדי שהריבועים יתאימו למיקום הציור
    const editing = studio.editMode && !studio.exporting;
    const bob = editing ? 0 : Math.sin(elapsed / 600) * 3 + s.open * 2;
    const tilt = editing ? 0 : Math.sin(elapsed / 1300) * 0.02;

    ctx.save();
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(tilt);
    ctx.translate(-c.width / 2, -c.height / 2 + bob);
    ctx.drawImage(studio.baseImage, 0, 0, c.width, c.height);

    // צורת פה סגורה לדמות שאינה מדברת כרגע
    const SIL_SHAPE = { open: 0.03, wide: 0.45, round: 0, teeth: 0, tongue: 0 };
    const hasTwo = !!studio.mouth2;
    if (studio.mouth) drawMouth(ctx, studio.mouth, (!hasTwo || studio.activeWho === 1) ? s : SIL_SHAPE);
    if (studio.mouth2) drawMouth(ctx, studio.mouth2, studio.activeWho === 2 ? s : SIL_SHAPE);
    if (studio.eyes && studio.blink > 0) drawBlink(ctx, studio.eyes);
    if (studio.eyes2 && studio.blink > 0) drawBlink(ctx, studio.eyes2);
    if (editing) drawEditHandles(ctx);
    ctx.restore();
}

// ציור ריבועי כיוונון עם ידיות פינה (רק במצב עריכה, לא בייצוא)
function drawEditHandles(ctx) {
    const hs = handleSize();
    const draw = (r, color, label) => {
        if (!r) return;
        ctx.save();
        ctx.lineWidth = Math.max(2, studio.canvas.width * 0.006);
        ctx.strokeStyle = color;
        ctx.setLineDash([8, 5]);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].forEach(([hx, hy]) => {
            ctx.beginPath();
            ctx.arc(hx, hy, hs * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = `bold ${Math.max(11, hs)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(label, r.x + r.w / 2, r.y - hs * 0.4);
        ctx.restore();
    };
    draw(studio.mouth, 'rgba(255,70,70,0.95)', studio.mouth2 ? '👄1' : '👄');
    draw(studio.mouth2, 'rgba(255,150,40,0.95)', '👄2');
    draw(studio.eyes, 'rgba(70,140,255,0.95)', studio.eyes2 ? '👀1' : '👀');
    draw(studio.eyes2, 'rgba(40,200,200,0.95)', '👀2');
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
    const text = document.getElementById('studio-text').value.trim();
    if (!text) { setStudioStatus('כתבו משפט לדמות 🙂'); return; }
    if (premiumProvider()) { playWithPremium(text); return; }
    if (studio.recordedBlob) { playRecorded(); return; }
    if (!('speechSynthesis' in window)) { setStudioStatus('אין תמיכה בהקראה בדפדפן זה'); return; }

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

/* ----------------------------- ייצוא וידאו (סצנה בודדת) ----------------------------- */
function exportVideo() {
    saveActiveToScene();
    const scene = studio.scenes[studio.sceneIndex];
    if (!scene) { setStudioStatus('אין סצנה לייצוא'); return; }
    return exportScenes([scene]);
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

/* ----------------------------- ייצוא סרטון מלא (כל הסצנות) ----------------------------- */
function exportAllScenes() {
    saveActiveToScene();
    return exportScenes(studio.scenes);
}

/* ייצוא ראשי: יוצר אודיו נפרד (WAV/PCM), מקליט וידאו בשקט, וממזג ל-MP4 (AAC)
   כך שהקול מתנגן בכל נגן. אם המיזוג נכשל — נופלים לשיטת ההקלטה הישנה. */
async function exportScenes(list) {
    if (studio.exporting) return;
    if (!studio.canvas.captureStream) { setStudioStatus('הדפדפן לא תומך בייצוא וידאו'); return; }
    if (!list || list.length === 0) { setStudioStatus('אין סצנות לייצוא'); return; }
    studio.exporting = true;
    studio.editMode = false;
    try {
        await exportViaMux(list);
        studio.exporting = false;
    } catch (err) {
        studio.exporting = false;
        setStudioStatus('עובר לשיטת גיבוי... ' + (err.message || ''));
        await exportScenesCapture(list);
    }
    loadSceneIntoStudio(studio.sceneIndex, false);
}

const EXPORT_LEAD = 0.45, EXPORT_TRAIL = 0.35, EXPORT_GAP = 0.8;

async function exportViaMux(list) {
    ensureAudioCtx();
    const sr = studio.audioCtx.sampleRate;
    const mode = premiumProvider() ? 'premium' : (studio.recordedBlob ? 'rec' : 'synth');

    // 1) הכנת אודיו (AudioBuffer) לכל סצנה
    const segs = [];
    for (let i = 0; i < list.length; i++) {
        setStudioStatus(`🎙️ מכין קול ${i + 1}/${list.length}...`);
        segs.push(await getSceneAudioBuffer(list[i], mode, sr));
    }

    // 2) הקלטת וידאו בלבד (בלי רעשים) + ליפסינק שקט דרך gain=0
    try { studio.analyser.disconnect(); } catch (e) { /* ignore */ }
    const muteGain = studio.audioCtx.createGain();
    muteGain.gain.value = 0;
    studio.analyser.connect(muteGain);
    muteGain.connect(studio.audioCtx.destination);

    const mime = pickVideoOnlyMime();
    const videoStream = studio.canvas.captureStream(30);
    studio.videoChunks = [];
    const recorder = new MediaRecorder(videoStream, { mimeType: mime });
    recorder.ondataavailable = (e) => { if (e.data.size) studio.videoChunks.push(e.data); };
    const done = new Promise((res) => { recorder.onstop = res; });
    recorder.start();

    for (let i = 0; i < list.length; i++) {
        const scene = list[i];
        setStudioStatus(`🎬 מקליט סצנה ${i + 1}/${list.length}...`);
        await loadStudioImage(scene.src);
        studio.mouth = scene.mouth || { x: studio.canvas.width * 0.35, y: studio.canvas.height * 0.6, w: studio.canvas.width * 0.3, h: studio.canvas.height * 0.12 };
        studio.eyes = scene.eyes || null;
        studio.mouth2 = scene.mouth2 || null;
        studio.eyes2 = scene.eyes2 || null;
        studio.activeWho = scene.who || 1;
        await sleepFrames(EXPORT_LEAD * 1000);
        if (segs[i]) await playBufferSilentLipsync(segs[i]);
        else await sleepFrames(EXPORT_GAP * 1000);
        await sleepFrames(EXPORT_TRAIL * 1000);
    }
    recorder.stop();
    await done;
    try { studio.analyser.disconnect(); } catch (e) { /* ignore */ }

    // 3) בניית קובץ WAV מכל הקטעים + שתיקות בין סצנות
    const wavBlob = buildWavFromSegments(segs, sr);
    const videoBlob = new Blob(studio.videoChunks, { type: 'video/webm' });

    // 4) מיזוג ל-MP4 (אודיו AAC)
    setStudioStatus('🎞️ ממזג וידאו וקול ל-MP4... (טעינה ראשונה עשויה לקחת רגע)');
    const mp4 = await muxToMp4(videoBlob, wavBlob);
    showVideoPreview(mp4, 'mp4');
    const voiceNote = mode === 'synth' ? ' (קול דמות — לעברית אמיתית הגדירו קול פרימיום ⚙️)' : '';
    setStudioStatus('✅ הסרטון מוכן! צפו בו למטה ואז הורידו או שתפו 🎬' + voiceNote);
}

// מחזיר AudioBuffer לסצנה (פרימיום/מוקלט/סינתטי) או null אם אין טקסט
async function getSceneAudioBuffer(scene, mode, sr) {
    const text = (scene.text || '').trim();
    try {
        if (mode === 'premium') {
            if (!text) return null;
            return await premiumFetchBuffer(text);
        }
        if (mode === 'rec') {
            const ab = await studio.recordedBlob.arrayBuffer();
            return await studio.audioCtx.decodeAudioData(ab.slice(0));
        }
        if (!text) return null;
        return await renderSynthBuffer(text, scene, sr);
    } catch (err) {
        return null;
    }
}

// מנגן AudioBuffer בשקט (דרך gain=0) רק כדי להניע את הליפסינק בזמן ההקלטה
function playBufferSilentLipsync(buf) {
    return new Promise((resolve) => {
        const src = studio.audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(studio.analyser);
        startAmplitudeLipSync();
        src.onended = () => { stopAmplitudeLipSync(); try { src.disconnect(); } catch (e) {} resolve(); };
        src.start();
    });
}

// מרנדר את קול הדמות הסינתטי ל-AudioBuffer (לא מתנגן בקול)
async function renderSynthBuffer(text, scene, sr) {
    const arr = textToVisemes(text || '');
    if (!arr.length) return null;
    const step = Math.max(0.06, 0.1 / (scene.rate || 1));
    const total = Math.max(0.25, arr.length * step + 0.1);
    const oac = new OfflineAudioContext(1, Math.ceil(total * sr), sr);
    const base = scene.pitch || 1.2;
    const gain = oac.createGain();
    gain.gain.value = 0.0001;
    gain.connect(oac.destination);
    const osc = oac.createOscillator();
    osc.type = synthWaveFor(base);
    const lfo = oac.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 6;
    const lfoGain = oac.createGain(); lfoGain.gain.value = 7;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    osc.connect(gain);
    const freqFor = (v) => ({ AA: 230, EE: 300, OO: 200, UU: 190, FF: 260, CONS: 250, PP: 0, SIL: 0 }[v] || 250) * base;
    let t = 0;
    arr.forEach((v) => {
        const f = freqFor(v);
        if (f > 0) {
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.28, t + step * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.92);
        }
        t += step;
    });
    osc.start(0); lfo.start(0);
    osc.stop(t + 0.05); lfo.stop(t + 0.05);
    return await oac.startRendering();
}

// מאחד את כל הקטעים לקובץ WAV מונו עם שתיקות לפי תזמון הווידאו
function buildWavFromSegments(segs, sr) {
    const lead = Math.round(EXPORT_LEAD * sr);
    const trail = Math.round(EXPORT_TRAIL * sr);
    const gap = Math.round(EXPORT_GAP * sr);
    let totalLen = 0;
    segs.forEach((b) => { totalLen += lead + (b ? b.length : gap) + trail; });
    const out = new Float32Array(totalLen);
    let off = 0;
    segs.forEach((b) => {
        off += lead;
        if (b) { out.set(b.getChannelData(0), off); off += b.length; }
        else { off += gap; }
        off += trail;
    });
    return encodeWavMono(out, sr);
}

function encodeWavMono(samples, sr) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let off = 44;
    for (let i = 0; i < samples.length; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        off += 2;
    }
    return new Blob([view], { type: 'audio/wav' });
}

function pickVideoOnlyMime() {
    const cands = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (const m of cands) { if (MediaRecorder.isTypeSupported(m)) return m; }
    return 'video/webm';
}

async function muxToMp4(videoBlob, wavBlob) {
    const ff = await ensureFfmpeg();
    await ff.writeFile('v.webm', new Uint8Array(await videoBlob.arrayBuffer()));
    await ff.writeFile('a.wav', new Uint8Array(await wavBlob.arrayBuffer()));
    await ff.exec(['-i', 'v.webm', '-i', 'a.wav', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', 'out.mp4']);
    const out = await ff.readFile('out.mp4');
    return new Blob([out.buffer], { type: 'video/mp4' });
}

async function exportScenesCapture(list) {
    if (studio.exporting) return;
    if (!studio.canvas.captureStream) { setStudioStatus('הדפדפן לא תומך בייצוא וידאו'); return; }
    if (!list || list.length === 0) { setStudioStatus('אין סצנות לייצוא'); return; }

    studio.exporting = true;
    setStudioStatus('🎬 מתחיל ליצור סרטון...');

    // ערוץ אודיו להקלטה — תמיד מצרפים קול לקובץ:
    // קול פרימיום (ElevenLabs/OpenAI) > קול מוקלט > קול דמות סינתטי (תמיד עובד)
    const mode = premiumProvider() ? 'premium' : (studio.recordedBlob ? 'rec' : 'synth');
    ensureAudioCtx();
    const dest = studio.audioCtx.createMediaStreamDestination();
    studio.analyser.connect(dest);
    studio.analyser.connect(studio.audioCtx.destination);

    const videoStream = studio.canvas.captureStream(30);
    const tracks = [...videoStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
    const mixed = new MediaStream(tracks);

    const pick = pickVideoMime();
    studio.videoChunks = [];
    const recorder = new MediaRecorder(mixed, { mimeType: pick.mime });
    recorder.ondataavailable = (e) => { if (e.data.size) studio.videoChunks.push(e.data); };
    const done = new Promise((res) => { recorder.onstop = res; });
    recorder.start();

    for (let i = 0; i < list.length; i++) {
        const scene = list[i];
        setStudioStatus(`🎬 מקליט סצנה ${i + 1}/${list.length}...`);
        await loadStudioImage(scene.src);
        studio.mouth = scene.mouth || { x: studio.canvas.width * 0.35, y: studio.canvas.height * 0.6, w: studio.canvas.width * 0.3, h: studio.canvas.height * 0.12 };
        studio.eyes = scene.eyes || null;
        studio.mouth2 = scene.mouth2 || null;
        studio.eyes2 = scene.eyes2 || null;
        studio.activeWho = scene.who || 1;
        await sleepFrames(450);
        await playSceneAudio(scene, mode);   // הקול נכנס לקובץ + מסנכרן את הפה
        await sleepFrames(350);
    }

    recorder.stop();
    await done;
    studio.exporting = false;
    try { studio.analyser.disconnect(dest); } catch (e) { /* ignore */ }
    await finalizeVideo(pick);
    const voiceNote = mode === 'synth' ? ' (קול דמות — לעברית אמיתית הגדירו קול פרימיום ⚙️)' : '';
    if (studio.lastVideoExt === 'mp4') {
        setStudioStatus('✅ הסרטון מוכן כ-MP4 עם קול! אפשר לשתף 📤' + voiceNote);
    } else {
        setStudioStatus('✅ הסרטון מוכן (WEBM) עם קול. אם אין קול בנגן של Windows — שתפו לנייד/וואטסאפ או נגנו בכרום 🎬' + voiceNote);
    }
    loadSceneIntoStudio(studio.sceneIndex, false);
}

// משמיע את קול הסצנה לתוך ה-analyser (שמחובר להקלטה) ומסיים כשהקול נגמר
async function playSceneAudio(scene, mode) {
    const text = (scene.text || '').trim();
    try {
        if (mode === 'premium') {
            if (!text) return;
            const buf = await premiumFetchBuffer(text);
            await playBufferThroughAnalyser(buf);
        } else if (mode === 'rec') {
            const ab = await studio.recordedBlob.arrayBuffer();
            const buf = await studio.audioCtx.decodeAudioData(ab.slice(0));
            await playBufferThroughAnalyser(buf);
        } else {
            await synthSpeak(text, scene);
        }
    } catch (err) {
        setStudioStatus('שגיאת קול: ' + (err.message || '') + ' — ממשיך');
    }
}

function playBufferThroughAnalyser(buf) {
    return new Promise((resolve) => {
        const src = studio.audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(studio.analyser);
        startAmplitudeLipSync();
        src.onended = () => { stopAmplitudeLipSync(); try { src.disconnect(); } catch (e) {} resolve(); };
        src.start();
    });
}

/* קול דמות סינתטי (gibberish חביב) — תמיד זמין ונכנס לקובץ הווידאו.
   נבנה לפי רצף ההברות: לכל תנועה תדר אחר, עם ויברטו קל, מנותב דרך
   ה-analyser כך שהליפסינק מתבצע אוטומטית לפי עוצמת הקול. */
function synthSpeak(text, scene) {
    return new Promise((resolve) => {
        const arr = textToVisemes(text || '');
        const ac = studio.audioCtx;
        if (!arr.length || !ac) { resolve(); return; }
        const step = Math.max(0.06, 0.1 / (scene.rate || 1));   // שניות לכל הברה
        const base = scene.pitch || 1.2;
        const gain = ac.createGain();
        gain.gain.value = 0.0001;
        gain.connect(studio.analyser);
        const osc = ac.createOscillator();
        osc.type = synthWaveFor(base);
        const lfo = ac.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 6;
        const lfoGain = ac.createGain(); lfoGain.gain.value = 7;
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
        osc.connect(gain);

        const freqFor = (v) => ({ AA: 230, EE: 300, OO: 200, UU: 190, FF: 260, CONS: 250, PP: 0, SIL: 0 }[v] || 250) * base;
        let t = ac.currentTime + 0.03;
        arr.forEach((v) => {
            const f = freqFor(v);
            if (f > 0) {
                osc.frequency.setValueAtTime(f, t);
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(0.3, t + step * 0.3);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.92);
            }
            t += step;
        });
        const stopAt = t + 0.05;
        startAmplitudeLipSync();
        osc.start();
        lfo.start();
        osc.stop(stopAt);
        lfo.stop(stopAt);
        osc.onended = () => {
            stopAmplitudeLipSync();
            try { gain.disconnect(); } catch (e) {}
            resolve();
        };
    });
}

function sleepFrames(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* ----------------------------- גמר וידאו + שיתוף ----------------------------- */
function pickVideoMime() {
    const cands = ['video/mp4;codecs=h264,aac', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    for (const m of cands) {
        if (MediaRecorder.isTypeSupported(m)) {
            return { mime: m, ext: m.startsWith('video/mp4') ? 'mp4' : 'webm' };
        }
    }
    return { mime: 'video/webm', ext: 'webm' };
}

async function finalizeVideo(pick) {
    let blob = new Blob(studio.videoChunks, { type: pick.mime.split(';')[0] });
    let ext = pick.ext;
    if (ext === 'webm' && wantMp4()) {
        const mp4 = await convertToMp4(blob);
        if (mp4 && mp4.type === 'video/mp4') { blob = mp4; ext = 'mp4'; }
    }
    showVideoPreview(blob, ext);
}

// מציג נגן תצוגה מקדימה של הסרטון בתוך האתר (במקום הורדה אוטומטית)
function showVideoPreview(blob, ext) {
    studio.lastVideoBlob = blob;
    studio.lastVideoExt = ext || (blob.type.includes('mp4') ? 'mp4' : 'webm');
    const wrap = document.getElementById('studio-preview');
    const vid = document.getElementById('studio-preview-video');
    if (vid) {
        if (studio.lastPreviewUrl) { try { URL.revokeObjectURL(studio.lastPreviewUrl); } catch (e) { /* ignore */ } }
        studio.lastPreviewUrl = URL.createObjectURL(blob);
        vid.src = studio.lastPreviewUrl;
        vid.load();
        vid.play().catch(() => { /* דורש מגע משתמש — ינוגן בלחיצה */ });
    }
    if (wrap) {
        wrap.classList.remove('hidden');
        try { wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* ignore */ }
    }
    const row = document.getElementById('studio-share-row');
    if (row) row.classList.remove('hidden');
}

// שמירת הסרטון למכשיר (בלחיצה ידנית מתוך התצוגה המקדימה)
function saveVideo() {
    if (!studio.lastVideoBlob) { setStudioStatus('קודם צרו סרטון (🎬)'); return; }
    downloadVideoBlob(studio.lastVideoBlob, studio.lastVideoExt);
    setStudioStatus('⬇️ הסרטון נשמר למכשיר');
}

function downloadVideoBlob(blob, ext) {
    studio.lastVideoBlob = blob;
    studio.lastVideoExt = ext || (blob.type.includes('mp4') ? 'mp4' : 'webm');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `דמות-מדברת-${Date.now()}.${studio.lastVideoExt}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function shareVideo() {
    if (!studio.lastVideoBlob) { setStudioStatus('קודם צרו סרטון (🎬)'); return; }
    const ext = studio.lastVideoExt || 'webm';
    const file = new File([studio.lastVideoBlob], `דמות-מדברת-${Date.now()}.${ext}`, { type: studio.lastVideoBlob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: 'עולם הציורים', text: 'הדמות המדברת שיצרתי! 🎬' });
            setStudioStatus('✅ שותף!');
        } catch (e) { setStudioStatus('השיתוף בוטל'); }
    } else {
        setStudioStatus('הדפדפן לא תומך בשיתוף קבצים — הסרטון ירד למכשיר, אפשר לשתף ידנית 📤');
        downloadVideoBlob(studio.lastVideoBlob, ext);
    }
}

async function shareSnapshot() {
    const dataUrl = studio.canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `דמות-${Date.now()}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: 'עולם הציורים', text: 'הדמות שציירתי! 🎨' });
            setStudioStatus('✅ התמונה שותפה!');
            return;
        } catch (e) { /* נפילה להורדה */ }
    }
    const a = document.createElement('a');
    a.href = dataUrl; a.download = file.name; a.click();
    setStudioStatus('התמונה ירדה — אפשר לשתף אותה ברשתות 📸');
}

/* ----------------------------- קול פרימיום (ElevenLabs) ----------------------------- */
function toggleAdvanced() {
    const adv = document.getElementById('studio-advanced');
    adv.classList.toggle('hidden');
}

function loadElevenConfig() {
    studio.elKey = localStorage.getItem(EL_KEY_LS) || '';
    studio.elVoice = localStorage.getItem(EL_VOICE_LS) || '';
    const k = document.getElementById('el-api-key');
    const v = document.getElementById('el-voice-id');
    if (k) k.value = studio.elKey;
    if (v) v.value = studio.elVoice;
}

function saveElevenConfig() {
    studio.elKey = document.getElementById('el-api-key').value.trim();
    studio.elVoice = document.getElementById('el-voice-id').value.trim();
    localStorage.setItem(EL_KEY_LS, studio.elKey);
    localStorage.setItem(EL_VOICE_LS, studio.elVoice);
    studio.elCache = {};
    setStudioStatus(elConfigured() ? '✅ הקול נשמר! לחצו ▶️ כדי לשמוע' : 'מלאו מפתח API ומזהה קול');
}

function clearElevenConfig() {
    studio.elKey = ''; studio.elVoice = '';
    localStorage.removeItem(EL_KEY_LS); localStorage.removeItem(EL_VOICE_LS);
    document.getElementById('el-api-key').value = '';
    document.getElementById('el-voice-id').value = '';
    studio.elCache = {};
    setStudioStatus('הקול הפרימיום נוקה — חוזרים לקול הדפדפן');
}

function elConfigured() { return !!(studio.elKey && studio.elVoice); }

// מביא אודיו מ-ElevenLabs ומחזיר AudioBuffer (עם מטמון לפי טקסט)
async function elFetchAudioBuffer(text) {
    if (studio.elCache[text]) return studio.elCache[text];
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(studio.elVoice)}`, {
        method: 'POST',
        headers: { 'xi-api-key': studio.elKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({
            text,
            model_id: EL_MODEL,
            voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true },
        }),
    });
    if (!resp.ok) {
        let msg = 'HTTP ' + resp.status;
        try { const j = await resp.json(); msg = (j.detail && (j.detail.message || j.detail)) || msg; } catch (e) { /* ignore */ }
        throw new Error(typeof msg === 'string' ? msg : 'שגיאת קול');
    }
    const arr = await resp.arrayBuffer();
    ensureAudioCtx();
    const buf = await studio.audioCtx.decodeAudioData(arr);
    studio.elCache[text] = buf;
    return buf;
}

// משמיע טקסט בקול הפרימיום (ElevenLabs/OpenAI) + ליפסינק לפי עוצמת הקול
async function playWithPremium(text) {
    try {
        setStudioStatus('🎙️ מכין קול פרימיום...');
        const buf = await premiumFetchBuffer(text);
        ensureAudioCtx();
        const src = studio.audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(studio.analyser);
        studio.analyser.connect(studio.audioCtx.destination);
        startAmplitudeLipSync();
        src.onended = () => { stopAmplitudeLipSync(); setStudioStatus('סיום 🙂'); };
        src.start();
        setStudioStatus('🗣️ הדמות מדברת (קול פרימיום)...');
    } catch (err) {
        setStudioStatus('שגיאת קול פרימיום: ' + err.message);
    }
}

async function testElevenVoice() {
    saveElevenConfig();
    if (!elConfigured()) { setStudioStatus('מלאו מפתח API ומזהה קול'); return; }
    const text = (document.getElementById('studio-text').value.trim()) || 'שלום! זה הקול החדש שלי.';
    playWithPremium(text);
}

/* ----------------------------- קול פרימיום (OpenAI) ----------------------------- */
function premiumProvider() {
    if (elConfigured()) return 'el';
    if (oaConfigured()) return 'oa';
    return null;
}
function oaConfigured() { return !!(studio.oaKey && studio.oaVoice); }

async function premiumFetchBuffer(text) {
    return premiumProvider() === 'oa' ? oaFetchAudioBuffer(text) : elFetchAudioBuffer(text);
}

function populateOpenAiVoices() {
    const sel = document.getElementById('oa-voice');
    if (!sel) return;
    sel.innerHTML = '';
    OA_VOICES.forEach((v) => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v;
        sel.appendChild(o);
    });
}

function loadOpenAiConfig() {
    studio.oaKey = localStorage.getItem(OA_KEY_LS) || '';
    studio.oaVoice = localStorage.getItem(OA_VOICE_LS) || 'nova';
    const k = document.getElementById('oa-api-key');
    const v = document.getElementById('oa-voice');
    if (k) k.value = studio.oaKey;
    if (v) v.value = studio.oaVoice;
}

function saveOpenAiConfig() {
    studio.oaKey = document.getElementById('oa-api-key').value.trim();
    studio.oaVoice = document.getElementById('oa-voice').value || 'nova';
    localStorage.setItem(OA_KEY_LS, studio.oaKey);
    localStorage.setItem(OA_VOICE_LS, studio.oaVoice);
    setStudioStatus(oaConfigured() ? '✅ קול OpenAI נשמר! לחצו ▶️ או 🔊 בדוק' : 'הדביקו מפתח OpenAI');
}

function clearOpenAiConfig() {
    studio.oaKey = '';
    localStorage.removeItem(OA_KEY_LS);
    document.getElementById('oa-api-key').value = '';
    setStudioStatus('קול OpenAI נוקה');
}

// מביא אודיו מ-OpenAI ומחזיר AudioBuffer (עם מטמון)
async function oaFetchAudioBuffer(text) {
    const cacheKey = 'oa:' + studio.oaVoice + ':' + text;
    if (studio.elCache[cacheKey]) return studio.elCache[cacheKey];
    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + studio.oaKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: OA_MODEL, voice: studio.oaVoice, input: text, response_format: 'mp3' }),
    });
    if (!resp.ok) {
        let msg = 'HTTP ' + resp.status;
        try { const j = await resp.json(); msg = (j.error && j.error.message) || msg; } catch (e) { /* ignore */ }
        throw new Error(msg);
    }
    const arr = await resp.arrayBuffer();
    ensureAudioCtx();
    const buf = await studio.audioCtx.decodeAudioData(arr);
    studio.elCache[cacheKey] = buf;
    return buf;
}

async function testOpenAiVoice() {
    saveOpenAiConfig();
    if (!oaConfigured()) { setStudioStatus('הדביקו מפתח OpenAI ובחרו קול'); return; }
    if (elConfigured()) { setStudioStatus('שימו לב: ElevenLabs מוגדר וקודם בעדיפות. לבדיקת OpenAI נקו את ElevenLabs.'); }
    const text = (document.getElementById('studio-text').value.trim()) || 'שלום! זה הקול החדש שלי.';
    try {
        setStudioStatus('🤖 מכין קול OpenAI...');
        const buf = await oaFetchAudioBuffer(text);
        ensureAudioCtx();
        const src = studio.audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(studio.analyser);
        studio.analyser.connect(studio.audioCtx.destination);
        startAmplitudeLipSync();
        src.onended = () => { stopAmplitudeLipSync(); setStudioStatus('סיום 🙂'); };
        src.start();
        setStudioStatus('🗣️ קול OpenAI...');
    } catch (err) {
        setStudioStatus('שגיאת OpenAI: ' + err.message);
    }
}

/* ----------------------------- בחירת קול מהירה (חינם) ----------------------------- */
// צורת גל לפי גובה — נותנת טמבר שונה לגבר/אישה/ילד
function synthWaveFor(base) {
    if (base < 0.95) return 'sawtooth';   // גבר — עשיר/נמוך
    if (base > 1.6) return 'square';        // ילד — בהיר
    return 'triangle';                      // אישה — רך
}

function setSlider(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
    const lbl = document.getElementById(id + '-value');
    if (lbl) lbl.textContent = val;
}

// תצוגה מקדימה חיה של "קול הדמות" (הקול שנכנס לסרטון בחינם) — תמיד נשמע ההבדל
function previewSynthVoice(pitch, rate) {
    ensureAudioCtx();
    try { studio.analyser.disconnect(); } catch (e) { /* ignore */ }
    studio.analyser.connect(studio.audioCtx.destination);
    if (!studio.raf) startRenderLoop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    synthSpeak('שָׁלוֹם, נָעִים מְאוֹד!', { pitch, rate });
}

// מגדיר קול גבר/אישה/ילד: גובה + טמבר לקול הדמות (ייצוא), ובחירת קול אמיתי ל-▶️ אם קיים
function applyVoicePreset(kind) {
    const presets = {
        male:   { pitch: 0.7,  rate: 0.95, re: /avri|asaf|male|guy|david|aleksander|אסף|אברי|זכר/i, label: '👨 קול גבר' },
        female: { pitch: 1.4,  rate: 1.0,  re: /hila|carmit|noa|female|woman|הילה|כרמית|נועה|נקבה/i, label: '👩 קול אישה' },
        child:  { pitch: 1.95, rate: 1.1,  re: /hila|carmit|noa|female|google/i, label: '🧒 קול ילד/ה' },
    };
    const cfg = presets[kind] || presets.male;

    // בחירת קול עברי אמיתי מתאים (אם הדפדפן מציע יותר מאחד — Edge/Mac/אנדרואיד)
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const he = voices.map((v, i) => ({ v, i })).filter((o) => o.v.lang && o.v.lang.toLowerCase().startsWith('he'));
    const pick = he.find((o) => cfg.re.test(o.v.name)) || he[0];
    const sel = document.getElementById('studio-voice');
    if (pick && sel) sel.value = pick.i;

    setSlider('studio-rate', cfg.rate);
    setSlider('studio-pitch', cfg.pitch);
    setStudioStatus(cfg.label + ' נבחר — ככה הוא יישמע בסרטון 🎬');

    // תמיד מנגנים תצוגה מקדימה בקול הדמות, כדי שההבדל יישמע (גם בכרום/Windows)
    previewSynthVoice(cfg.pitch, cfg.rate);
}

/* ----------------------------- המרה ל-MP4 (ffmpeg.wasm, טעינה עצלה) ----------------------------- */
let ffmpegInstance = null;
async function ensureFfmpeg() {
    if (ffmpegInstance) return ffmpegInstance;
    // טעינת הספרייה מ-CDN רק כשצריך
    if (!window.FFmpegWASM) {
        await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
    }
    if (!window.FFmpegUtil) {
        await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
    }
    const { FFmpeg } = window.FFmpegWASM;
    const { toBlobURL } = window.FFmpegUtil;
    // חשוב: כשטוענים את הספרייה מ-CDN, ה-Worker הפנימי (module worker) וגם הליבה
    // חייבים להיטען כ-blob מאותו מקור, אחרת הדפדפן חוסם יצירת Worker חוצה-מקור.
    // משתמשים בליבת ESM (single-thread) — אין צורך ב-COOP/COEP/SharedArrayBuffer.
    const ffBase = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd';
    const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const ff = new FFmpeg();
    await ff.load({
        classWorkerURL: await toBlobURL(`${ffBase}/814.ffmpeg.js`, 'text/javascript'),
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegInstance = ff;
    return ff;
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = () => reject(new Error('load failed: ' + src));
        document.head.appendChild(s);
    });
}

// ממיר webm ל-mp4; אם נכשל מחזיר את ה-blob המקורי
async function convertToMp4(webmBlob) {
    try {
        setStudioStatus('🎞️ ממיר ל-MP4... (טעינה ראשונה עשויה לקחת רגע)');
        const ff = await ensureFfmpeg();
        const inName = 'in.webm', outName = 'out.mp4';
        const data = new Uint8Array(await webmBlob.arrayBuffer());
        await ff.writeFile(inName, data);
        await ff.exec(['-i', inName, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', outName]);
        const out = await ff.readFile(outName);
        return new Blob([out.buffer], { type: 'video/mp4' });
    } catch (err) {
        setStudioStatus('לא הצלחתי להמיר ל-MP4 — שומר כ-WEBM (אפשר לנגן ולשתף). ' + (err.message || ''));
        return webmBlob;
    }
}

function wantMp4() {
    const cb = document.getElementById('studio-mp4');
    return cb ? cb.checked : true;
}

/* ----------------------------- שיחה בין שתי דמויות ----------------------------- */
function toggleDialog() {
    const panel = document.getElementById('dlg-panel');
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if (opening) {
        studio.editMode = true;
        // יצירת פה ברירת-מחדל לדמות 2 (בצד ימין) אם עדיין אין
        if (!studio.mouth2) {
            studio.mouth2 = { x: studio.canvas.width * 0.6, y: studio.canvas.height * 0.6, w: studio.canvas.width * 0.28, h: studio.canvas.height * 0.12 };
        }
        setStudioStatus('סמנו פה לכל דמות (👄1 / 👄2), גררו למקום, וכתבו שיחה 💬');
        renderDialogList();
    }
}

function addDialogLine(who) {
    const ta = document.getElementById('dlg-text');
    const text = ta.value.trim();
    if (!text) { setStudioStatus('כתבו משפט ואז בחרו מי אומר אותו 🙂'); return; }
    studio.dialog.push({ who, text });
    ta.value = '';
    renderDialogList();
    setStudioStatus(`נוסף ל-שיחה (דמות ${who}). ${studio.dialog.length} שורות`);
}

function removeDialogLine(i) {
    studio.dialog.splice(i, 1);
    renderDialogList();
}

function renderDialogList() {
    const list = document.getElementById('dlg-list');
    if (!list) return;
    list.innerHTML = '';
    if (!studio.dialog.length) {
        list.innerHTML = '<div class="studio-text">עדיין אין שיחה. כתבו משפט ולחצו "דמות 1 אומרת" או "דמות 2 אומרת".</div>';
        return;
    }
    studio.dialog.forEach((line, i) => {
        const row = document.createElement('div');
        row.className = 'dlg-line who' + line.who;
        const tag = document.createElement('span');
        tag.className = 'dlg-who';
        tag.textContent = line.who === 1 ? '①' : '②';
        const txt = document.createElement('span');
        txt.className = 'dlg-txt';
        txt.textContent = line.text;
        const del = document.createElement('button');
        del.className = 'dlg-del';
        del.textContent = '✕';
        del.title = 'מחק שורה';
        del.onclick = () => removeDialogLine(i);
        row.appendChild(tag);
        row.appendChild(txt);
        row.appendChild(del);
        list.appendChild(row);
    });
}

// בונה רשימת "סצנות" מהשיחה — כולן על אותה תמונה, עם הפה הפעיל המתאים
function buildDialogScenes() {
    const rate = Number(document.getElementById('studio-rate').value) || 1;
    const pitch = Number(document.getElementById('studio-pitch').value) || 1.2;
    return studio.dialog.map((line) => ({
        src: studio.activeSrc,
        text: line.text,
        mouth: studio.mouth,
        mouth2: studio.mouth2,
        eyes: studio.eyes,
        eyes2: studio.eyes2,
        who: line.who,
        rate,
        // קול שונה מעט לכל דמות (גובה) כדי שיישמעו כשתי דמויות
        pitch: line.who === 2 ? Math.min(2, pitch + 0.4) : Math.max(0.6, pitch - 0.1),
    }));
}

// תצוגה מקדימה של השיחה (ללא הקלטה)
async function playDialog() {
    if (studio.exporting) return;
    if (!studio.dialog.length) { setStudioStatus('כתבו שיחה קודם 🙂'); return; }
    saveActiveToScene();
    studio.editMode = false;
    setStudioStatus('💬 מנגן שיחה...');
    for (const line of studio.dialog) {
        await speakLinePreview(line);
        await sleepFrames(220);
    }
    studio.activeWho = 1;
    setStudioStatus('סיום השיחה 🙂 — אפשר ליצור סרטון 🎬');
}

// יוצר סרטון שיחה (עם קול) + מציג כפתורי שיתוף
function exportDialog() {
    if (!studio.dialog.length) { setStudioStatus('כתבו שיחה קודם 🙂'); return; }
    if (!studio.mouth2) { setStudioStatus('סמנו גם פה לדמות 2 (👄2) 🙂'); return; }
    saveActiveToScene();
    studio.editMode = false;
    return exportScenes(buildDialogScenes());
}

// משמיע שורת שיחה בתצוגה מקדימה ומסנכרן את הפה הפעיל
function speakLinePreview(line) {
    return new Promise(async (resolve) => {
        studio.activeWho = line.who;
        const text = (line.text || '').trim();
        if (!text) { resolve(); return; }
        try {
            if (premiumProvider()) {
                const buf = await premiumFetchBuffer(text);
                ensureAudioCtx();
                studio.analyser.connect(studio.audioCtx.destination);
                await playBufferThroughAnalyser(buf);
                resolve(); return;
            }
            if (studio.recordedBlob) {
                ensureAudioCtx();
                studio.analyser.connect(studio.audioCtx.destination);
                const ab = await studio.recordedBlob.arrayBuffer();
                const buf = await studio.audioCtx.decodeAudioData(ab.slice(0));
                await playBufferThroughAnalyser(buf);
                resolve(); return;
            }
            if (!('speechSynthesis' in window)) {
                ensureAudioCtx();
                studio.analyser.connect(studio.audioCtx.destination);
                await synthSpeak(text, { rate: 1, pitch: line.who === 2 ? 1.6 : 1.0 });
                resolve(); return;
            }
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            const sel = document.getElementById('studio-voice');
            const voices = window.speechSynthesis.getVoices();
            if (voices[sel.value]) u.voice = voices[sel.value];
            u.lang = (u.voice && u.voice.lang) || 'he-IL';
            u.rate = 1;
            u.pitch = line.who === 2 ? 1.7 : 1.0;   // שתי דמויות = שני גבהי קול
            u.onstart = () => startVisemeSpeak(text, u.rate);
            u.onboundary = (e) => resyncVisemes(e.charIndex);
            let done = false;
            const finish = () => { if (done) return; done = true; stopVisemeSpeak(); resolve(); };
            u.onend = finish;
            window.speechSynthesis.speak(u);
            setTimeout(finish, Math.max(2500, text.length * 130) + 1500);
        } catch (err) {
            resolve();
        }
    });
}

/* ----------------------------- הכתבה קולית (Speech-to-Text) ----------------------------- */
let recog = null, recogBtn = null, recogTarget = null, recogBase = '';

function supportsDictation() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
}

function toggleDictation(targetId, btn) {
    if (!supportsDictation()) {
        setStudioStatus('הדפדפן לא תומך בהכתבה קולית — נסו בכרום/אדג׳');
        return;
    }
    // לחיצה חוזרת על אותו כפתור = עצירה
    if (recog && recogBtn === btn) { stopDictation(); return; }
    stopDictation();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recog = new SR();
    recog.lang = 'he-IL';
    recog.interimResults = true;
    recog.continuous = true;
    recogBtn = btn;
    recogTarget = document.getElementById(targetId);
    recogBase = recogTarget && recogTarget.value ? recogTarget.value.trim() + ' ' : '';

    recog.onresult = (e) => {
        let finalText = '', interim = '';
        for (let i = 0; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalText += r[0].transcript;
            else interim += r[0].transcript;
        }
        if (recogTarget) recogTarget.value = recogBase + finalText + interim;
    };
    recog.onerror = (e) => {
        const err = e.error || '';
        if (err === 'not-allowed' || err === 'service-not-allowed') {
            setStudioStatus('צריך לאשר גישה למיקרופון בדפדפן 🎤');
        } else if (err !== 'aborted') {
            setStudioStatus('שגיאת הכתבה: ' + err);
        }
        cleanupDictation();
    };
    recog.onend = () => { setStudioStatus('✅ הטקסט נכתב!'); cleanupDictation(); };

    try {
        recog.start();
        btn.classList.add('recording');
        setStudioStatus('🎤 דברו עכשיו... לחצו שוב על המיקרופון לסיום');
    } catch (err) {
        setStudioStatus('לא ניתן להתחיל הקלטה: ' + (err.message || ''));
        cleanupDictation();
    }
}

function stopDictation() {
    if (recog) { try { recog.stop(); } catch (e) { /* ignore */ } }
}

function cleanupDictation() {
    if (recogBtn) recogBtn.classList.remove('recording');
    recog = null; recogBtn = null; recogTarget = null; recogBase = '';
}

/* ----------------------------- עזר ----------------------------- */
function setStudioStatus(msg) {
    const el = document.getElementById('studio-status');
    if (el) el.textContent = msg;
}
