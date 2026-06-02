import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { grades, gradeMeta, subjects } from '../data/curriculum';
import { theme } from '../theme';

const Hero = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  h1 { font-size: clamp(2rem, 5vw, 2.8rem); color: ${theme.colors.text}; }
  p { color: ${theme.colors.textLight}; font-size: 1.1rem; margin-top: 0.5rem; }
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.text};
  font-size: 1.4rem;
  margin: 1.5rem 0 1rem;
`;

const GradeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const GradeCard = styled(motion.div)`
  cursor: pointer;
  border-radius: ${theme.radius.lg};
  padding: 1.5rem 1rem;
  text-align: center;
  color: #fff;
  background: ${(p) => `linear-gradient(135deg, ${p.$main}, ${p.$main}cc)`};
  box-shadow: ${theme.shadow.md};
  .emoji { font-size: 2.6rem; }
  .label { font-size: 1.3rem; font-weight: 800; margin-top: 0.4rem; }
  .age { font-size: 0.85rem; opacity: 0.9; }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const FeatureCard = styled(Card)`
  cursor: ${(p) => (p.$soon ? 'default' : 'pointer')};
  opacity: ${(p) => (p.$soon ? 0.6 : 1)};
  display: flex;
  gap: 0.9rem;
  align-items: center;
  text-align: right;
  border-right: 6px solid ${(p) => p.$color};
  .emoji { font-size: 2.4rem; }
  h3 { color: ${theme.colors.text}; font-size: 1.15rem; }
  p { color: ${theme.colors.textLight}; font-size: 0.85rem; }
`;

export default function HomeScreen() {
  const { navigate } = useApp();
  const featured = subjects.filter((s) => !s.comingSoon);

  return (
    <div>
      <Hero>
        <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          🎓 עולם הלמידה
        </motion.h1>
        <p>משחקים ושיעורים מהנים לכל כיתה - בואו נלמד ביחד!</p>
      </Hero>

      <SectionTitle>בחרו כיתה</SectionTitle>
      <GradeGrid>
        {grades.map((g, i) => {
          const meta = gradeMeta[g];
          const colors = theme.grades[g];
          return (
            <GradeCard
              key={g}
              $main={colors.main}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('grade', { grade: g })}
            >
              <div className="emoji">{meta.emoji}</div>
              <div className="label">{meta.label}</div>
              <div className="age">{meta.age}</div>
            </GradeCard>
          );
        })}
      </GradeGrid>

      <SectionTitle>נושאים מובילים</SectionTitle>
      <FeatureGrid>
        {featured.map((s) => (
          <FeatureCard
            as={motion.div}
            key={s.id}
            $color={s.color}
            whileHover={{ x: -4 }}
            onClick={() => navigate(s.screen)}
          >
            <div className="emoji">{s.emoji}</div>
            <div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          </FeatureCard>
        ))}
      </FeatureGrid>
    </div>
  );
}
