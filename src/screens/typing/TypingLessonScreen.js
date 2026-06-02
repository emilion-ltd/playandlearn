import React from 'react';
import styled from 'styled-components';
import TypingLesson from '../../components/typing/TypingLesson';
import { useApp } from '../../context/AppContext';
import { lessonsByLang } from '../../data/typing/lessons';
import { theme } from '../../theme';

const Header = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  h2 { color: ${theme.colors.text}; font-size: 1.5rem; }
  p { color: ${theme.colors.textLight}; }
`;

export default function TypingLessonScreen({ lang, lessonId }) {
  const { navigate, goBack, saveLessonResult } = useApp();
  const lessons = lessonsByLang[lang];
  const index = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[index];
  const hasNext = index < lessons.length - 1;

  if (!lesson) {
    return <div>השיעור לא נמצא</div>;
  }

  const lessonWithLang = { ...lesson, lang };

  const handleComplete = (res) => {
    saveLessonResult(lesson.id, res);
  };

  const handleNext = () => {
    if (hasNext) {
      navigate('typing-lesson', { lang, lessonId: lessons[index + 1].id });
    }
  };

  return (
    <div>
      <Header>
        <h2>{lesson.title}</h2>
        <p>{lesson.subtitle}</p>
      </Header>
      <TypingLesson
        key={lesson.id}
        lesson={lessonWithLang}
        onComplete={handleComplete}
        onNext={handleNext}
        onExit={goBack}
        hasNext={hasNext}
      />
    </div>
  );
}
