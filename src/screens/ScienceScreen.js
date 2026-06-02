import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import QuizGame from '../components/common/QuizGame';
import { scienceTopics, makeScienceQuestions } from '../data/science';
import { theme } from '../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.4rem;
  h2 { color: ${theme.colors.text}; font-size: 1.8rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
`;

const TopicCard = styled(motion.button)`
  border: none;
  cursor: pointer;
  border-radius: ${theme.radius.lg};
  padding: 1.6rem 1rem;
  text-align: center;
  color: #fff;
  background: ${(p) => `linear-gradient(135deg, ${p.$color}, ${p.$color}cc)`};
  font-family: ${theme.font};
  box-shadow: ${theme.shadow.md};
  .emoji { font-size: 3rem; }
  .label { font-weight: 800; font-size: 1.25rem; margin-top: 0.4rem; }
  .count { font-size: 0.8rem; opacity: 0.9; }
`;

export default function ScienceScreen() {
  const [topic, setTopic] = useState(null);
  const makeQuestions = useCallback(() => makeScienceQuestions(topic), [topic]);

  if (topic) {
    const t = scienceTopics.find((x) => x.id === topic);
    return (
      <QuizGame
        gameId="science"
        title={`מדע · ${t.label}`}
        emoji={t.emoji}
        color={t.color}
        makeQuestions={makeQuestions}
        onExit={() => setTopic(null)}
        encourage={['גילוי מצוין! 🔬', 'נכון! 🎉', 'חוקר אמיתי! 💡', 'כל הכבוד! ⭐']}
      />
    );
  }

  return (
    <div>
      <Head>
        <h2>🔬 מדע וטבע</h2>
        <p>בחרו נושא וגלו עובדות מרתקות על העולם</p>
      </Head>
      <Grid>
        {scienceTopics.map((t) => (
          <TopicCard
            key={t.id}
            $color={t.color}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setTopic(t.id)}
          >
            <div className="emoji">{t.emoji}</div>
            <div className="label">{t.label}</div>
            <div className="count">{t.questions.length} שאלות</div>
          </TopicCard>
        ))}
      </Grid>
    </div>
  );
}
