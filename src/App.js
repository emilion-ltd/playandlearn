import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { theme } from './theme';

import HomeScreen from './screens/HomeScreen';
import GradeScreen from './screens/GradeScreen';
import LettersScreen from './screens/LettersScreen';
import TypingHomeScreen from './screens/typing/TypingHomeScreen';
import TypingTrackScreen from './screens/typing/TypingTrackScreen';
import TypingLessonScreen from './screens/typing/TypingLessonScreen';
import MobileTypingGame from './screens/typing/MobileTypingGame';

const GlobalStyle = createGlobalStyle`
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { direction: rtl; }
  body {
    font-family: ${theme.font};
    background: ${theme.colors.bg};
    color: ${theme.colors.text};
    min-height: 100vh;
  }
`;

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px 48px;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0;
  margin-bottom: 1rem;
  background: ${theme.colors.bg};
`;

const Brand = styled.div`
  font-weight: 800;
  font-size: 1.2rem;
  color: ${theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NavBtn = styled.button`
  border: none;
  background: ${theme.colors.card};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: ${theme.radius.pill};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: ${theme.font};
  &:hover { background: ${theme.colors.border}; }
`;

const NavGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

function renderScreen(current) {
  const { screen, params } = current;
  switch (screen) {
    case 'home':
      return <HomeScreen />;
    case 'grade':
      return <GradeScreen grade={params.grade} />;
    case 'letters':
      return <LettersScreen />;
    case 'typing-home':
      return <TypingHomeScreen />;
    case 'typing-track':
      return <TypingTrackScreen lang={params.lang} />;
    case 'typing-lesson':
      return <TypingLessonScreen lang={params.lang} lessonId={params.lessonId} />;
    case 'typing-mobile':
      return <MobileTypingGame />;
    default:
      return <HomeScreen />;
  }
}

function AppInner() {
  const { current, canGoBack, goBack, goHome } = useApp();
  const screenKey = current.screen + JSON.stringify(current.params);

  return (
    <Shell>
      <TopBar>
        <Brand onClick={goHome}>🎓 עולם הלמידה</Brand>
        <NavGroup>
          {canGoBack && <NavBtn onClick={goBack}>← חזרה</NavBtn>}
          <NavBtn onClick={goHome}>🏠 בית</NavBtn>
        </NavGroup>
      </TopBar>

      <AnimatePresence mode="wait">
        <motion.main
          key={screenKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {renderScreen(current)}
        </motion.main>
      </AnimatePresence>
    </Shell>
  );
}

export default function App() {
  return (
    <>
      <GlobalStyle />
      <AppProvider>
        <AppInner />
      </AppProvider>
    </>
  );
}
