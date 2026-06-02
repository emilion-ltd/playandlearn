import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Piano from '../../components/music/Piano';
import { Button, Card, ProgressBar } from '../../components/common/UI';
import { notes, noteById } from '../../data/music/notes';
import { theme } from '../../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  h2 { color: ${theme.colors.text}; font-size: 1.7rem; }
`;

const TargetCard = styled(Card)`
  max-width: 420px;
  margin: 0 auto 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  .name { font-size: 2.6rem; font-weight: 800; }
  .hint { color: ${theme.colors.textLight}; }
`;

const Done = styled(Card)`
  max-width: 420px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const scaleIds = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const octaveNotes = notes.filter((n) => n.octave === 4 || n.id === 'C5');

export default function NotesLearnScreen() {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const target = noteById[scaleIds[index]];

  const onPlay = (id) => {
    if (id === target.id) {
      if (index < scaleIds.length - 1) {
        setIndex((i) => i + 1);
      } else {
        setDone(true);
      }
    }
  };

  const restart = () => {
    setIndex(0);
    setDone(false);
  };

  if (done) {
    return (
      <Done initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={{ fontSize: '3rem' }}>🎉</div>
        <h2 style={{ color: theme.colors.text }}>כל הכבוד! ניגנת את כל הסולם!</h2>
        <p style={{ color: theme.colors.textLight }}>דו · רה · מי · פה · סול · לה · סי · דו</p>
        <Button onClick={restart}>שוב מההתחלה 🔁</Button>
      </Done>
    );
  }

  return (
    <div>
      <Head>
        <h2>🎵 לומדים תווים</h2>
      </Head>

      <div style={{ maxWidth: 420, margin: '0 auto 1rem' }}>
        <ProgressBar value={(index / scaleIds.length) * 100} />
      </div>

      <TargetCard
        as={motion.div}
        key={target.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="hint">נגנו את התו:</div>
        <div className="name" style={{ color: target.color }}>{target.name}</div>
        <div className="hint">חפשו את הקליד הנוצץ 👇</div>
      </TargetCard>

      <Piano notes={octaveNotes} targetNoteId={target.id} onPlay={onPlay} showNames />
    </div>
  );
}
