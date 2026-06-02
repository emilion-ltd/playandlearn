import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { notes as allNotes, noteById } from '../../data/music/notes';
import { playFrequency, resumeAudio } from '../../audio/synth';
import { theme } from '../../theme';

const Scroll = styled.div`
  width: 100%;
  overflow-x: auto;
  padding-bottom: 6px;
`;

const Keys = styled.div`
  direction: ltr;
  display: flex;
  position: relative;
  background: #1f2740;
  padding: 10px 10px 0;
  border-radius: 14px 14px 18px 18px;
  box-shadow: ${theme.shadow.md};
  width: max-content;
  min-width: 100%;
`;

const WhiteWrap = styled.div`
  position: relative;
  flex: 1 0 auto;
  width: 46px;
`;

const WhiteKey = styled(motion.button)`
  width: 100%;
  height: 180px;
  border: 1px solid #cfd6e6;
  border-radius: 0 0 8px 8px;
  background: ${(p) => (p.$target ? p.$glow : 'linear-gradient(#ffffff, #f1f3fb)')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 10px;
  font-family: ${theme.font};
  font-weight: 800;
  color: ${(p) => (p.$target ? '#fff' : theme.colors.textLight)};
  box-shadow: ${(p) => (p.$target ? `0 0 0 3px ${p.$glow}` : 'inset 0 -4px 0 rgba(0,0,0,0.08)')};
  @media (max-width: 600px) { height: 140px; }
`;

const BlackKey = styled(motion.button)`
  position: absolute;
  top: 0;
  right: -31%;
  width: 62%;
  height: 110px;
  z-index: 2;
  border: none;
  border-radius: 0 0 6px 6px;
  background: ${(p) => (p.$target ? p.$glow : 'linear-gradient(#39415e, #11162a)')};
  cursor: pointer;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  box-shadow: ${(p) => (p.$target ? `0 0 0 3px ${p.$glow}` : '0 4px 6px rgba(0,0,0,0.4)')};
  @media (max-width: 600px) { height: 85px; }
`;

const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: block;
  margin-bottom: 4px;
`;

// מיפוי מקלדת מחשב לאוקטבה הראשונה
const keyMap = {
  a: 'C4', w: 'C#4', s: 'D4', e: 'D#4', d: 'E4', f: 'F4', t: 'F#4',
  g: 'G4', y: 'G#4', h: 'A4', u: 'A#4', j: 'B4', k: 'C5', o: 'C#5',
  l: 'D5',
};

export default function Piano({
  notes = allNotes,
  onPlay,
  targetNoteId = null,
  showNames = true,
  errorFlash = false,
  enableKeyboard = false,
}) {
  const [active, setActive] = useState({});

  const whiteNotes = notes.filter((n) => !n.black);

  const press = useCallback(
    (note) => {
      resumeAudio();
      playFrequency(note.freq);
      setActive((a) => ({ ...a, [note.id]: true }));
      setTimeout(() => setActive((a) => ({ ...a, [note.id]: false })), 180);
      onPlay?.(note.id);
    },
    [onPlay]
  );

  useEffect(() => {
    if (!enableKeyboard) return;
    const handler = (e) => {
      if (e.repeat) return;
      const id = keyMap[e.key.toLowerCase()];
      if (id && noteById[id]) {
        e.preventDefault();
        press(noteById[id]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableKeyboard, press]);

  const glowColor = errorFlash ? theme.colors.error : theme.colors.primary;

  return (
    <Scroll>
      <Keys>
        {whiteNotes.map((w) => {
          const blackId = `${w.step}#${w.octave}`;
          const black = noteById[blackId];
          const isTarget = targetNoteId === w.id;
          return (
            <WhiteWrap key={w.id}>
              <WhiteKey
                $target={isTarget}
                $glow={glowColor}
                animate={active[w.id] ? { scale: 0.97, y: 2 } : { scale: 1, y: 0 }}
                whileTap={{ scale: 0.96 }}
                onPointerDown={() => press(w)}
              >
                {showNames && <Dot $color={w.color} />}
                {showNames && <span>{w.name}</span>}
              </WhiteKey>
              {black && (
                <BlackKey
                  $target={targetNoteId === black.id}
                  $glow={glowColor}
                  animate={active[black.id] ? { scale: 0.95, y: 2 } : { scale: 1, y: 0 }}
                  whileTap={{ scale: 0.94 }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    press(black);
                  }}
                >
                  {showNames && black.name}
                </BlackKey>
              )}
            </WhiteWrap>
          );
        })}
      </Keys>
    </Scroll>
  );
}
