import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { keyboardRows, charMaps } from '../../data/typing/keyboardLayout';
import { theme, fingerLabels } from '../../theme';

const Board = styled.div`
  direction: ltr;
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: #eef1fb;
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.sm};
  max-width: 100%;
`;

const Row = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  /* היסט קל כמו במקלדת אמיתית */
  padding-left: ${(p) => p.$offset || 0}px;
`;

const Key = styled(motion.div)`
  width: clamp(28px, 7.5vw, 52px);
  height: clamp(34px, 8vw, 52px);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.85rem, 2.6vw, 1.3rem);
  font-weight: 700;
  user-select: none;
  position: relative;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$active ? '#fff' : theme.colors.text};
  border: 2px solid ${(p) => (p.$active ? '#fff' : 'transparent')};
  box-shadow: ${(p) =>
    p.$active
      ? `0 0 0 3px ${p.$activeColor}, ${theme.shadow.md}`
      : 'inset 0 -2px 0 rgba(0,0,0,0.08)'};
  transition: background 0.12s, box-shadow 0.12s;

  &::after {
    content: '';
    position: absolute;
    bottom: 5px;
    width: 12px;
    height: 3px;
    border-radius: 2px;
    background: ${(p) => (p.$home ? 'rgba(0,0,0,0.35)' : 'transparent')};
  }
`;

const SpaceKey = styled(Key)`
  width: clamp(160px, 40vw, 320px);
`;

const HintBar = styled.div`
  direction: rtl;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1rem;
  color: ${theme.colors.textLight};
`;

const FingerDot = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  border: 2px solid #fff;
  box-shadow: ${theme.shadow.sm};
`;

const rowOffsets = [0, 18, 40];

export default function Keyboard({ lang = 'he', activeChar = null, showColors = true, errorFlash = false }) {
  const normalizedActive = activeChar ? (lang === 'en' ? activeChar.toLowerCase() : activeChar) : null;
  const activeInfo = normalizedActive ? charMaps[lang][normalizedActive] : null;
  const activeFinger = activeInfo?.finger || null;

  const isActiveKey = (rowIndex, keyIndex) =>
    activeInfo && activeInfo.rowIndex === rowIndex && activeInfo.keyIndex === keyIndex;

  const keyBg = (key, active) => {
    if (active) return errorFlash ? theme.colors.error : theme.colors.primary;
    if (showColors) return theme.fingers[key.finger];
    return '#fff';
  };

  return (
    <div>
      <Board>
        {keyboardRows.map((row, rowIndex) => (
          <Row key={rowIndex} $offset={rowOffsets[rowIndex]}>
            {row.map((key, keyIndex) => {
              const active = isActiveKey(rowIndex, keyIndex);
              return (
                <Key
                  key={key.en}
                  $bg={keyBg(key, active)}
                  $active={active}
                  $activeColor={errorFlash ? theme.colors.error : theme.colors.primary}
                  $home={key.home}
                  animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, repeat: active ? Infinity : 0, repeatType: 'reverse' }}
                >
                  {key[lang]}
                </Key>
              );
            })}
          </Row>
        ))}
        <Row $offset={0}>
          <SpaceKey
            $bg={isSpaceActive(normalizedActive) ? theme.colors.primary : showColors ? theme.fingers.thumb : '#fff'}
            $active={isSpaceActive(normalizedActive)}
            $activeColor={theme.colors.primary}
            animate={isSpaceActive(normalizedActive) ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, repeat: isSpaceActive(normalizedActive) ? Infinity : 0, repeatType: 'reverse' }}
          >
            רווח
          </SpaceKey>
        </Row>
      </Board>
      {activeFinger && (
        <HintBar>
          <FingerDot $color={theme.fingers[activeFinger]} />
          <span>
            לחצו עם <strong>{fingerLabels[activeFinger]}</strong>
          </span>
        </HintBar>
      )}
    </div>
  );
}

function isSpaceActive(normalizedActive) {
  return normalizedActive === ' ';
}
