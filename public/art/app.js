/* =========================================================================
   עולם הציורים — אפליקציה מאוחדת (ללא מודולים, רצה גם מ-file://)
   שלב 1: מנוע ציור מלא + כלים + מצבים + ניקוד + הקראה
   שלב 2: אולפן הנפשה — דמות מדברת עם ליפסינק + ייצוא וידאו + הוק ל-AI
   ========================================================================= */

'use strict';

/* ----------------------------- מצב גלובלי ----------------------------- */
const state = {
    color: '#000000',
    tool: 'brush',          // brush | eraser | fill
    brushSize: 5,
    sticker: null,
    score: 0,
    highScore: Number(localStorage.getItem('highScore') || 0),
    currentPlayer: localStorage.getItem('currentPlayer') || '',
    players: JSON.parse(localStorage.getItem('players') || '{}'),
    gameMode: 'free',
    category: null,
    speechOn: false,
    timeLeft: 0,
    timerInterval: null,
    guidedStep: 0,
    undoStack: [],
    maxUndo: 30,
};

let canvas, ctx;

/* ----------------------------- נתוני משחק ----------------------------- */
const guidedSteps = [
    { hint: 'צייר עיגול גדול לראש', color: '#000000' },
    { hint: 'הוסף שתי עיניים עגולות', color: '#1473E6' },
    { hint: 'צייר אף קטן באמצע', color: '#9C27B0' },
    { hint: 'הוסף חיוך גדול', color: '#E53935' },
    { hint: 'צייר שתי אוזניים בצדדים', color: '#FB8C00' },
];

const categories = {
    animals: ['🐶 כלב', '🐱 חתול', '🦁 אריה', '🐘 פיל', '🦒 ג׳ירפה'],
    vehicles: ['🚗 מכונית', '🚲 אופניים', '✈️ מטוס', '🚢 ספינה', '🚂 רכבת'],
    food: ['🍕 פיצה', '🍔 המבורגר', '🍦 גלידה', '🍎 תפוח', '🍌 בננה'],
};

const palette = ['#000000', '#FFFFFF', '#E53935', '#43A047', '#1E88E5',
                 '#FDD835', '#FB8C00', '#8E24AA', '#6D4C41', '#FF80AB'];
const stickers = ['🌟', '🌈', '🌺', '🦄', '❤️', '😀', '☀️', '🐱', '🚀', '🍦'];

/* ----------------------------- אתחול ----------------------------- */
function initializeApp() {
    canvas = document.getElementById('drawing-canvas');
    if (!canvas) { console.error('חסר אלמנט canvas'); return; }
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ציור
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp);

    buildColorPicker();
    buildStickerPalette();
    bindToolbar();
    bindModes();
    bindCategories();
    bindSettings();
    bindActions();
    initPlayer();
    initStudio();

    setGameMode('free');
    updateScore(0);
    showMessage('ברוכים הבאים לעולם הציורים! 🎨');
    console.log('האפליקציה אותחלה');
}

/* ----------------------------- קנבס ----------------------------- */
function resizeCanvas() {
    // שמירת התוכן הקיים לפני שינוי גודל
    let snapshot = null;
    if (canvas.width && canvas.height) {
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height));
    fillBackground();
    if (snapshot) ctx.putImageData(snapshot, 0, 0);
    if (state.gameMode === 'guided') drawGuidedOverlay();
}

function fillBackground() {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = (e.touches && e.touches[0]) ? e.touches[0] : e;
    return [(src.clientX - rect.left) * scaleX, (src.clientY - rect.top) * scaleY];
}

/* ----------------------------- היסטוריה (Undo) ----------------------------- */
function pushUndo() {
    try {
        state.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (state.undoStack.length > state.maxUndo) state.undoStack.shift();
    } catch (err) { /* תמונות חוצות-מקור עלולות לחסום getImageData */ }
}

function undo() {
    if (state.undoStack.length === 0) { showMessage('אין מה לבטל'); return; }
    const img = state.undoStack.pop();
    ctx.putImageData(img, 0, 0);
}

/* ----------------------------- ציור ----------------------------- */
let drawing = false, lastX = 0, lastY = 0;

