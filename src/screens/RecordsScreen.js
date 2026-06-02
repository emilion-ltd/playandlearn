import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { usePlayers, gameMeta } from '../context/PlayersContext';
import { Card, Button } from '../components/common/UI';
import Icon from '../components/common/Icon';
import { PlayerModalRoot } from '../components/player/PlayerModal';
import { playerKey } from '../services/onlineSync';
import { theme } from '../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.4rem;
  h2 { font-family: ${theme.display}; color: ${theme.colors.text}; font-size: 2rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Section = styled.div`
  max-width: 640px;
  margin: 0 auto 1.6rem;
`;

const SecTitle = styled.h3`
  font-family: ${theme.display};
  color: ${theme.colors.text};
  font-size: 1.2rem;
  margin-bottom: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const Row = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  border-radius: ${theme.radius.md};
  margin-bottom: 0.6rem;
  background: ${(p) => (p.$me ? 'linear-gradient(90deg,#eef1ff,#fff)' : '#fff')};
  border: 2px solid ${(p) => (p.$me ? theme.colors.primary : theme.colors.border)};
  box-shadow: ${theme.shadow.sm};
  .rank { font-size: 1.4rem; width: 34px; text-align: center; }
  .av { font-size: 1.8rem; }
  .nm { font-weight: 600; color: ${theme.colors.text}; flex: 1; }
  .pts { font-family: ${theme.display}; color: ${theme.colors.primary}; font-size: 1.2rem; }
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.7rem;
`;

const GameCard = styled(Card)`
  padding: 0.9rem;
  text-align: center;
  .emoji { font-size: 1.8rem; }
  .label { font-weight: 600; color: ${theme.colors.text}; }
  .holder { font-size: 0.85rem; color: ${theme.colors.textLight}; margin-top: 2px; }
  .best { font-family: ${theme.display}; color: ${theme.colors.secondary}; font-size: 1.3rem; }
`;

const medals = ['🥇', '🥈', '🥉'];

const OnlineStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const OnlineChip = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem 0.35rem 0.55rem;
  background: #fff;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radius.pill};
  box-shadow: ${theme.shadow.sm};
  font-weight: 600;
  color: ${theme.colors.text};
  .av { font-size: 1.3rem; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: ${theme.colors.success}; box-shadow: 0 0 0 0 ${theme.colors.success}; animation: pulse 1.6s infinite; }
  .pts { color: ${theme.colors.textLight}; font-size: 0.85rem; }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(39,174,96,0.5); }
    70% { box-shadow: 0 0 0 8px rgba(39,174,96,0); }
    100% { box-shadow: 0 0 0 0 rgba(39,174,96,0); }
  }
`;

export default function RecordsScreen() {
  const {
    players, leaderboard, currentPlayer,
    online, onlinePlayers, globalLeaderboard, globalRecords,
  } = usePlayers();
  const [modal, setModal] = useState(false);

  const myKey = currentPlayer ? playerKey(currentPlayer.id) : null;
  const useGlobal = online && globalLeaderboard.length > 0;
  const board = useGlobal ? globalLeaderboard : leaderboard;
  const isMe = (p) => (useGlobal ? p.key === myKey : currentPlayer?.id === p.id);

  const nothingYet = players.length === 0 && board.length === 0 && onlinePlayers.length === 0;
  if (nothingYet) {
    return (
      <div>
        <Head>
          <h2>🏆 אלופים ושיאים</h2>
          <p>צרו שחקן כדי להתחיל לצבור נקודות ולשבור שיאים!</p>
        </Head>
        <div style={{ textAlign: 'center' }}>
          <Button onClick={() => setModal(true)}>➕ צור שחקן</Button>
        </div>
        <PlayerModalRoot open={modal} onClose={() => setModal(false)} forceCreate />
      </div>
    );
  }

  // מי מחזיק בשיא לכל משחק — משלב מקומי וגלובלי
  const gameHolders = Object.keys(gameMeta).map((gid) => {
    let best = 0;
    let holder = null;
    players.forEach((p) => {
      const v = p.records?.[gid] || 0;
      if (v > best) { best = v; holder = { emoji: p.emoji, name: p.name }; }
    });
    const gr = globalRecords[gid];
    if (gr && gr.score > best) { best = gr.score; holder = { emoji: gr.emoji, name: gr.name }; }
    return { gid, best, holder };
  });

  return (
    <div>
      <Head>
        <h2>🏆 אלופים ושיאים</h2>
        <p>
          {online && (onlinePlayers.length > 0 || globalLeaderboard.length > 0)
            ? 'תחרות חיה בין כל השחקנים בעולם הלמידה!'
            : 'תחרות בין השחקנים במכשיר הזה'}
        </p>
      </Head>

      {online && onlinePlayers.length > 0 && (
        <Section>
          <SecTitle>🟢 מחוברים עכשיו ({onlinePlayers.length})</SecTitle>
          <OnlineStrip>
            {onlinePlayers
              .slice()
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .map((p) => (
                <OnlineChip key={p.key} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <span className="dot" />
                  <span className="av">{p.emoji}</span>
                  <span>{p.name}{p.key === myKey ? ' (את/ה)' : ''}</span>
                  <span className="pts">⭐{p.points || 0}</span>
                </OnlineChip>
              ))}
          </OnlineStrip>
        </Section>
      )}

      <Section>
        <SecTitle>👑 טבלת אלופים {useGlobal ? '(עולמי)' : ''}</SecTitle>
        {board.map((p, i) => (
          <Row
            key={p.key || p.id}
            $me={isMe(p)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.05 }}
          >
            <span className="rank">{medals[i] || i + 1}</span>
            <span className="av">{p.emoji}</span>
            <span className="nm">{p.name}{isMe(p) ? ' (את/ה)' : ''}</span>
            <span className="pts">⭐ {p.points || 0}</span>
          </Row>
        ))}
      </Section>

      <Section>
        <SecTitle>🎯 שיאים לפי משחק {Object.keys(globalRecords).length > 0 ? '(עולמי)' : ''}</SecTitle>
        <GameGrid>
          {gameHolders.map(({ gid, best, holder }) => (
            <GameCard key={gid}>
              <div className="emoji"><Icon name={gameMeta[gid].icon} color={gameMeta[gid].color} size={36} /></div>
              <div className="label">{gameMeta[gid].label}</div>
              <div className="best">{best > 0 ? `${best}` : '—'}</div>
              <div className="holder">{holder ? `${holder.emoji} ${holder.name}` : 'אין שיא עדיין'}</div>
            </GameCard>
          ))}
        </GameGrid>
      </Section>

      <div style={{ textAlign: 'center' }}>
        <Button $variant="ghost" onClick={() => setModal(true)}>👥 ניהול שחקנים</Button>
      </div>
      <PlayerModalRoot open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
