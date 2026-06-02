import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { songsByLevel } from '../../data/music/songs';
import { theme } from '../../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.2rem;
  h2 { color: ${theme.colors.text}; font-size: 1.7rem; }
  p { color: ${theme.colors.textLight}; }
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  max-width: 700px;
  margin: 0 auto;
`;

const SongCard = styled(Card)`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  text-align: right;
  .emoji { font-size: 2.4rem; }
  h3 { color: ${theme.colors.text}; font-size: 1.15rem; }
  p { color: ${theme.colors.textLight}; font-size: 0.85rem; }
`;

export default function SongListScreen({ level }) {
  const { navigate } = useApp();
  const list = songsByLevel(level);
  const title = level === 'beginner' ? '⭐ שירים למתחילים' : '🏆 שירים למתקדמים';

  return (
    <div>
      <Head>
        <h2>{title}</h2>
        <p>בחרו שיר ונגנו אותו צעד אחר צעד</p>
      </Head>
      <List>
        {list.map((s) => (
          <SongCard
            as={motion.div}
            key={s.id}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('music-play', { songId: s.id })}
          >
            <div className="emoji">{s.emoji}</div>
            <div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </SongCard>
        ))}
      </List>
    </div>
  );
}