function onPointerDown(e) {
    const [x, y] = getCoordinates(e);

    if (state.sticker) { pushUndo(); placeSticker(x, y); return; }
    if (state.tool === 'fill') { pushUndo(); floodFill(Math.round(x), Math.round(y), state.color); return; }

    pushUndo();
    drawing = true;
    [lastX, lastY] = [x, y];
    // נקודה בודדת (טאץ' קצר)
    ctx.beginPath();
    ctx.fillStyle = state.tool === 'eraser' ? '#FFFFFF' : state.color;
    ctx.arc(x, y, currentLineWidth() / 2, 0, Math.PI * 2);
    ctx.fill();
}

function onPointerMove(e) {
    if (!drawing) return;
    const [x, y] = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = state.tool === 'eraser' ? '#FFFFFF' : state.color;
    ctx.lineWidth = currentLineWidth();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    [lastX, lastY] = [x, y];

    if (state.gameMode === 'guided') maybeAdvanceGuided();
}

function onPointerUp() { drawing = false; }
function onTouchStart(e) { e.preventDefault(); onPointerDown(e); }
function onTouchMove(e) { e.preventDefault(); onPointerMove(e); }

function currentLineWidth() {
    return state.tool === 'eraser' ? state.brushSize * 2 : state.brushSize;
}

/* מילוי דלי — flood fill פשוט */
function floodFill(startX, startY, hexColor) {
    const w = canvas.width, h = canvas.height;
    if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    const target = getPixel(data, w, startX, startY);
    const fill = hexToRgba(hexColor);
    if (colorsClose(target, fill, 0)) return;

    const stack = [[startX, startY]];
    while (stack.length) {
        const [x, y] = stack.pop();
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const px = getPixel(data, w, x, y);
        if (!colorsClose(px, target, 32)) continue;
        setPixel(data, w, x, y, fill);
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(img, 0, 0);
}

function getPixel(d, w, x, y) { const i = (y * w + x) * 4; return [d[i], d[i+1], d[i+2], d[i+3]]; }
function setPixel(d, w, x, y, c) { const i = (y * w + x) * 4; d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=c[3]; }
function colorsClose(a, b, t) {
    return Math.abs(a[0]-b[0]) <= t && Math.abs(a[1]-b[1]) <= t &&
           Math.abs(a[2]-b[2]) <= t && Math.abs(a[3]-b[3]) <= t;
}
function hexToRgba(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16), 255];
}

