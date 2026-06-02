import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card, Badge } from '../components/common/UI';
import Icon from '../components/common/Icon';
import { useApp } from '../context/AppContext';
import { gradeMeta, subjectsForGrade } from '../data/curriculum';
import { theme } from '../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  .emoji { font-size: 3rem; }
  h2 { color: ${theme.colors.text}; font-size: 1.9rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.2rem;
`;

const SubjectCard = styled(Card)`
  cursor: ${(p) => (p.$soon ? 'default' : 'pointer')};
  opacity: ${(p) => (p.$soon ? 0.65 : 1)};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-top: 6px solid ${(p) => p.$color};
  position: relative;
  .ico { background: ${(p) => p.$color}14; border-radius: 18px; padding: 12px; display: grid; place-items: center; }
  h3 { color: ${theme.colors.text}; font-size: 1.3rem; }
  p { color: ${theme.colors.textLight}; font-size: 0.9rem; }
`;

const SoonTag = styled(Badge)`
  position: absolute;
  top: 12px;
  left: 12px;
`;

export default function GradeScreen({ grade }) {
  const { navigate } = useApp();
  const meta = gradeMeta[grade];
  const list = subjectsForGrade(grade);
  const colors = theme.grades[grade];

  return (
    <div>
      <Head>
        <Icon name="sprout" color={colors.main} size={56} />
        <h2 style={{ color: colors.main }}>{meta.label}</h2>
        <p>{meta.age} · בחרו נושא ללמידה</p>
      </Head>
      <Grid>
        {list.map((s) => (
          <SubjectCard
            as={motion.div}
            key={s.id}
            $color={s.color}
            $soon={s.comingSoon}
            whileHover={s.comingSoon ? {} : { y: -6 }}
            whileTap={s.comingSoon ? {} : { scale: 0.98 }}
            onClick={() => !s.comingSoon && navigate(s.screen, { grade })}
          >
            {s.comingSoon && <SoonTag $bg={theme.colors.accent}>בקרוב</SoonTag>}
            <div className="ico"><Icon name={s.id} color={s.color} size={48} /></div>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </SubjectCard>
        ))}
      </Grid>
    </div>
  );
}
