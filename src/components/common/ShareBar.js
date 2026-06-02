import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

export const SITE_URL = 'https://emilion.co.il/_games/playandlearn/';
const SHARE_TEXT = 'בואו לשחק וללמוד בעולם הלמידה! 🎓🎮';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
`;

const Title = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  font-size: 0.95rem;
`;

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Btn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  border: 1px solid ${theme.colors.border};
  background: #fff;
  color: ${theme.colors.text};
  padding: 0.45rem 0.85rem;
  border-radius: ${theme.radius.pill};
  font-size: 0.85rem;
  font-weight: 500;
  font-family: ${theme.font};
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: ${theme.shadow.sm}; background: ${(p) => p.$bg || theme.colors.bg}; }
`;

export default function ShareBar() {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(SITE_URL);
  const t = encodeURIComponent(SHARE_TEXT);

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'עולם הלמידה', text: SHARE_TEXT, url: SITE_URL });
      } catch {
        /* בוטל */
      }
    } else {
      copy();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <Wrap>
      <Title>📣 שתפו את עולם הלמידה עם חברים</Title>
      <Row>
        <Btn href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" $bg="#e7f8ed">💬 וואטסאפ</Btn>
        <Btn href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" $bg="#e8f0fe">📘 פייסבוק</Btn>
        <Btn href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" $bg="#e6f4fb">✈️ טלגרם</Btn>
        <Btn href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noopener noreferrer" $bg="#eef1f5">𝕏 טוויטר</Btn>
        <Btn as="button" onClick={nativeShare} $bg="#f3eefe">📤 שיתוף</Btn>
        <Btn as="button" onClick={copy} $bg="#fff7e6">{copied ? '✓ הועתק!' : '🔗 העתק קישור'}</Btn>
      </Row>
    </Wrap>
  );
}