/* ----------------------------- מדבקות ----------------------------- */
function placeSticker(x, y) {
    ctx.save();
    ctx.font = `${Math.max(40, state.brushSize * 8)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.sticker, x, y);
    ctx.restore();
    awardPoints(2);
}

/* ----------------------------- UI: צבעים / מדבקות / כלים ----------------------------- */
function buildColorPicker() {
    const el = document.getElementById('color-picker');
    el.innerHTML = '';
    palette.forEach(color => {
        const b = document.createElement('button');
        b.className = 'color-swatch';
        b.style.backgroundColor = color;
        b.onclick = () => selectColor(color, b);
        if (color === state.color) b.classList.add('active');
        el.appendChild(b);
    });
    const custom = document.getElementById('custom-color');
    custom.oninput = () => selectColor(custom.value, null);
}

function selectColor(color, btn) {
    state.color = color;
    state.sticker = null;
    if (state.tool === 'eraser') setTool('brush');
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

function buildStickerPalette() {
    const el = document.getElementById('sticker-palette');
    el.innerHTML = '';
    stickers.forEach(s => {
        const b = document.createElement('button');
        b.textContent = s;
        b.onclick = () => {
            state.sticker = s;
            showMessage('בחרת מדבקה — לחץ על הציור כדי להציב אותה');
            document.querySelectorAll('#sticker-palette button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
        };
        el.appendChild(b);
    });
}

function bindToolbar() {
    document.getElementById('tool-brush').onclick = () => setTool('brush');
    document.getElementById('tool-eraser').onclick = () => setTool('eraser');
    document.getElementById('tool-fill').onclick = () => setTool('fill');
    const range = document.getElementById('brush-size');
    range.oninput = () => {
        state.brushSize = Number(range.value);
        document.getElementById('brush-size-value').textContent = range.value;
    };
}

function setTool(tool) {
    state.tool = tool;
    state.sticker = null;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const map = { brush: 'tool-brush', eraser: 'tool-eraser', fill: 'tool-fill' };
    const el = document.getElementById(map[tool]);
    if (el) el.classList.add('active');
}

/* ----------------------------- מצבי משחק ----------------------------- */
function bindModes() {
    document.getElementById('mode-guided').onclick = () => setGameMode('guided');
    document.getElementById('mode-complete-drawing').onclick = () => setGameMode('completeDrawing');
    document.getElementById('mode-timed').onclick = () => setGameMode('timed');
    document.getElementById('mode-free').onclick = () => setGameMode('free');
    document.getElementById('end-current-mode').onclick = () => setGameMode('free');
}

function setGameMode(mode) {
    state.gameMode = mode;
    stopTimer();
    clearCanvas(true);
    switch (mode) {
        case 'guided':
            state.guidedStep = 0;
            drawGuidedOverlay();
            showMessage(guidedSteps[0].hint);
            state.color = guidedSteps[0].color;
            break;
        case 'completeDrawing':
            drawBasicShape();
            showMessage('השלם את הציור: הוסף פרטים לדמות 🙂');
            break;
        case 'timed':
            state.timeLeft = 60;
            showMessage('צייר מהר! יש לך 60 שניות ⏱️');
            startTimer();
            break;
        case 'free':
        default:
            showMessage('מצב ציור חופשי — תהנו! 🎉');
    }
}

function drawGuidedOverlay() {
    const step = guidedSteps[state.guidedStep];
    if (!step) return;
    ctx.save();
    ctx.font = '22px Heebo';
    ctx.fillStyle = 'rgba(20,115,230,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText(`שלב ${state.guidedStep + 1}/${guidedSteps.length}: ${step.hint}`, canvas.width / 2, 30);
    ctx.restore();
}

let guidedStrokeCount = 0;
function maybeAdvanceGuided() {
    guidedStrokeCount++;
    if (guidedStrokeCount < 40) return;   // אחרי כמות ציור מספקת מתקדמים
    guidedStrokeCount = 0;
    advanceGuided();
}

function advanceGuided() {
    awardPoints(10);
    if (state.guidedStep < guidedSteps.length - 1) {
        state.guidedStep++;
        const step = guidedSteps[state.guidedStep];
        showMessage(step.hint);
        state.color = step.color;
    } else {
        showMessage('כל הכבוד! סיימת את כל השלבים! 🏆');
        awardPoints(50);
        setGameMode('free');
    }
}

function drawBasicShape() {
    ctx.save();
    ctx.strokeStyle = 'rgba(100,100,100,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function startTimer() {
    stopTimer();
    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        const el = document.getElementById('message');
        if (el) el.textContent = `זמן נותר: ${state.timeLeft} שניות`;
        if (state.timeLeft <= 0) {
            stopTimer();
            showMessage('הזמן נגמר! 🎉 כל הכבוד');
            awardPoints(20);
        }
    }, 1000);
}
function stopTimer() { if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; } }

/* ----------------------------- קטגוריות (רקע לשרטוט) ----------------------------- */
function bindCategories() {
    document.getElementById('category-animals').onclick = () => setCategory('animals');
    document.getElementById('category-vehicles').onclick = () => setCategory('vehicles');
    document.getElementById('category-food').onclick = () => setCategory('food');
}

function setCategory(cat) {
    state.category = cat;
    const items = categories[cat];
    const item = items[Math.floor(Math.random() * items.length)];
    showMessage(`נסה לצייר: ${item}`);
}

/* ----------------------------- הגדרות (לילה / הקראה) ----------------------------- */
function bindSettings() {
    const theme = document.getElementById('theme-toggle');
    theme.checked = document.body.classList.contains('dark-mode');
    theme.onchange = () => document.body.classList.toggle('dark-mode', theme.checked);

    const speech = document.getElementById('speech-toggle');
    speech.onchange = () => {
        state.speechOn = speech.checked;
        if (state.speechOn) speak('הקראה הופעלה');
    };
}

function speak(text) {
    if (!state.speechOn || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'he-IL';
        u.rate = 1; u.pitch = 1.1;
        const voice = pickHebrewVoice();
        if (voice) u.voice = voice;
        window.speechSynthesis.speak(u);
    } catch (err) { /* התעלם */ }
}

function pickHebrewVoice() {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    return voices.find(v => v.lang && v.lang.toLowerCase().startsWith('he')) || null;
}

/* ----------------------------- פעולות (נקה / בטל / שמירה) ----------------------------- */
function bindActions() {
    document.getElementById('action-undo').onclick = undo;
    document.getElementById('action-clear').onclick = () => { pushUndo(); clearCanvas(false); showMessage('הקנבס נוקה'); };
    document.getElementById('action-save').onclick = saveDrawing;
    document.getElementById('action-animate').onclick = openStudio;
    const shareBtn = document.getElementById('action-share');
    if (shareBtn) shareBtn.onclick = shareDrawing;
}

/* שיתוף הציור — Web Share API עם נפילה להורדה */
async function shareDrawing() {
    const dataUrl = canvas.toDataURL('image/png');
    try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `ציור-${Date.now()}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'עולם הציורים', text: 'הציור שלי! 🎨' });
            showMessage('הציור שותף! 📤');
            return;
        }
    } catch (e) { /* נפילה להורדה */ }
    const a = document.createElement('a');
    a.href = dataUrl; a.download = `ציור-${Date.now()}.png`; a.click();
    showMessage('הציור ירד — אפשר לשתף אותו ברשתות 📤');
}

