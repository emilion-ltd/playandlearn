import React, { useState } from 'react';
import styled from 'styled-components';
import Piano from '../../components/music/Piano';
import { Button } from '../../components/common/UI';
import { theme } from '../../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  h2 { color: ${theme.colors.text}; font-size: 1.7rem; }
  p { color: ${theme.colors.textLight}; }
`;

export default function FreePlayScreen() {
  const [showNames, setShowNames] = useState(true);

  return (
    <div>
      <Head>
        <h2>🎹 פסנתר חופשי</h2>
        <p>לחצו על הקלידים ונגנו! אפשר גם להשתמש במקלדת המחשב (A S D F G H J K)</p>
      </Head>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <Button $small $variant="ghost" onClick={() => setShowNames((v) => !v)}>
          {showNames ? 'הסתר שמות תווים' : 'הצג שמות תווים'}
        </Button>
      </div>
      <Piano showNames={showNames} enableKeyboard />
    </div>
  );
}
