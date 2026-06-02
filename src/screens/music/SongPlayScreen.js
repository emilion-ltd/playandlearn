import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Piano from '../../components/music/Piano';
import { Button, Card, ProgressBar, Stars } from '../../components/common/UI';
import { useApp } from '../../context/AppContext';
import { songs, baseBeatSeconds } from '../../data/music/songs';
import { noteById } from '../../data/music/notes';
import { playSequence, resumeAudio } from '../../audio/synth';
import { theme } from '../../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 0.8rem;
  h2 { color: ${theme.colors.text}; font-size: 1.6rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Strip = styled.div`
  direction: ltr;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 10px;
  background: #eef1fb;
  border-radius: ${theme.radius.md};
  margin-bottom: 0.8rem;
`;

const Chip = styled(motion.div)`
  flex: 0 0 auto;
  min-width: 42px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  color: #fff;
  background: ${(p) => p.$color};
  opacity: ${(p) => (p.$done ? 0.35 : 1)};
  border: 3px solid ${(p) => (p.$current ? theme.colors.text : 'transparent')};
  transform: ${(p) => (p.$current ? 'scale(1.12)' : 'scale(1)')};
  box-shadow: ${(p) => (p.$current ? theme.shadow.md : 'none')};
`;

const Controls = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;
`;

const Done = styled(Card)`
  max-width: 440px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

function starsForMistakes(m) {
  if (m === 0) return 3;
  if (m <= 2) return 2;
  return 1;
}

export default function SongPlayScreen({ songId }) {
  const { goBack } = useApp();
  const song = songs.find((s) => s.id === songId);

  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [errorFlash, setErrorFlash] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [finished, setFinished] = useState(false);
  const cancelRef = useRef(null);
  const chipRefs = useRef([]);

  const sequence = useMemo(
    () => (song ? song.notes.map((n) => ({ ...noteById[n.id], beats: n.beats })) : []),
    [song]
  );

  useEffect(() => {
    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, []);

  // גלילה אוטומטית לתו הנוכחי
  useEffect(() => {
    const el = chipRefs.current[demoPlaying ? demoStep : index];
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index, demoStep, demoPlaying]);

  const onPlay = useCallback(
    (id) => {
      if (demoPlaying || finished) return;
      const current = sequence[index];
      if (!current) return;
      if (id === current.id) {
        if (index < sequence.length - 1) {
          setIndex((i) => i + 1);
        } else {
          setFinished(true);
        }
      } else {
        setMistakes((m) => m + 1);
        setErrorFlash(true);
        setTimeout(() => setErrorFlash(false), 220);
      }
    },
    [demoPlaying, finished, index, sequence]
  );

  const listen = () => {
    resumeAudio();
    if (cancelRef.current) cancelRef.current();
    setDemoPlaying(true);
    setDemoStep(0);
    const seqForPlay = sequence.map((n) => ({ freq: n.freq, dur: n.beats * baseBeatSeconds }));
    cancelRef.current = playSequence(seqForPlay, (i) => setDemoStep(i));
    const total = seqForPlay.reduce((s, n) => s + n.dur, 0);
    setTimeout(() => {
      setDemoPlaying(false);
      setDemoStep(-1);
    }, total * 1000 + 300);
  };

  const restart = () => {
    if (cancelRef.current) cancelRef.current();
    setIndex(0);
    setMistakes(0);
    setFinished(false);
    setDemoPlaying(false);
    setDemoStep(-1);
  };

  if (!song) return <div>השיר לא נמצא</div>;

  if (finished) {
    const stars = starsForMistakes(mistakes);
    return (
      <Done initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={{ fontSize: '3.4rem' }}>{song.emoji}</div>
        <h2 style={{ color: theme.colors.text }}>ניגנת את "{song.title}"!</h2>
        <Stars value={stars} size="2.2rem" />
        <div style={{ color: theme.colors.textLight }}>טעויות: {mistakes}</div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button onClick={restart} style={{ background: '#e64980' }}>נגן שוב 🔁</Button>
          <Button $variant="ghost" onClick={goBack}>חזרה לשירים</Button>
        </div>
      </Done>
    );
  }

  const activeIdx = demoPlaying ? demoStep : index;
  const targetId = demoPlaying ? sequence[demoStep]?.id : sequence[index]?.id;

  return (
    <div>
      <Head>
        <h2>{song.emoji} {song.title}</h2>
        <p>{demoPlaying ? 'מקשיבים לשיר... 🎧' : 'לחצו על הקליד הנוצץ לפי הסדר 👇'}</p>
      </Head>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Strip>
          {sequence.map((n, i) => (
            <Chip
              key={i}
              ref={(el) => (chipRefs.current[i] = el)}
              $color={n.color}
              $current={i === activeIdx}
              $done={!demoPlaying && i < index}
            >
              {n.name}
            </Chip>
          ))}
        </Strip>

        <div style={{ marginBottom: '0.8rem' }}>
          <ProgressBar value={(index / sequence.length) * 100} />
        </div>

        <Controls>
          <Button $small onClick={listen} disabled={demoPlaying} style={{ background: '#e64980' }}>
            🎧 השמע לי
          </Button>
          <Button $small $variant="ghost" onClick={restart}>מהתחלה 🔁</Button>
        </Controls>

        <Piano targetNoteId={targetId} onPlay={onPlay} showNames errorFlash={errorFlash} />
      </div>
    </div>
  );
}
