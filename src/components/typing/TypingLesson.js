import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Keyboard from './Keyboard';
import { Button, Card, ProgressBar, Stars } from '../common/UI';
import { theme } from '../../theme';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
`;

const Stat = styled(Card)`
  padding: 0.7rem 1.2rem;
  text-align: center;
  min-width: 110px;
  .value { font-size: 1.6rem; font-weight: 800; color: ${theme.colors.primary}; }
  .label { font-size: 0.85rem; color: ${theme.colors.textLight}; }
`;

const TextBox = styled(Card)`
  width: 100%;
  max-width: 760px;
  font-size: clamp(1.4rem, 4vw, 2rem);
  line-height: 2.6rem;
  letter-spacing: 1px;
  direction: ${(p) => (p.$lang === 'he' ? 'rtl' : 'ltr')};
  text-align: ${(p) => (p.$lang === 'he' ? 'right' : 'left')};
  word-break: break-word;
  user-select: none;
`;

const Char = styled.span`
  position: relative;
  padding: 0 1px;
  border-radius: 4px;
  background: ${(p) =>
    p.$state === 'current' ? theme.colors.accent : p.$state === 'wrong' ? '#ffd6d6' : 'transparent'};
  color: ${(p) =>
    p.$state === 'correct'
      ? theme.colors.success
      : p.$state === 'wrong'
      ? theme.colors.error
      : theme.colors.text};
  text-decoration: ${(p) => (p.$state === 'current' ? 'underline' : 'none')};
  font-weight: ${(p) => (p.$state === 'current' ? 800 : 600)};
  white-space: pre;
`;

const FocusHint = styled(motion.div)`
  color: ${theme.colors.textLight};
  font-size: 0.95rem;
`;

const DoneCard = styled(Card)`
  text-align: center;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

function computeStars(accuracy, wpm) {
  let stars = 1;
  if (accuracy >= 85) stars = 2;
  if (accuracy >= 95 && wpm >= 12) stars = 3;
  return stars;
}

export default function TypingLesson({ lesson, onComplete, onNext, onExit, hasNext }) {
  const text = lesson.text;
  const lang = lesson.lang;
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [errorFlash, setErrorFlash] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(null);
  const [focused, setFocused] = useState(true);
  const [phase, setPhase] = useState('typing'); // typing | done
  const [result, setResult] = useState(null);
  const containerRef = useRef(null);

  const expectedChar = text[index] || '';

  const finish = useCallback(
    (finalErrors) => {
      const elapsedMin = Math.max((Date.now() - (startTime || Date.now())) / 60000, 1 / 600);
      const wpm = Math.round((text.length / 5) / elapsedMin);
      const totalPresses = text.length + finalErrors;
      const accuracy = Math.round((text.length / totalPresses) * 100);
      const stars = computeStars(accuracy, wpm);
      const res = { wpm, accuracy, stars, errors: finalErrors };
      setResult(res);
      setPhase('done');
      onComplete?.(res);
    },
    [startTime, text, onComplete]
  );

  const handleKey = useCallback(
    (e) => {
      if (phase !== 'typing') return;
      if (e.key === 'Tab' || e.metaKey || e.ctrlKey || e.altKey) return;
      // התעלמות ממקשי ניווט/פונקציה
      if (e.key.length !== 1 && e.key !== 'Backspace') return;
      e.preventDefault();

      if (e.key === 'Backspace') {
        setIndex((i) => Math.max(0, i - 1));
        return;
      }

      if (!startTime) setStartTime(Date.now());

      const typed = lang === 'en' ? e.key.toLowerCase() : e.key;
      const expected = lang === 'en' ? expectedChar.toLowerCase() : expectedChar;

      if (typed === expected) {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        if (nextIndex >= text.length) {
          finish(errors);
        }
      } else {
        setErrors((n) => n + 1);
        setErrorFlash(true);
        setTimeout(() => setErrorFlash(false), 220);
      }
    },
    [phase, startTime, lang, expectedChar, index, text.length, errors, finish]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // טיימר לתצוגת מהירות חיה
  useEffect(() => {
    if (!startTime || phase !== 'typing') return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [startTime, phase]);

  const liveWpm = startTime
    ? Math.round((index / 5) / Math.max((((now || Date.now()) - startTime) / 60000), 1 / 600))
    : 0;
  const liveAccuracy = index + errors > 0 ? Math.round((index / (index + errors)) * 100) : 100;
  const progress = (index / text.length) * 100;

  const reset = () => {
    setIndex(0);
    setErrors(0);
    setStartTime(null);
    setNow(null);
    setPhase('typing');
    setResult(null);
  };

  if (phase === 'done' && result) {
    return (
      <Wrap>
        <DoneCard initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h2 style={{ color: theme.colors.text }}>כל הכבוד! סיימת את השיעור</h2>
          <Stars value={result.stars} size="2rem" />
          <StatsRow>
            <Stat><div className="value">{result.wpm}</div><div className="label">מילים לדקה</div></Stat>
            <Stat><div className="value">{result.accuracy}%</div><div className="label">דיוק</div></Stat>
            <Stat><div className="value">{result.errors}</div><div className="label">טעויות</div></Stat>
          </StatsRow>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button $variant="ghost" onClick={reset}>נסו שוב 🔁</Button>
            <Button $variant="ghost" onClick={onExit}>חזרה לשיעורים</Button>
            {hasNext && <Button onClick={onNext}>השיעור הבא ←</Button>}
          </div>
        </DoneCard>
      </Wrap>
    );
  }

  return (
    <Wrap
      ref={containerRef}
      tabIndex={0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <StatsRow>
        <Stat><div className="value">{liveWpm}</div><div className="label">מילים לדקה</div></Stat>
        <Stat><div className="value">{liveAccuracy}%</div><div className="label">דיוק</div></Stat>
        <Stat><div className="value">{errors}</div><div className="label">טעויות</div></Stat>
      </StatsRow>

      <div style={{ width: '100%', maxWidth: 760 }}>
        <ProgressBar value={progress} />
      </div>

      <TextBox $lang={lang}>
        {text.split('').map((ch, i) => {
          let state = 'pending';
          if (i < index) state = 'correct';
          else if (i === index) state = 'current';
          return (
            <Char key={i} $state={state}>
              {ch}
            </Char>
          );
        })}
      </TextBox>

      <Keyboard lang={lang} activeChar={expectedChar} showColors errorFlash={errorFlash} />

      <AnimatePresence>
        {!focused && (
          <FocusHint
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            התחילו פשוט להקליד על המקלדת ⌨️
          </FocusHint>
        )}
      </AnimatePresence>

      <Button $variant="ghost" $small onClick={onExit}>
        חזרה לשיעורים
      </Button>
    </Wrap>
  );
}
