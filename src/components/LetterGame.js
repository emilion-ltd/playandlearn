import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { letters, gameSettings } from '../data/letters';

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const Letter = styled(motion.div)`
  font-size: 8rem;
  color: #2c3e50;
  cursor: pointer;
  user-select: none;
`;

const Word = styled(motion.div)`
  font-size: 2.5rem;
  color: #34495e;
  margin: 1rem 0;
`;

const ImageContainer = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7rem;
  background: linear-gradient(135deg, #f5f7fa, #e9eefb);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const FeedbackMessage = styled(motion.div)`
  font-size: 1.5rem;
  color: ${props => props.isSuccess ? '#27ae60' : '#e74c3c'};
  margin-top: 1rem;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: #3498db;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

function LetterGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const playLetterSound = () => {
    console.log('Playing letter sound');
  };

  const playSuccess = () => {
    console.log('Playing success sound');
  };

  const handleLetterClick = () => {
    playLetterSound();
    showSuccess();
  };

  const handleNextLetter = () => {
    if (currentIndex < letters.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFeedback('');
      setIsSuccess(false);
    }
  };

  const handlePrevLetter = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFeedback('');
      setIsSuccess(false);
    }
  };

  const showSuccess = () => {
    setIsSuccess(true);
    setFeedback(gameSettings.encouragements[Math.floor(Math.random() * gameSettings.encouragements.length)]);
    playSuccess();
  };

  return (
    <GameWrapper>
      <Letter
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLetterClick}
      >
        {letters[currentIndex]?.letter}
      </Letter>

      <Word
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {letters[currentIndex]?.word}
      </Word>

      <ImageContainer
        key={letters[currentIndex]?.letter}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        role="img"
        aria-label={letters[currentIndex]?.word}
      >
        {letters[currentIndex]?.emoji}
      </ImageContainer>

      <AnimatePresence>
        {feedback && (
          <FeedbackMessage
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            isSuccess={isSuccess}
          >
            {feedback}
          </FeedbackMessage>
        )}
      </AnimatePresence>

      <NavigationButtons>
        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevLetter}
          disabled={currentIndex === 0}
        >
          הקודם
        </Button>
        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextLetter}
          disabled={currentIndex === letters.length - 1}
        >
          הבא
        </Button>
      </NavigationButtons>
    </GameWrapper>
  );
}

export default LetterGame; 