import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getQuestionsByStage } from '../../data/reading/questions';
import { getTotalStars } from '../../data/reading/readingStorage';
import { theme } from '../../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.2rem;
  h2 { color: ${theme.colors.text}; font-size: 1.9rem; }
  p { color: ${theme.colors.textLight}; }
`;

const StarsPill = styled.div`
  margin: 0 auto 1.5rem;
  width: fit-content;
  background: #fff;
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.sm};
  padding: 0.6rem 1.4rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ca8a04;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
  max-width: 640px;
  margin: 0 auto;
`;

const StageBtn = styled(motion.button)`
  position: relative;
  overflow: hidden;
  border: none;
  cursor: pointer;
  border-radius: ${theme.radius.lg};
  padding: 2rem 1.5rem;
  color: #fff;
  text-align: center;
  background: ${(p) => p.$gradient};
  box-shadow: ${theme.shadow.md};
  font-family: ${theme.font};
  .big { font-size: 3.4rem; }
  h3 { font-size: 1.6rem; margin: 0.4rem 0; }
  .sub { opacity: 0.9; margin-bottom: 0.8rem; }
  .info { background: rgba(255,255,255,0.2); border-radius: ${theme.radius.sm}; padding: 0.6rem; font-size: 0.9rem; }
  .deco { position: absolute; top: -10px; left: 10px; font-size: 6rem; opacity: 0.15; }
`;

export default function StageSelectScreen({ character }) {
  const { navigate } = useApp();
  const totalStars = getTotalStars();
  const stage1 = getQuestionsByStage(1).length;
  const stage2 = getQuestionsByStage(2).length;

  const go = (stage) => navigate('reading-game', { character, stage });

  return (
    <div>
      <Head>
        <h2>🎯 בחר שלב</h2>
        <p>כל שלב מכיל שאלות מרתקות!</p>
      </Head>

      <StarsPill>⭐ {totalStars} כוכבים</StarsPill>

      <Grid>
        <StageBtn
          $gradient="linear-gradient(135deg, #60a5fa, #2563eb)"
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => go(1)}
        >
          <div className="deco">🌟</div>
          <div className="big">1️⃣</div>
          <h3>שלב 1</h3>
          <div className="sub">שאלות בסיסיות</div>
          <div className="info">📝 {stage1} שאלות · ⭐ עד 39 כוכבים</div>
        </StageBtn>

        <StageBtn
          $gradient="linear-gradient(135deg, #c084fc, #7c3aed)"
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => go(2)}
        >
          <div className="deco">🏆</div>
          <div className="big">2️⃣</div>
          <h3>שלב 2</h3>
          <div className="sub">שאלות מתקדמות</div>
          <div className="info">📝 {stage2} שאלות · ⭐ עד 39 כוכבים</div>
        </StageBtn>
      </Grid>
    </div>
  );
}
