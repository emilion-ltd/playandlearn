import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, ProgressBar, Stars } from './UI';
import { theme } from '../../theme';

const Wrap = styled.div`
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Pill = styled.div`
  background: #fff;
  border-radius: ${theme.radius.pill};
  box-shadow: ${theme.shadow.sm};
  padding: 0.4rem 1rem;
  font-weight: 800;
  color: ${(p) => p.$color || theme.colors.text};
`;

const QCard = styled(motion.div)`
  background: #fff;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.md};
  padding: 1.5rem;
  text-align: center;
`;

const Display = styled.div`
  font-size: clamp(2.4rem, 8vw, 3.6rem);
  margin-bottom: 0.6rem;
`;

const Prompt = styled.h2`
  font-size: clamp(1.3rem, 4vw, 1.9rem);
  color: ${theme.colors.text};
  margin-bottom: 1.2rem;
  line-height: 1.5;
`;

const Answers = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  @media (max-width: 420px) { grid-template-columns: 1fr; }
`;

const AnswerBtn = styled(motion.button)`
  border: 2px solid ${(p) => p.$border};
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  font-size: clamp(1.1rem, 3.5vw, 1.4rem);
  font-weight: 800;
  font-family: ${theme.font};
  padding: 1rem 0.5rem;
  border-radius: ${theme.radius.md};
  cursor: ${(p) => (p.$disabled ? 'default' : 'pointer')};
  box-shadow: ${theme.shadow.sm};
`;

const Note = styled(motion.div)`
  margin-top: 1rem;
  border-radius: ${theme.radius.md};
  padding: 0.9rem;
  font-weight: 700;
  background: ${(p) => (p.$ok ? '#f0fdf4' : '#fef2f2')};
  border: 1px solid ${(p) => (p.$ok ? '#86efac' : '#fca5a5')};
  color: ${(p) => (p.$ok ? '#15803d' : '#b91c1c')};
`;

const Done = styled(Card)`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

function colorsFor(showFeedback, isCorrectAns, isSel, accent) {
  if (!showFeedback) {
    return isSel
      ? { bg: accent + '33', border: accent, color: theme.colors.text }
      : { bg: '#f6f7fc', border: '#dfe4f0', color: theme.colors.text };
  }
  if (isCorrectAns) return { bg: theme.colors.success, border: '#15803d', color: '#fff' };
  if (isSel && !isCorrectAns) return { bg: theme.colors.error, border: '#b91c1c', color: '#fff' };
  return { bg: '#eef0f6', border: '#e0e4ee', color: theme.colors.textLight };
}

function starsFor(score, total) {
  const pct = total ? (score / total) * 100 : 0;
  if (pct >= 90) return 3;
  if (pct >= 60) return 2;
  return score > 0 ? 1 : 0;
}

/**
 * משחק חידון גנרי לשימוש חוזר.
 * props:
 *  - title, emoji, color
 *  - makeQuestions: () => [{ prompt, display?, answers:[], correct:number, note? }]
 *  - onExit, onFinish?(score, total, stars)
 *  - encourage?: string[]  (הודעות עידוד בתשובה נכונה)
 */
export default function QuizGame({ title, emoji, color = theme.colors.primary, makeQuestions, onExit, onFinish, encourage }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const init = useCallback(() => {
    setQuestions(makeQuestions());
    setIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setScore(0);
    setFinished(false);
  }, [makeQuestions]);

  useEffect(() => {
    init();
  }, [init]);

  if (questions.length === 0) return null;

  const q = questions[index];
  const isCorrect = selected === q.correct;

  const answer = (i) => {
    if (showFeedback) return;
    setSelected(i);
    setShowFeedback(true);
    if (i === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((p) => p + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      const stars = starsFor(score, questions.length);
      setFinished(true);
      onFinish?.(score, questions.length, stars);
    }
  };

  if (finished) {
    const stars = starsFor(score, questions.length);
    return (
      <Wrap>
        <Done initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div style={{ fontSize: '3.4rem' }}>{stars === 3 ? '🏆' : stars === 2 ? '🎉' : '💪'}</div>
          <h2 style={{ color: theme.colors.text }}>סיימת את {title}!</h2>
          <Stars value={stars} size="2.2rem" />
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>
            {score} / {questions.length} תשובות נכונות
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button onClick={init} style={{ background: color }}>שחק שוב 🔁</Button>
            <Button $variant="ghost" onClick={onExit}>חזרה</Button>
          </div>
        </Done>
      </Wrap>
    );
  }

  const okMsg = (encourage && encourage[Math.floor(Math.random() * encourage.length)]) || 'כל הכבוד! 🎉';

  return (
    <Wrap>
      <TopBar>
        <Pill $color={color}>{emoji} {title}</Pill>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Pill>שאלה {index + 1}/{questions.length}</Pill>
          <Pill $color={theme.colors.success}>✓ {score}</Pill>
        </div>
      </TopBar>

      <ProgressBar value={((index) / questions.length) * 100} />

      <AnimatePresence mode="wait">
        <QCard key={index} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}>
          {q.display && <Display>{q.display}</Display>}
          <Prompt>{q.prompt}</Prompt>
          <Answers>
            {q.answers.map((ans, i) => {
              const c = colorsFor(showFeedback, i === q.correct, selected === i, color);
              return (
                <AnswerBtn
                  key={i}
                  $bg={c.bg}
                  $border={c.border}
                  $color={c.color}
                  $disabled={showFeedback}
                  whileHover={!showFeedback ? { scale: 1.04 } : {}}
                  whileTap={!showFeedback ? { scale: 0.95 } : {}}
                  onClick={() => answer(i)}
                  disabled={showFeedback}
                >
                  {ans}
                  {showFeedback && i === q.correct && ' ✓'}
                  {showFeedback && selected === i && i !== q.correct && ' ✗'}
                </AnswerBtn>
              );
            })}
          </Answers>

          <AnimatePresence>
            {showFeedback && (
              <Note $ok={isCorrect} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {isCorrect ? (
                  <div>{okMsg}{q.note ? ` · ${q.note}` : ''}</div>
                ) : (
                  <div>
                    😊 התשובה הנכונה: <strong>{q.answers[q.correct]}</strong>
                    {q.note ? ` · ${q.note}` : ''}
                  </div>
                )}
              </Note>
            )}
          </AnimatePresence>

          {showFeedback && (
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={next} style={{ background: color }}>
                {index < questions.length - 1 ? 'הבא →' : 'סיום 🏁'}
              </Button>
            </div>
          )}
        </QCard>
      </AnimatePresence>

      <div style={{ textAlign: 'center' }}>
        <Button $variant="ghost" $small onClick={onExit}>חזרה</Button>
      </div>
    </Wrap>
  );
}
