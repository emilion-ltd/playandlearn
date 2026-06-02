import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../theme';

export const Button = styled(motion.button)`
  padding: ${(p) => (p.$small ? '0.5rem 1rem' : '0.85rem 1.8rem')};
  border: none;
  border-radius: ${theme.radius.pill};
  background: ${(p) =>
    p.$variant === 'ghost'
      ? 'transparent'
      : p.$variant === 'secondary'
      ? theme.colors.secondary
      : theme.colors.primary};
  color: ${(p) => (p.$variant === 'ghost' ? theme.colors.primary : '#fff')};
  border: ${(p) => (p.$variant === 'ghost' ? `2px solid ${theme.colors.primary}` : 'none')};
  font-size: ${(p) => (p.$small ? '0.95rem' : '1.1rem')};
  font-weight: 700;
  font-family: ${theme.font};
  cursor: pointer;
  box-shadow: ${(p) => (p.$variant === 'ghost' ? 'none' : theme.shadow.sm)};
  transition: filter 0.2s, transform 0.1s;

  &:hover {
    filter: brightness(1.05);
  }
  &:disabled {
    background: #cfd6e6;
    color: #fff;
    border-color: #cfd6e6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

Button.defaultProps = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.96 },
};

export const Card = styled(motion.div)`
  background: ${theme.colors.card};
  border-radius: ${theme.radius.lg};
  padding: ${(p) => p.$pad || '1.5rem'};
  box-shadow: ${theme.shadow.md};
  border: 1px solid ${theme.colors.border};
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 14px;
  background: ${theme.colors.border};
  border-radius: ${theme.radius.pill};
  overflow: hidden;
`;

export const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.radius.pill};
`;

export function ProgressBar({ value = 0 }) {
  return (
    <ProgressTrack>
      <ProgressFill
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.4 }}
      />
    </ProgressTrack>
  );
}

const StarsWrap = styled.div`
  display: inline-flex;
  gap: 2px;
  font-size: ${(p) => p.$size || '1.2rem'};
  letter-spacing: 2px;
`;

export function Stars({ value = 0, max = 3, size }) {
  return (
    <StarsWrap $size={size} aria-label={`${value} מתוך ${max} כוכבים`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < value ? theme.colors.accent : '#dfe4f0' }}>
          ★
        </span>
      ))}
    </StarsWrap>
  );
}

export const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: ${theme.radius.pill};
  background: ${(p) => p.$bg || theme.colors.border};
  color: ${(p) => p.$color || theme.colors.text};
  font-size: 0.8rem;
  font-weight: 700;
`;
