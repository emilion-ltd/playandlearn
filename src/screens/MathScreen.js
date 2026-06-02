import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import QuizGame from '../components/common/QuizGame';
import { Button } from '../components/common/UI';
import { mathOps, mathLevels, makeMathQuestions, defaultLevelForGrade } from '../data/math';
import { theme } from '../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.2rem;
  h2 { color: ${theme.colors.text}; font-size: 1.8rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Section = styled.div`
  margin-bottom: 1.4rem;
  h3 { color: ${theme.colors.text}; font-size: 1.1rem; margin-bottom: 0.6rem; text-align: center; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
  max-width: 560px;
  margin: 0 auto;
`;

const Choice = styled(motion.button)`
  border: 3px solid ${(p) => (p.$active ? p.$color : '#e4e8f5')};
  background: ${(p) => (p.$active ? p.$color + '22' : '#fff')};
  border-radius: ${theme.radius.md};
  padding: 1rem 0.5rem;
  cursor: pointer;
  font-family: ${theme.font};
  box-shadow: ${theme.shadow.sm};
  .emoji { font-size: 2rem; }
  .label { font-weight: 800; color: ${theme.colors.text}; margin-top: 0.3rem; }
`;

export default function MathScreen({ grade }) {
  const [op, setOp] = useState('add');
  const [level, setLevel] = useState(grade ? defaultLevelForGrade(grade) : 1);
  const [playing, setPlaying] = useState(false);

  const makeQuestions = useCallback(() => makeMathQuestions(op, level), [op, level]);

  if (playing) {
    const opMeta = mathOps.find((o) => o.id === op);
    return (
      <QuizGame
        gameId="math"
        title={`חשבון · ${opMeta.label}`}
        emoji={opMeta.emoji}
        color={opMeta.color}
        makeQuestions={makeQuestions}
        onExit={() => setPlaying(false)}
        encourage={['נכון מאוד! 🎉', 'מעולה! 💪', 'כל הכבוד! ⭐', 'אלוף חשבון! 🚀']}
      />
    );
  }

  const opColor = mathOps.find((o) => o.id === op).color;

  return (
    <div>
      <Head>
        <h2>🔢 חשבון וחשיבה</h2>
        <p>בחרו פעולה ורמת קושי, ופתרו 10 תרגילים</p>
      </Head>

      <Section>
        <h3>איזו פעולה?</h3>
        <Grid>
          {mathOps.map((o) => (
            <Choice
              key={o.id}
              $active={op === o.id}
              $color={o.color}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setOp(o.id)}
            >
              <div className="emoji">{o.emoji}</div>
              <div className="label">{o.label}</div>
            </Choice>
          ))}
        </Grid>
      </Section>

      <Section>
        <h3>רמת קושי</h3>
        <Grid style={{ maxWidth: 420 }}>
          {mathLevels.map((l) => (
            <Choice
              key={l.id}
              $active={level === l.id}
              $color={opColor}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLevel(l.id)}
            >
              <div className="emoji">{l.emoji}</div>
              <div className="label">{l.label}</div>
            </Choice>
          ))}
        </Grid>
      </Section>

      <div style={{ textAlign: 'center' }}>
        <Button onClick={() => setPlaying(true)} style={{ background: opColor }}>
          התחל לשחק 🚀
        </Button>
      </div>
    </div>
  );
}
