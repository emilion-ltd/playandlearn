import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { PlayersProvider, usePlayers } from './context/PlayersContext';
import { PlayerModalRoot } from './components/player/PlayerModal';
import CelebrationOverlay from './components/player/CelebrationOverlay';
import ShareBar from './components/common/ShareBar';
import Icon from './components/common/Icon';
import { theme } from './theme';

import HomeScreen from './screens/HomeScreen';
import GradeScreen from './screens/GradeScreen';
import LettersScreen from './screens/LettersScreen';
import TypingHomeScreen from './screens/typing/TypingHomeScreen';
import TypingTrackScreen from './screens/typing/TypingTrackScreen';
import TypingLessonScreen from './screens/typing/TypingLessonScreen';
import MobileTypingGame from './screens/typing/MobileTypingGame';
import ReadingHomeScreen from './screens/reading/ReadingHomeScreen';
import CharacterSelectScreen from './screens/reading/CharacterSelectScreen';
import StageSelectScreen from './screens/reading/StageSelectScreen';
import ReadingGameScreen from './screens/reading/ReadingGameScreen';
import MathScreen from './screens/MathScreen';
import EnglishScreen from './screens/EnglishScreen';
import ScienceScreen from './screens/ScienceScreen';
import MusicHomeScreen from './screens/music/MusicHomeScreen';
import FreePlayScreen from './screens/music/FreePlayScreen';
import NotesLearnScreen from './screens/music/NotesLearnScreen';
import SongListScreen from './screens/music/SongListScreen';
import SongPlayScreen from './screens/music/SongPlayScreen';
import ArtScreen from './screens/ArtScreen';
import RecordsScreen from './screens/RecordsScreen';

