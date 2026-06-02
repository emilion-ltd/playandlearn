import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers, gameMeta } from '../../context/PlayersContext';
import { theme } from '../../theme';

const Wrap = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const Banner = styled(motion.div)`
  background: linear-gradient(135deg, #ffd43b, #ff922b);
  color: #5a3a00;
  padding: 1.4rem 2rem;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.lg};
  text-align: center;
  font-family: ${theme.display};
  .big { font-size: 2rem; }
  .sub { font-size: 1.1rem; margin-top: 0.3rem; font-weight: 600; }
`;

const Confetti = styled(motion.span)`
  position: absolute;
  font-size: ${(p) => p.$size}px;
  left: ${(p) => p.$left}%;
  top: -5%;
`;

const emojis = ['🎉', '⭐', '🏆', '✨', '🎊', '💫', '🥳'];

export default function CelebrationOverlay() {
  const { celebration, dismissCelebration } = usePlayers();

  useEffect(() => {
    if (celebration) {
      const t = setTimeout(dismissCelebration, 2600);
      return () => clearTimeout(t);
    }
  }, [celebration, dismissCelebration]);

  return (
    <AnimatePresence>
      {celebration && (
        <Wrap initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {Array.from({ length: 22 }).map((_, i) => (
            <Confetti
              key={i}
              $left={Math.random() * 100}
              $size={18 + Math.random() * 22}
              initial={{ y: -50, opacity: 0, rotate: 0 }}
              animate={{ y: '110vh', opacity: [0, 1, 1, 0.5], rotate: 360 + Math.random() * 360 }}
              transition={{ duration: 2 + Math.random() * 1.2, delay: Math.random() * 0.5, ease: 'easeIn' }}
            >
              {emojis[i % emojis.length]}
            </Confetti>
          ))}
          <Banner
            initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          >
            <div className="big">
              {celebration.isGlobal ? '🏆 שיא חדש לכולם!' : '⭐ שיא אישי חדש!'}
            </div>
            <div className="sub">
              {gameMeta[celebration.gameId]?.label || 'משחק'} · {celebration.score} נקודות
            </div>
          </Banner>
        </Wrap>
      )}
    </AnimatePresence>
  );
}
