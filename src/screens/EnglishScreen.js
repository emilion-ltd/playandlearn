import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import QuizGame from '../components/common/QuizGame';
import { englishCategories, makeEnglishQuestions } from '../data/english';
import { theme } from '../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.4rem;
  h2 { color: ${theme.colors.text}; font-size: 1.8rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
`;

const CatCard = styled(motion.button)`
  border: none;
  cursor: pointer;
  border-radius: ${theme.radius.lg};
  padding: 1.5rem 1rem;
  text-align: center;
  background: ${(p) => p.$color + '18'};
  border: 2px solid ${(p) => p.$color};
  font-family: ${theme.font};
  box-shadow: ${theme.shadow.sm};
  .emoji { font-size: 2.8rem; }
  .label { font-weight: 800; font-size: 1.2rem; color: ${(p) => p.$color}; margin-top: 0.4rem; }
  .count { font-size: 0.8rem; color: ${theme.colors.textLight}; }
`;

export default function EnglishScreen() {
  const [category, setCategory] = useState(null);
  const makeQuestions = useCallback(() => makeEnglishQuestions(category), [category]);

  if (category) {
    const cat = englishCategories.find((c) => c.id === category);
    return (
      <QuizGame
        gameId="english"
        title={`אנגלית · ${cat.label}`}
        emoji={cat.emoji}
        color={cat.color}
        makeQuestions={makeQuestions}
        onExit={() => setCategory(null)}
        encourage={['Great! 🎉', 'Excellent! 💪', 'Well done! ⭐', 'Perfect! 🚀']}
      />
    );
  }

  return (
    <div>
      <Head>
        <h2>🇬🇧 אנגלית - אוצר מילים</h2>
        <p>בחרו קטגוריה והתאימו את המילה הנכונה באנגלית</p>
      </Head>
      <Grid>
        {englishCategories.map((c) => (
          <CatCard
            key={c.id}
            $color={c.color}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setCategory(c.id)}
          >
            <div className="emoji">{c.emoji}</div>
            <div className="label">{c.label}</div>
            <div className="count">{c.words.length} מילים</div>
          </CatCard>
        ))}
      </Grid>
    </div>
  );
}
