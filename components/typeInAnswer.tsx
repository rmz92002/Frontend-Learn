'use client';

import React, { useState, useMemo, ReactNode } from 'react';

// --- PROPS INTERFACE ---
interface TypeInAnswerProps {
  /** The question or prompt for the user. */
  children: ReactNode;
  /**
   * A pipe-delimited string of all acceptable answers.
   * The first answer is considered the "primary" answer for feedback.
   * Example: "The dog|the dog|The dog."
   */
  answers: string;
  /** Placeholder text for the input field. */
  placeholder?: string;
  onContinue?: () => void;
}

/* --- STYLES (CSS-in-JS) --- */
const styles = `
  :root {
    --duo-color-green: #58cc02; --duo-color-green-light: #d7ffb8; --duo-color-green-dark: #58a700;
    --duo-color-red: #ff4b4b; --duo-color-red-light: #ffdfe0; --duo-color-blue: #1cb0f6;
    --duo-color-gray-light: #e5e5e5; --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  @keyframes float-up {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-60px); }
  }
  .points-animation {
    position: absolute;
    color: var(--duo-color-green);
    font-size: 1.75rem;
    font-weight: 800;
    animation: float-up 1s ease-out forwards;
    pointer-events: none;
    z-index: 10;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .duo-typing-question {
    font-size: 3rem;
    font-weight: 700;
    color: #3c3c3c;
    text-align: center;
  }
  .duo-typing-container { max-width: 1200px; min-height: 100vh; margin: 0 auto; font-family: var(--duo-font-family); border-radius: 0; border: none; display: flex; flex-direction: column;}
  .duo-typing-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px; padding-bottom: 150px; position: relative; width: 100%; box-sizing: border-box; }
  
  .duo-typing-input-wrapper {
    margin-top: 2rem;
  }
  
  .duo-typing-input {
    width: 100%;
    max-width: 800px;
    padding: 24px;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--duo-color-gray-medium);
    background-color: #ffffff;
    border: 3px solid var(--duo-color-gray-light);
    border-bottom-width: 6px;
    border-radius: 16px;
    text-align: center;
    user-select: none;
    transition: all 0.2s ease;
  }
  .duo-typing-input:hover:not(.disabled) { border-color: var(--duo-color-blue); }
  .duo-typing-input:focus {
    outline: none;
    border-color: var(--duo-color-blue);
  }
  .duo-typing-input.correct {
    border-color: var(--duo-color-green-dark);
    background-color: var(--duo-color-green-light);
    color: var(--duo-color-green-dark);
  }
  .duo-typing-input.incorrect {
    border-color: var(--duo-color-red);
    animation: shake 0.4s ease-in-out;
  }
  
  /* Footer */
  .duo-typing-footer { margin: 2.5rem auto 0 auto; display: block; padding: 14px 40px; font-size: 1rem; font-weight: 700; color: #ffffff; text-transform: uppercase; background-color: var(--duo-color-green); border: none; border-bottom: 4px solid var(--duo-color-green-dark); border-radius: 12px; cursor: pointer; }
  .duo-typing-footer.correct-banner { background-color: var(--duo-color-green-light); border-top-color: var(--duo-color-green-dark); }
  .duo-typing-footer.incorrect-banner { background-color: var(--duo-color-red-light); border-top-color: var(--duo-color-red); }
  .feedback-message { display: flex; align-items: center; gap: 12px; font-size: 2rem; font-weight: 700; }
  .feedback-message.correct-text { color: var(--duo-color-green-dark); }
  .feedback-message.incorrect-text { color: var(--duo-color-red); }
  .footer-action-button { margin: 3rem auto 0 auto; display: block; padding: 18px 50px; font-size: 1.25rem; font-weight: 700; color: #ffffff; text-transform: uppercase; background-color: var(--duo-color-green); border: none; border-bottom: 5px solid var(--duo-color-green-dark); border-radius: 16px; cursor: pointer; transition: filter 0.2s ease; }
  .footer-action-button:hover:not(:disabled) { filter: brightness(1.1); }
  .footer-action-button:disabled { background-color: var(--duo-color-gray-light); border-color: var(--duo-color-gray-medium); color: var(--duo-color-gray-medium); cursor: not-allowed; }
`;

// --- HELPER COMPONENTS ---
const InternalTitle = ({ children }: { children: ReactNode }) => ( <h2 style={{ fontFamily: 'var(--duo-font-family)', fontWeight: 800, color: '#3c3c3c', fontSize: '1.75rem', textAlign: 'center', margin: 0 }}>{children}</h2> );

// --- MAIN COMPONENT LOGIC ---
type QuizStatus = 'idle' | 'correct' | 'incorrect';

export default function TypeInAnswer({ children, answers, placeholder = "Type your answer...", onContinue }: TypeInAnswerProps) {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  // Animation state: show +10 when correct
  const [pointsAnimation, setPointsAnimation] = useState<boolean>(false);

  // Memoize the parsed answers for performance
  const parsedAnswers = useMemo(() => {
    return answers.split('|').map(a => a.trim().toLowerCase());
  }, [answers]);

  const handleCheck = () => {
    const userInput = inputValue.trim().toLowerCase();
    const isCorrect = parsedAnswers.includes(userInput);
    
    if (isCorrect) {
      setStatus('correct');
      setFeedback('You are correct!');
      // Trigger +10 animation
      setPointsAnimation(true);
      setTimeout(() => setPointsAnimation(false), 1000);
    } else {
      setStatus('incorrect');
      // Show the first answer as the primary correct one
      const primaryAnswer = answers.split('|')[0];
      setFeedback(`Correct answer: ${primaryAnswer}`);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      if (status !== 'correct') {
        handleCheck();
      } else if (onContinue) {
        onContinue();
      }
    }
  };

  const getInputClassName = () => {
    if (status === 'correct') return 'duo-typing-input correct';
    if (status === 'incorrect') return 'duo-typing-input incorrect';
    return 'duo-typing-input';
  };

  return (
    <>
      <style>{styles}</style>
      <div className="duo-typing-container">
        <div className="duo-typing-content" style={{ position: 'relative' }}>
          {children && <h2 className='duo-typing-question'>{children}</h2>}

          <div className="duo-typing-input-wrapper" style={{ position: 'relative' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (status === 'incorrect') {
                  setStatus('idle');
                  setFeedback(null);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={getInputClassName()}
              disabled={status === 'correct'}
              autoFocus
            />
            {/* +10 points animation */}
            {pointsAnimation && (
              <div className="points-animation" style={{ top: '-32px' }}>
                +10
              </div>
            )}
          </div>
          
          {/* {status === 'correct' && (
            <div className="feedback-message correct-text" style={{ marginTop: '2rem', fontSize: '2rem', fontWeight: 700, color: 'var(--duo-color-green-dark)' }}>
              <span className="icon">✅</span> You are correct!
            </div>
          )} */}
          
          {(status === 'correct' || status === 'incorrect') ? (
            <button className="footer-action-button" onClick={onContinue}>
              Continue
            </button>
          ) : (
            <button
              className="footer-action-button"
              onClick={handleCheck}
              disabled={!inputValue.trim()}
            >
              Check
            </button>
          )}
        </div>
      </div>
    </>
  );
}
