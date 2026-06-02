import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { getQuestionsByStage } from '../../data/reading/questions';
import { getCharacterById } from '../../data/reading/characters';
import {
  addStars,
  saveCompletedQuestion,
  getCompletedQuestions,
  getTotalStars,
  getPlayerName,
  saveBestTime,
} from '../../data/reading/readingStorage';
import { theme } from '../../theme';

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const Score = styled(Card)`
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  .emoji { font-size: 2rem; }
  .name { font-weight: 800; color: ${theme.colors.text}; }
  .stars { margin-right: auto; color: #ca8a04; font-weight: 800; font-size: 1.2rem; }
`;

const Timers = styled.div`
  border-radius: ${theme.radius.md};
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem;
  .t { text-align: center; }
  .lbl { font-size: 0.75rem; opacity: 0.9; }
  .val { font-size: 1.4rem; font-weight: 800; font-family: monospace; }
  .sep { width: 1px; height: 30px; background: rgba(255,255,255,0.3); }
`;

const MetaBar = styled(Card)`
  padding: 0.5rem 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 0.6rem;
  .lvl { color: ${theme.colors.primary}; font-weight: 800; }
  .cnt { color: ${theme.colors.textLight}; }
  .st { color: #ca8a04; font-weight: 800; }
`;

const QCard = styled(motion.div)`
  background: #fff;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.md};
  padding: 1.3rem;
`;

const Question = styled.h2`
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  text-align: center;
  color: ${theme.colors.text};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const Hint = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: ${theme.radius.sm};
  padding: 0.6rem;
  color: #1d4ed8;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
`;

const Answers = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  margin-bottom: 1rem;
`;

const AnswerBtn = styled(motion.button)`
  border: 2px solid ${(p) => p.$border};
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  font-size: clamp(1.1rem, 3.5vw, 1.4rem);
  font-weight: 800;
  font-family: ${theme.font};
  padding: 0.9rem 0.5rem;
  border-radius: ${theme.radius.md};
  cursor: ${(p) => (p.$disabled ? 'default' : 'pointer')};
  box-shadow: ${theme.shadow.sm};
`;

const Feedback = styled(motion.div)`
  text-align: center;
`;

const FeedBox = styled.div`
  border-radius: ${theme.radius.md};
  padding: 1rem;
  margin-bottom: 0.8rem;
  background: ${(p) => (p.$ok ? '#f0fdf4' : '#fef2f2')};
  border: 1px solid ${(p) => (p.$ok ? '#86efac' : '#fca5a5')};
  color: ${(p) => (p.$ok ? '#15803d' : '#b91c1c')};
  .big { font-size: 1.3rem; font-weight: 800; margin-bottom: 0.4rem; }
`;

const StarRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 0.6rem 0;
`;

const Done = styled(Card)`
  text-align: center;
  max-width: 460px;
  margin: 1rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
`;

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function answerColors(showFeedback, isCorrectAnswer, isSelected, isCorrect) {
  if (!showFeedback) {
    return isSelected
      ? { bg: '#e9d5ff', border: '#a855f7', color: theme.colors.text }
      : { bg: '#f5f3ff', border: '#d8b4fe', color: theme.colors.text };
  }
  if (isCorrectAnswer) return { bg: theme.colors.success, border: '#15803d', color: '#fff' };
  if (isSelected && !isCorrect) return { bg: theme.colors.error, border: '#b91c1c', color: '#fff' };
  return { bg: '#e5e7eb', border: '#d1d5db', color: theme.colors.textLight };
}

