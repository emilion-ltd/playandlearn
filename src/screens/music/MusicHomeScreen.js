import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { theme } from '../../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.4rem;
  h2 { color: ${theme.colors.text}; font-size: 1.9rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
`;

const Tile = styled(Card)`
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-top: 6px solid ${(p) => p.$color};
  .emoji { font-size: 3rem; }
  h3 { color: ${theme.colors.text}; font-size: 1.3rem; }
  p { color: ${theme.colors.textLight}; font-size: 0.9rem; }
`;

export default function MusicHomeScreen() {
  const { navigate } = useApp();

  const tiles = [
    { emoji: '🎹', title: 'פסנתר חופשי', desc: 'נגנו בחופשיות וגלו את הצלילים', color: '#e64980', go: () => navigate('music-free') },
    { emoji: '🎵', title: 'לומדים תווים', desc: 'הכירו את דו-רה-מי בצבעים', color: '#f1c40f', go: () => navigate('music-notes') },
    { emoji: '⭐', title: 'שירים למתחילים', desc: 'כוכב קטן, כבשה קטנה ועוד', color: '#51cf66', go: () => navigate('music-songs', { level: 'beginner' }) },
    { emoji: '🏆', title: 'שירים למתקדמים', desc: 'יום הולדת, המנון לשמחה ועוד', color: '#5b6cf9', go: () => navigate('music-songs', { level: 'advanced' }) },
  ];

  return (
    <div>
      <Head>
        <h2>🎹 מוסיקה ופסנתר</h2>
        <p>נגנו, למדו תווים, ונגנו שירים אמיתיים!</p>
      </Head>
      <Grid>
        {tiles.map((t, i) => (
          <Tile
            as={motion.div}
            key={i}
            $color={t.color}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={t.go}
          >
            <div className="emoji">{t.emoji}</div>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
          </Tile>
        ))}
      </Grid>
    </div>
  );
}
