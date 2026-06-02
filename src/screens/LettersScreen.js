import React from 'react';
import styled from 'styled-components';
import LetterGame from '../components/LetterGame';
import { Card } from '../components/common/UI';
import { theme } from '../theme';

const Head = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  h2 { color: ${theme.colors.text}; font-size: 1.8rem; }
  p { color: ${theme.colors.textLight}; }
`;

export default function LettersScreen() {
  return (
    <div>
      <Head>
        <h2>🔤 בואו נלמד את האלף-בית</h2>
        <p>לחצו על האות, האזינו ועברו לאות הבאה</p>
      </Head>
      <Card style={{ maxWidth: 720, margin: '0 auto' }}>
        <LetterGame />
      </Card>
    </div>
  );
}
