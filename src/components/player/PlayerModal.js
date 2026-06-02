import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers, avatarOptions } from '../../context/PlayersContext';
import { Button } from '../common/UI';
import { theme } from '../../theme';

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(30, 35, 70, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
`;

const Sheet = styled(motion.div)`
  background: #fff;
  border-radius: ${theme.radius.lg};
  padding: 1.6rem;
  width: 100%;
  max-width: 440px;
  box-shadow: ${theme.shadow.lg};
  max-height: 90vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-family: ${theme.display};
  color: ${theme.colors.text};
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  border-radius: ${theme.radius.md};
  border: 2px solid ${(p) => (p.$active ? theme.colors.primary : theme.colors.border)};
  background: ${(p) => (p.$active ? theme.colors.primary + '10' : '#fff')};
  margin-bottom: 0.5rem;
  cursor: pointer;
  .av { font-size: 1.8rem; }
  .nm { font-weight: 600; color: ${theme.colors.text}; flex: 1; }
  .pts { color: ${theme.colors.textLight}; font-size: 0.85rem; }
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin: 0.6rem 0;
`;

const Av = styled.button`
  font-size: 1.4rem;
  border: 2px solid ${(p) => (p.$sel ? theme.colors.primary : 'transparent')};
  background: ${(p) => (p.$sel ? theme.colors.primary + '18' : '#f3f5fc')};
  border-radius: 10px;
  padding: 4px;
  cursor: pointer;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  font-family: ${theme.font};
  text-align: center;
  &:focus { outline: none; border-color: ${theme.colors.primary}; }
`;

const Del = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.5;
  &:hover { opacity: 1; }
`;

export default function PlayerModal({ onClose, forceCreate = false }) {
  const { players, currentPlayer, addPlayer, selectPlayer, removePlayer } = usePlayers();
  const [creating, setCreating] = useState(forceCreate || players.length === 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatarOptions[0]);

  const create = () => {
    if (!name.trim()) return;
    addPlayer(name, avatar);
    onClose();
  };

  return (
    <Backdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <Sheet
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {creating ? (
          <>
            <Title>👋 שחקן חדש</Title>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6, color: theme.colors.text }}>
              בחרו דמות:
            </label>
            <AvatarGrid>
              {avatarOptions.map((a) => (
                <Av key={a} $sel={avatar === a} onClick={() => setAvatar(a)} type="button">
                  {a}
                </Av>
              ))}
            </AvatarGrid>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="איך קוראים לך?"
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', justifyContent: 'center' }}>
              <Button onClick={create} disabled={!name.trim()}>הצטרף למשחק 🚀</Button>
              {players.length > 0 && (
                <Button $variant="ghost" onClick={() => setCreating(false)}>ביטול</Button>
              )}
            </div>
          </>
        ) : (
          <>
            <Title>👥 מי משחק עכשיו?</Title>
            {players.map((p) => (
              <PlayerRow
                key={p.id}
                $active={currentPlayer?.id === p.id}
                onClick={() => {
                  selectPlayer(p.id);
                  onClose();
                }}
              >
                <span className="av">{p.emoji}</span>
                <span className="nm">{p.name}</span>
                <span className="pts">⭐ {p.points || 0}</span>
                <Del
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`למחוק את ${p.name}?`)) removePlayer(p.id);
                  }}
                  title="מחק"
                >
                  🗑️
                </Del>
              </PlayerRow>
            ))}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button onClick={() => setCreating(true)}>➕ שחקן חדש</Button>
            </div>
          </>
        )}
      </Sheet>
    </Backdrop>
  );
}

export function PlayerModalRoot({ open, onClose, forceCreate }) {
  return (
    <AnimatePresence>
      {open && <PlayerModal onClose={onClose} forceCreate={forceCreate} />}
    </AnimatePresence>
  );
}
