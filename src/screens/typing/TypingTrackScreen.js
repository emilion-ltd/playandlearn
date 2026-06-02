import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card, Stars, Badge } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { lessonsByLang } from '../../data/typing/lessons';
import { theme } from '../../theme';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 1.2rem;
  max-width: 720px;
  margin-inline: auto;
`;

const LessonRow = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${(p) => (p.$locked ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$locked ? 0.55 : 1)};
  text-align: right;
  padding: 1rem 1.2rem;
`;

const Num = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${(p) => (p.$done ? theme.colors.success : theme.colors.primary)};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
`;

const Info = styled.div`
  flex: 1;
  h3 { color: ${theme.colors.text}; font-size: 1.15rem; margin-bottom: 2px; }
  p { color: ${theme.colors.textLight}; font-size: 0.9rem; }
`;

export default function TypingTrackScreen({ lang }) {
  const { navigate, getLessonProgress } = useApp();
  const lessons = lessonsByLang[lang];
  const title = lang === 'he' ? 'הקלדה בעברית' : 'Typing in English';

  return (
    <div>
      <h2 style={{ color: theme.colors.text, fontSize: '1.7rem' }}>{title}</h2>
      <List>
        {lessons.map((lesson, i) => {
          const prog = getLessonProgress(lesson.id);
          // השיעור הראשון תמיד פתוח; הבאים נפתחים אחרי השלמת הקודם
          const prevDone = i === 0 || getLessonProgress(lessons[i - 1].id).completed;
          const locked = !prevDone;
          return (
            <LessonRow
              as={motion.div}
              key={lesson.id}
              $locked={locked}
              $done={prog.completed}
              whileHover={locked ? {} : { x: -4 }}
              onClick={() => !locked && navigate('typing-lesson', { lang, lessonId: lesson.id })}
            >
              <Num $done={prog.completed}>{prog.completed ? '✓' : i + 1}</Num>
              <Info>
                <h3>{lesson.title}</h3>
                <p>{lesson.subtitle}</p>
              </Info>
              {locked ? (
                <Badge>🔒 נעול</Badge>
              ) : prog.completed ? (
                <div style={{ textAlign: 'center' }}>
                  <Stars value={prog.stars} />
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textLight }}>
                    {prog.bestWpm} מל״ד
                  </div>
                </div>
              ) : (
                <Badge $bg={theme.colors.accent}>התחל</Badge>
              )}
            </LessonRow>
          );
        })}
      </List>
    </div>
  );
}
