import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button, Card } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { savePlayerName, getPlayerName, getTotalStars } from '../../data/reading/readingStorage';
import { theme } from '../../theme';

const Wrap = styled(Card)`
  max-width: 520px;
  margin: 1rem auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  background: linear-gradient(90deg, #a855f7, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1.2rem;
  text-align: center;
  border: 2px solid #d8b4fe;
  border-radius: ${theme.radius.md};
  font-family: ${theme.font};
  &:focus { outline: none; box-shadow: 0 0 0 4px #e9d5ff; }
`;

const Welcome = styled.div`
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: ${theme.radius.md};
  padding: 1rem;
  width: 100%;
  color: #166534;
  font-weight: 700;
`;

const Tip = styled.div`
  background: #faf5ff;
  border-radius: ${theme.radius.md};
  padding: 0.9rem;
  color: #7e22ce;
  font-size: 0.9rem;
`;

export default function ReadingHomeScreen() {
  const { navigate } = useApp();
  const [name, setName] = useState(getPlayerName());
  const savedName = getPlayerName();
  const totalStars = getTotalStars();

  const start = () => {
    if (name.trim()) {
      savePlayerName(name.trim());
      navigate('reading-character');
    }
  };

  return (
    <Wrap initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <Title>🎮 אותיות בארץ הפלאים 🎮</Title>
      <p style={{ color: theme.colors.textLight, fontSize: '1.1rem' }}>
        משחק לימוד קריאה מרתק לכיתה א׳!
      </p>

      {savedName && (
        <Welcome as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          👋 ברוך שובך, {savedName}!
          <div style={{ fontWeight: 400, marginTop: 4 }}>
            יש לך <strong style={{ fontSize: '1.2rem' }}>⭐ {totalStars}</strong> כוכבים
          </div>
        </Welcome>
      )}

      <div style={{ width: '100%', textAlign: 'right' }}>
        <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>מה שמך? 👤</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && start()}
          placeholder="הקלד את שמך כאן..."
          autoFocus
        />
      </div>

      <Button onClick={start} disabled={!name.trim()} style={{ width: '100%' }}>
        🚀 התחל לשחק
      </Button>

      <Tip>💡 <strong>עזרה:</strong> ענה נכון על שאלות קריאה וצבור כוכבים!</Tip>
    </Wrap>
  );
}
