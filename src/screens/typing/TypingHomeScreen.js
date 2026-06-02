import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { lessonsByLang } from '../../data/typing/lessons';
import { theme } from '../../theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.2rem;
  margin-top: 1.5rem;
`;

const TrackCard = styled(Card)`
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  border-top: 6px solid ${(p) => p.$color};
  .emoji { font-size: 3.2rem; }
  h3 { color: ${theme.colors.text}; font-size: 1.4rem; }
  p { color: ${theme.colors.textLight}; font-size: 0.95rem; }
  .meta { color: ${(p) => p.$color}; font-weight: 700; font-size: 0.9rem; }
`;

const Intro = styled(Card)`
  margin-top: 0.5rem;
  text-align: right;
  background: linear-gradient(135deg, #eef1ff, #fff);
  p { color: ${theme.colors.textLight}; line-height: 1.7; }
  strong { color: ${theme.colors.primary}; }
`;

export default function TypingHomeScreen() {
  const { navigate, getLessonProgress } = useApp();

  const countDone = (lang) =>
    lessonsByLang[lang].filter((l) => getLessonProgress(l.id).completed).length;

  const tracks = [
    {
      lang: 'he',
      title: 'הקלדה בעברית',
      emoji: '🇮🇱',
      color: '#5b6cf9',
      desc: 'לומדים את פריסת המקלדת העברית - אות אחרי אות',
    },
    {
      lang: 'en',
      title: 'Typing in English',
      emoji: '🇬🇧',
      color: '#22b8cf',
      desc: 'Learn the English keyboard - letter by letter',
    },
  ];

  return (
    <div>
      <h2 style={{ color: theme.colors.text, fontSize: '1.8rem' }}>⌨️ קורס הקלדה עיוורת</h2>
      <Intro initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p>
          בקורס הזה תלמדו להקליד <strong>בלי להסתכל על המקלדת</strong>! 
          כל אצבע אחראית על מקשים מסוימים, וצבע מיוחד יעזור לכם לזכור.
          מניחים את שתי הידיים על שורת הבית, מסתכלים על המסך - ומתחילים. 🚀
        </p>
      </Intro>

      <Grid>
        {tracks.map((t) => {
          const total = lessonsByLang[t.lang].length;
          const done = countDone(t.lang);
          return (
            <TrackCard
              as={motion.div}
              key={t.lang}
              $color={t.color}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('typing-track', { lang: t.lang })}
            >
              <div className="emoji">{t.emoji}</div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <div className="meta">{done}/{total} שיעורים הושלמו</div>
            </TrackCard>
          );
        })}

        <TrackCard
          as={motion.div}
          $color={theme.colors.secondary}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('typing-mobile')}
        >
          <div className="emoji">📱</div>
          <h3>משחק מהירות בנייד</h3>
          <p>הקלדה מהירה על מקלדת הטלפון - אספו נקודות נגד השעון!</p>
          <div className="meta">משחק אתגר</div>
        </TrackCard>
      </Grid>
    </div>
  );
}