function clearCanvas(silent) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillBackground();
    if (!silent && state.gameMode === 'guided') drawGuidedOverlay();
}

function saveDrawing() {
    const dataUrl = canvas.toDataURL('image/png');
    // הורדה לקובץ
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ציור-${new Date().toISOString().slice(0,10)}.png`;
    a.click();
    // שמירה לגלריה של השחקן
    if (state.currentPlayer) {
        const p = state.players[state.currentPlayer];
        p.savedDrawings = p.savedDrawings || [];
        p.savedDrawings.push(dataUrl);
        if (p.savedDrawings.length > 12) p.savedDrawings.shift();
        persistPlayers();
        renderGallery();
    }
    awardPoints(15);
    showMessage('הציור נשמר! 💾');
}

/* ----------------------------- ניקוד ----------------------------- */
function awardPoints(n) { updateScore(state.score + n); }

function updateScore(value) {
    state.score = value;
    const scoreEl = document.getElementById('score');
    const highEl = document.getElementById('high-score');
    if (scoreEl) scoreEl.textContent = state.score;
    if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('highScore', state.highScore);
        if (state.currentPlayer) {
            state.players[state.currentPlayer].highScore = state.highScore;
            persistPlayers();
        }
    }
    if (highEl) highEl.textContent = `שיא: ${state.highScore}`;
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = `${Math.min(100, (state.score % 100))}%`;
}

/* ----------------------------- שחקנים ----------------------------- */
// שם שחקן שמגיע מהפלטפורמה (כשהמשחק מוטמע ב-iframe) — מונע כפילות שחקנים
function getExternalPlayer() {
    try {
        const sp = new URLSearchParams(window.location.search);
        const p = sp.get('player');
        return p ? p.trim() : '';
    } catch (e) { return ''; }
}

function initPlayer() {
    // אין טופס התחברות במשחק — השחקן מגיע תמיד מהפלטפורמה (פרמטר ?player=
    // שההאדר מעביר ל-iframe). כך הציורים והשיאים משויכים לאותו משתמש שמוצג למעלה.
    const external = getExternalPlayer();
    try { state.externalEmoji = new URLSearchParams(window.location.search).get('emoji') || ''; } catch (e) { state.externalEmoji = ''; }
    const name = external || state.currentPlayer || 'אורח';
    if (!state.players[name]) state.players[name] = { highScore: 0, savedDrawings: [] };
    state.currentPlayer = name;
    localStorage.setItem('currentPlayer', name);
    persistPlayers();
    renderPlayer();
}

function renderPlayer() {
    if (!state.currentPlayer) return;
    state.highScore = state.players[state.currentPlayer].highScore || state.highScore;
    updateScore(state.score);
    renderGallery();
}

function renderGallery() {
    const gallery = document.getElementById('drawings-gallery');
    gallery.innerHTML = '';
    if (!state.currentPlayer) return;
    const drawings = state.players[state.currentPlayer].savedDrawings || [];
    drawings.slice().reverse().forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'gallery-thumb';
        img.onclick = () => { pushUndo(); const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, canvas.width, canvas.height); im.src = src; };
        gallery.appendChild(img);
    });
}

function persistPlayers() { localStorage.setItem('players', JSON.stringify(state.players)); }

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* הצגת הודעה + הקראה */
function showMessage(message) {
    const el = document.getElementById('message');
    if (el) el.textContent = message;
    speak(message);
}

document.addEventListener('DOMContentLoaded', initializeApp);