export default function ReadingGameScreen({ character, stage }) {
  const { navigate, goBack } = useApp();
  const stageQuestions = getQuestionsByStage(stage);
  const char = getCharacterById(character);
  const playerName = getPlayerName();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [earned, setEarned] = useState(0);
  const [totalStars, setTotalStars] = useState(getTotalStars());
  const [completed, setCompleted] = useState(getCompletedQuestions());
  const [finished, setFinished] = useState(false);

  const [qTime, setQTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [running, setRunning] = useState(true);
  const qStart = useRef(Date.now());
  const gameStart = useRef(Date.now());

  const q = stageQuestions[index];

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const now = Date.now();
      setQTime(Math.floor((now - qStart.current) / 1000));
      setTotalTime(Math.floor((now - gameStart.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [running]);

  const onAnswer = (i) => {
    if (showFeedback) return;
    setRunning(false);
    setSelected(i);
    const correct = i === q.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      setEarned(q.stars);
      setTotalStars(addStars(q.stars));
      saveCompletedQuestion(q.id);
      saveBestTime(qTime);
      setCompleted((p) => [...p, q.id]);
    }
  };

  const resetQ = () => {
    setSelected(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setEarned(0);
    setQTime(0);
    qStart.current = Date.now();
    setRunning(true);
  };

  const next = () => {
    if (index < stageQuestions.length - 1) {
      setIndex((p) => p + 1);
      resetQ();
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <Done initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={{ fontSize: '3.4rem' }}>🏆</div>
        <h2 style={{ color: theme.colors.text }}>כל הכבוד {playerName}! סיימת את שלב {stage}</h2>
        <div style={{ fontSize: '1.4rem', color: '#ca8a04', fontWeight: 800 }}>
          ⭐ {totalStars} כוכבים בסך הכול
        </div>
        <div style={{ color: theme.colors.textLight }}>זמן כולל: {fmt(totalTime)}</div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button onClick={() => navigate('reading-stage', { character })}>בחירת שלב</Button>
          <Button $variant="ghost" onClick={goBack}>חזרה</Button>
        </div>
      </Done>
    );
  }

  const isQDone = completed.includes(q.id);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <TopGrid>
        <Score>
          <span className="emoji">{char?.emoji || '🎮'}</span>
          <span className="name">{playerName || 'שחקן'}</span>
          <span className="stars">⭐ {totalStars}</span>
        </Score>
        <Timers>
          <div className="t"><div className="lbl">⏱️ זמן השאלה</div><div className="val">{fmt(qTime)}</div></div>
          <div className="sep" />
          <div className="t"><div className="lbl">⏰ זמן כולל</div><div className="val">{fmt(totalTime)}</div></div>
        </Timers>
      </TopGrid>

      <MetaBar>
        <span className="lvl">שלב {stage} · רמה {q.level}</span>
        <span className="cnt">שאלה {index + 1}/{stageQuestions.length}</span>
        <span className="st">⭐ {q.stars}</span>
      </MetaBar>

      <AnimatePresence mode="wait">
        <QCard
          key={q.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
        >
          {isQDone && !showFeedback && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 8, textAlign: 'center', marginBottom: 10, color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>
              ✓ כבר ענית נכון על שאלה זו!
            </div>
          )}

          <Question>{q.question}</Question>

          {q.hint && !showFeedback && (
            <Hint>💡 <strong>רמז:</strong> {q.hint}</Hint>
          )}

          <Answers>
            {q.answers.map((ans, i) => {
              const isCorrectAnswer = i === q.correctAnswer;
              const isSel = selected === i;
              const c = answerColors(showFeedback, isCorrectAnswer, isSel, isCorrect);
              return (
                <AnswerBtn
                  key={i}
                  $bg={c.bg}
                  $border={c.border}
                  $color={c.color}
                  $disabled={showFeedback}
                  whileHover={!showFeedback ? { scale: 1.04 } : {}}
                  whileTap={!showFeedback ? { scale: 0.95 } : {}}
                  onClick={() => onAnswer(i)}
                  disabled={showFeedback}
                >
                  {ans}
                  {showFeedback && isCorrectAnswer && ' ✓'}
                  {showFeedback && isSel && !isCorrect && ' ✗'}
                </AnswerBtn>
              );
            })}
          </Answers>

          <AnimatePresence>
            {showFeedback && (
              <Feedback initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {isCorrect ? (
                  <>
                    <FeedBox $ok>
                      <div className="big">🎉 כל הכבוד! 🎉</div>
                      <StarRow>
                        {Array.from({ length: earned }).map((_, i) => (
                          <motion.span
                            key={i}
                            style={{ fontSize: '2.4rem' }}
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: [0, 1.3, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                          >
                            ⭐
                          </motion.span>
                        ))}
                      </StarRow>
                      <div>קיבלת {earned} כוכבים!</div>
                    </FeedBox>
                    <Button onClick={next}>
                      {index < stageQuestions.length - 1 ? 'שאלה הבאה →' : `סיים שלב ${stage} 🏆`}
                    </Button>
                  </>
                ) : (
                  <>
                    <FeedBox>
                      <div className="big">😢 אופס! לא נכון</div>
                      <div>התשובה: <strong>{q.answers[q.correctAnswer]}</strong></div>
                    </FeedBox>
                    <Button $variant="secondary" onClick={resetQ}>נסה שוב 🔄</Button>
                  </>
                )}
              </Feedback>
            )}
          </AnimatePresence>
        </QCard>
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
        <Button $variant="ghost" $small onClick={() => navigate('reading-stage', { character })}>
          ← חזור לבחירת שלב
        </Button>
      </div>
    </div>
  );
}
