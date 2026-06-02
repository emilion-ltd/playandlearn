import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Stars } from '../../components/common/UI';
import { keyboardRows } from '../../data/typing/keyboardLayout';
import { mobileWords } from '../../data/typing/lessons';
import { theme } from '../../theme';

const GAME_SECONDS = 60;
const BEST_KEY = 'learn-he-mobile-best';

const Phone = styled.div`
  max-width: 380px;
  margin: 1rem auto;
  background: #1f2740;
  border-radius: 36px;
  padding: 16px 12px 22px;
  box-shadow: ${theme.shadow.lg};
  border: 6px solid #11162a;
`;

const Screen = styled.div`
  background: #f4f6fc;
  border-radius: 22px;
  padding: 14px 12px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  color: ${theme.colors.text};
  .time { color: ${(p) => (p.$low ? theme.colors.error : theme.colors.primary)}; }
`;

const WordBox = styled(motion.div)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 2px;
  direction: ${(p) => (p.$lang === 'he' ? 'rtl' : 'ltr')};
`;

const Ch = styled.span`
  color: ${(p) => (p.$done ? theme.colors.success : theme.colors.text)};
  opacity: ${(p) => (p.$done ? 0.6 : 1)};
  border-bottom: ${(p) => (p.$current ? `4px solid ${theme.colors.primary}` : '4px solid transparent')};
  padding: 0 2px;
`;

const Keys = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
`;

const KRow = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
`;

const KeyBtn = styled(motion.button)`
  flex: 1;
  max-width: 34px;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: ${theme.colors.text};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 0 rgba(0,0,0,0.12);
`;

const WideBtn = styled(KeyBtn)`
  max-width: none;
  flex: 3;
`;

const Center = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
`;

function randWord(lang, prev) {
  const list = mobileWords[lang];
  let w = prev;
  while (w === prev) w = list[Math.floor(Math.random() * list.length)];
  return w;
}

function loadBest() {
  return Number(localStorage.getItem(BEST_KEY) || 0);
}

export default function MobileTypingGame() {
  const [lang, setLang] = useState('he');
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [word, setWord] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wordsDone, setWordsDone] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [shake, setShake] = useState(false);
  const [best, setBest] = useState(loadBest);
  const timerRef = useRef(null);

  const start = () => {
    setScore(0);
    setWordsDone(0);
    setCorrect(0);
    setTaps(0);
    setTimeLeft(GAME_SECONDS);
    setCharIndex(0);
    setWord(randWord(lang, ''));
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('over');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === 'over') {
      setBest((b) => {
        const nb = Math.max(b, score);
        localStorage.setItem(BEST_KEY, String(nb));
        return nb;
      });
    }
  }, [phase, score]);

  const press = useCallback(
    (ch) => {
      if (phase !== 'playing') return;
      setTaps((n) => n + 1);
      const expected = lang === 'en' ? word[charIndex]?.toLowerCase() : word[charIndex];
      const typed = lang === 'en' ? ch.toLowerCase() : ch;
      if (typed === expected) {
        setCorrect((n) => n + 1);
        const next = charIndex + 1;
        if (next >= word.length) {
          setScore((s) => s + 10 + word.length);
          setWordsDone((w) => w + 1);
          setCharIndex(0);
          setWord((prev) => randWord(lang, prev));
        } else {
          setCharIndex(next);
        }
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 200);
      }
    },
    [phase, lang, word, charIndex]
  );

  const accuracy = taps > 0 ? Math.round((correct / taps) * 100) : 100;
  const stars = score >= 200 ? 3 : score >= 100 ? 2 : score > 0 ? 1 : 0;

  return (
    <div>
      <h2 style={{ color: theme.colors.text, fontSize: '1.6rem', textAlign: 'center' }}>
        📱 משחק מהירות הקלדה
      </h2>

      {phase === 'ready' && (
        <Center>
          <p style={{ color: theme.colors.textLight, maxWidth: 420 }}>
            הקלידו כמה שיותר מילים תוך {GAME_SECONDS} שניות! כל מילה נכונה מזכה בנקודות.
            בחרו שפה והתחילו.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button $variant={lang === 'he' ? 'primary' : 'ghost'} $small onClick={() => setLang('he')}>
              עברית
            </Button>
            <Button $variant={lang === 'en' ? 'primary' : 'ghost'} $small onClick={() => setLang('en')}>
              English
            </Button>
          </div>
          <Button onClick={start}>התחל משחק 🚀</Button>
          {best > 0 && <div style={{ color: theme.colors.textLight }}>שיא אישי: {best} נקודות</div>}
        </Center>
      )}

      {phase === 'playing' && (
        <Phone>
          <Screen>
            <TopBar $low={timeLeft <= 10}>
              <span>⭐ {score}</span>
              <span className="time">⏱️ {timeLeft}</span>
            </TopBar>
            <WordBox
              $lang={lang}
              animate={shake ? { x: [0, -8, 8, -6, 0] } : { x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {word.split('').map((c, i) => (
                <Ch key={i} $done={i < charIndex} $current={i === charIndex}>
                  {c}
                </Ch>
              ))}
            </WordBox>
            <Keys>
              {keyboardRows.map((row, ri) => (
                <KRow key={ri}>
                  {row.map((k) => (
                    <KeyBtn
                      key={k.en}
                      whileTap={{ scale: 0.9, backgroundColor: theme.colors.accent }}
                      onClick={() => press(k[lang])}
                    >
                      {k[lang]}
                    </KeyBtn>
                  ))}
                </KRow>
              ))}
              <KRow>
                <WideBtn whileTap={{ scale: 0.97 }} onClick={() => press(' ')}>
                  רווח
                </WideBtn>
              </KRow>
            </Keys>
          </Screen>
        </Phone>
      )}

      <AnimatePresence>
        {phase === 'over' && (
          <Center as={motion.div} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card style={{ textAlign: 'center', maxWidth: 420 }}>
              <div style={{ fontSize: '3rem' }}>🏁</div>
              <h2 style={{ color: theme.colors.text }}>נגמר הזמן!</h2>
              <Stars value={stars} size="2rem" />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem 0' }}>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.colors.primary }}>{score}</div><div style={{ color: theme.colors.textLight }}>נקודות</div></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.colors.primary }}>{wordsDone}</div><div style={{ color: theme.colors.textLight }}>מילים</div></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.colors.primary }}>{accuracy}%</div><div style={{ color: theme.colors.textLight }}>דיוק</div></div>
              </div>
              {score >= best && score > 0 && (
                <div style={{ color: theme.colors.success, fontWeight: 700 }}>🎉 שיא חדש!</div>
              )}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                <Button onClick={start}>שחק שוב 🔁</Button>
                <Button $variant="ghost" onClick={() => setPhase('ready')}>תפריט</Button>
              </div>
            </Card>
          </Center>
        )}
      </AnimatePresence>
    </div>
  );
}
