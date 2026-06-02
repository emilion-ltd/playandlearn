import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { characters } from '../../data/reading/characters';
import { saveSelectedCharacter, getSelectedCharacter } from '../../data/reading/readingStorage';
import { theme } from '../../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  h2 { color: ${theme.colors.text}; font-size: 1.8rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CharCard = styled(motion.div)`
  position: relative;
  cursor: pointer;
  border-radius: ${theme.radius.lg};
  padding: 1.3rem;
  text-align: center;
  background: ${(p) => p.$color + '18'};
  border: ${(p) => (p.$selected ? '3px' : '2px')} solid ${(p) => p.$color};
  box-shadow: ${(p) => (p.$selected ? theme.shadow.md : theme.shadow.sm)};
  .emoji { font-size: 3.6rem; margin-bottom: 0.5rem; }
  h3 { font-size: 1.15rem; margin-bottom: 0.3rem; color: ${(p) => p.$color}; }
  p { font-size: 0.82rem; color: ${theme.colors.text}; line-height: 1.4; }
`;

const SelectedTag = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  background: ${theme.colors.success};
  color: #fff;
  border-radius: ${theme.radius.pill};
  padding: 0.2rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: ${theme.shadow.sm};
`;

export default function CharacterSelectScreen() {
  const { navigate } = useApp();
  const [selected, setSelected] = useState(getSelectedCharacter());

  const cont = () => {
    if (selected) {
      saveSelectedCharacter(selected);
      navigate('reading-stage', { character: selected });
    }
  };

  return (
    <div>
      <Head>
        <h2>🌟 בחר את הדמות שלך! 🌟</h2>
        <p>עם מי תרצה לצאת להרפתקה?</p>
      </Head>

      <Grid>
        {characters.map((c, i) => (
          <CharCard
            key={c.id}
            $color={c.color}
            $selected={selected === c.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelected(c.id)}
          >
            {selected === c.id && <SelectedTag>✓ נבחר</SelectedTag>}
            <div className="emoji">{c.emoji}</div>
            <h3>{c.name}</h3>
            <p>{c.description}</p>
          </CharCard>
        ))}
      </Grid>

      <div style={{ textAlign: 'center' }}>
        <Button onClick={cont} disabled={!selected}>
          המשך לבחירת שלב →
        </Button>
      </div>
    </div>
  );
}
