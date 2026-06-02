import React from 'react';
import styled from 'styled-components';
import { Button } from '../components/common/UI';
import { theme } from '../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 0.8rem;
  h2 { color: ${theme.colors.text}; font-size: 1.7rem; }
  p { color: ${theme.colors.textLight}; }
`;

const Frame = styled.iframe`
  width: 100%;
  height: 80vh;
  min-height: 560px;
  border: none;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.md};
  background: #fff;
`;

export default function ArtScreen() {
  const src = `${process.env.PUBLIC_URL}/art/index.html`;

  return (
    <div>
      <Head>
        <h2>🎨 עולם הציורים</h2>
        <p>ציירו, צבעו, הוסיפו מדבקות - ואפילו הפכו את הציור לדמות מדברת!</p>
      </Head>
      <Frame src={src} title="עולם הציורים" allow="microphone" />
      <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
        <Button
          $small
          $variant="ghost"
          onClick={() => window.open(src, '_blank', 'noopener')}
        >
          פתח במסך מלא ↗
        </Button>
      </div>
    </div>
  );
}