const float = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -30px) scale(1.08); }
`;

const GlobalStyle = createGlobalStyle`
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { direction: rtl; }
  body {
    font-family: ${theme.font};
    color: ${theme.colors.text};
    min-height: 100vh;
    background:
      radial-gradient(1200px 600px at 85% -5%, #e8ecff 0%, transparent 55%),
      radial-gradient(900px 500px at 5% 10%, #ffe9f3 0%, transparent 50%),
      linear-gradient(180deg, #fbfcff 0%, #f4f6ff 100%);
    background-attachment: fixed;
    font-weight: 400;
  }
  h1, h2, h3, h4 { font-family: ${theme.display}; font-weight: 400; line-height: 1.15; }
  strong, b { font-weight: 600; }
  button { font-family: ${theme.font}; }
  ::selection { background: ${theme.colors.primary}33; }
`;

// כתמי רקע דקורטיביים מטושטשים (אווירה ייחודית, לא גנרי)
const Blobs = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  span {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.4;
    animation: ${float} 16s ease-in-out infinite;
  }
  .b1 { width: 340px; height: 340px; background: #8aa0ff; top: -80px; right: -60px; }
  .b2 { width: 300px; height: 300px; background: #ffadd6; bottom: 6%; left: -70px; animation-delay: 4s; }
  .b3 { width: 240px; height: 240px; background: #9ce0c0; top: 40%; right: 30%; animation-delay: 8s; }
`;

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  position: sticky;
  top: 12px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  margin: 12px 0 1.4rem;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: ${theme.radius.pill};
  box-shadow: ${theme.shadow.md};
`;

const Brand = styled.div`
  font-family: ${theme.display};
  font-size: 1.25rem;
  color: ${theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  .logo {
    width: 38px; height: 38px;
    border-radius: 11px;
    box-shadow: ${theme.shadow.glow};
    object-fit: cover;
    display: block;
  }
  .txt { background: linear-gradient(90deg, ${theme.colors.primary}, #b052e0); -webkit-background-clip: text; background-clip: text; color: transparent; }
  @media (max-width: 520px) { .txt { display: none; } }
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const IconBtn = styled.button`
  border: none;
  background: #fff;
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  width: 40px; height: 40px;
  border-radius: ${theme.radius.pill};
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  display: grid; place-items: center;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: ${theme.shadow.sm}; }
`;

const PlayerChip = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: linear-gradient(135deg, ${theme.colors.primary}, #8a6bff);
  color: #fff;
  padding: 0.35rem 0.5rem 0.35rem 0.85rem;
  border-radius: ${theme.radius.pill};
  cursor: pointer;
  font-family: ${theme.font};
  font-weight: 600;
  box-shadow: ${theme.shadow.glow};
  transition: transform 0.15s;
  &:hover { transform: translateY(-2px); }
  .av { font-size: 1.25rem; background: rgba(255,255,255,0.25); border-radius: 50%; width: 30px; height: 30px; display: grid; place-items: center; }
  .info { display: flex; flex-direction: column; line-height: 1.05; text-align: right; }
  .nm { font-size: 0.9rem; }
  .pt { font-size: 0.72rem; opacity: 0.92; }
  @media (max-width: 520px) { .info { display: none; } padding: 0.35rem; }
`;

const Main = styled(motion.main)`
  flex: 1;
`;

const Footer = styled.footer`
  margin-top: 3rem;
  padding: 1.6rem 1rem 2rem;
  border-top: 1px solid ${theme.colors.border};
  text-align: center;
  color: ${theme.colors.textLight};
  .row { display: flex; gap: 1.2rem; justify-content: center; flex-wrap: wrap; margin-bottom: 0.6rem; }
  .row span { display: inline-flex; align-items: center; gap: 5px; font-weight: 500; }
  .copy { font-size: 0.85rem; opacity: 0.8; }
  .rights { font-size: 0.78rem; opacity: 0.6; margin-top: 0.35rem; }
  .heart { color: ${theme.colors.error}; }
`;

function renderScreen(current) {
  const { screen, params } = current;
  switch (screen) {
    case 'home':
      return <HomeScreen />;
    case 'grade':
      return <GradeScreen grade={params.grade} />;
    case 'records':
      return <RecordsScreen />;
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
    case 'reading-home':
      return <ReadingHomeScreen />;
    case 'reading-character':
      return <CharacterSelectScreen />;
    case 'reading-stage':
      return <StageSelectScreen character={params.character} />;
    case 'reading-game':
      return <ReadingGameScreen character={params.character} stage={params.stage} />;
    case 'math':
      return <MathScreen grade={params.grade} />;
    case 'english':
      return <EnglishScreen />;
    case 'science':
      return <ScienceScreen />;
    case 'music-home':
      return <MusicHomeScreen />;
    case 'music-free':
      return <FreePlayScreen />;
    case 'music-notes':
      return <NotesLearnScreen />;
    case 'music-songs':
      return <SongListScreen level={params.level} />;
    case 'music-play':
      return <SongPlayScreen songId={params.songId} />;
    case 'art':
      return <ArtScreen />;
    default:
      return <HomeScreen />;
  }
}

function AppInner() {
  const { current, canGoBack, goBack, goHome, navigate } = useApp();
  const { currentPlayer, players } = usePlayers();
  const [modal, setModal] = useState(false);
  const screenKey = current.screen + JSON.stringify(current.params);

  // בכניסה ראשונה ללא שחקנים - פתיחת יצירת שחקן
  const [askedOnce, setAskedOnce] = useState(false);
  useEffect(() => {
    if (players.length === 0 && !askedOnce) {
      setModal(true);
      setAskedOnce(true);
    }
  }, [players.length, askedOnce]);

  return (
    <>
      <Blobs>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </Blobs>
      <Shell>
        <TopBar>
          <Brand onClick={goHome}>
            <img className="logo" src={`${process.env.PUBLIC_URL}/logo.png`} alt="עולם הלמידה" />
            <span className="txt">עולם הלמידה</span>
          </Brand>
          <NavGroup>
            {canGoBack && <IconBtn onClick={goBack} title="חזרה">←</IconBtn>}
            <IconBtn onClick={goHome} title="בית"><Icon name="home" color={theme.colors.text} size={24} /></IconBtn>
            <IconBtn onClick={() => navigate('records')} title="אלופים ושיאים"><Icon name="trophy" color={theme.colors.accent} size={24} /></IconBtn>
            <PlayerChip onClick={() => setModal(true)}>
              <span className="av">{currentPlayer?.emoji || '👤'}</span>
              <span className="info">
                <span className="nm">{currentPlayer?.name || 'התחבר'}</span>
                <span className="pt">⭐ {currentPlayer?.points || 0}</span>
              </span>
            </PlayerChip>
          </NavGroup>
        </TopBar>

        <AnimatePresence mode="wait">
          <Main
            key={screenKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderScreen(current)}
          </Main>
        </AnimatePresence>

        <Footer>
          <div style={{ marginBottom: '1.4rem' }}>
            <ShareBar />
          </div>
          <div className="row">
            <span>🎓 למידה</span>
            <span>🎮 משחקים</span>
            <span>🏆 שיאים</span>
            <span>🎹 מוסיקה</span>
          </div>
          <div className="copy">
            נבנה באהבה <span className="heart">♥</span> לילדים סקרנים · עולם הלמידה {new Date().getFullYear()}
          </div>
          <div className="rights">זכויות יוצרים © רומי &amp; עילי 2024</div>
        </Footer>
      </Shell>

      <PlayerModalRoot open={modal} onClose={() => setModal(false)} />
      <CelebrationOverlay />
    </>
  );
}

export default function App() {
  return (
    <>
      <GlobalStyle />
      <AppProvider>
        <PlayersProvider>
          <AppInner />
        </PlayersProvider>
      </AppProvider>
    </>
  );
}
