'use client';

import React, { useState, ReactNode, useMemo, useRef } from 'react';

// --- PROPS INTERFACE ---
interface QuizProps {
  children: ReactNode;
  answer: string;
  distractors?: string; // e.g., "option1|option2|option3"
  onContinue?: () => void; // Optional callback for when the user clicks "Continue"
}

// --- HELPER FUNCTION (outside component to prevent re-creation) ---
const shuffle = (arr: string[]) => {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

// --- STYLES (CSS-in-JS for encapsulation) ---
const styles = `
  :root {
    --duo-color-green: #58cc02;
    --duo-color-green-light: #d7ffb8;
    --duo-color-green-dark: #58a700;
    --duo-color-red: #ff4b4b;
    --duo-color-red-light: #ffdfe0;
    --duo-color-blue: #1cb0f6;
    --duo-color-blue-light: #ddf4ff;
    --duo-color-gray-light: #e5e5e5;
    --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
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
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  /* --- Fullscreen Container --- */
  .duolingo-quiz-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    font-family: var(--duo-font-family);
    padding: 48px;
    /* Reserve space at the bottom for the feedback footer */
    padding-bottom: 150px; 
    position: relative;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
  }
  
  /* Wrapper for vertically centering the main interactive content */
  .quiz-main-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .quiz-question {
    font-size: 2.5rem;
    font-weight: 700;
    color: #3c3c3c;
    margin-bottom: 3rem;
    text-align: center;
  }

  .quiz-options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .quiz-option-button {
    width: 100%;
    padding: 24px;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--duo-color-gray-medium);
    background-color: #ffffff;
    border: 3px solid var(--duo-color-gray-light);
    border-bottom-width: 6px;
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .quiz-option-button:hover:not(:disabled) {
    background-color: #f7f7f7;
  }

  /* --- Button States --- */
  .quiz-option-button.selected {
    background-color: var(--duo-color-blue-light);
    border-color: var(--duo-color-blue);
    color: var(--duo-color-blue);
  }

  .quiz-option-button.correct {
    background-color: var(--duo-color-green-light);
    border-color: var(--duo-color-green-dark);
    color: var(--duo-color-green-dark);
  }

  .quiz-option-button.incorrect {
    background-color: var(--duo-color-red-light);
    border-color: var(--duo-color-red);
    color: var(--duo-color-red);
  }

  .quiz-option-button:disabled {
    cursor: not-allowed;
  }

  .quiz-option-button.disabled:not(.correct):not(.incorrect) {
    opacity: 0.5;
  }

  /* --- Action Button Container (NEW) --- */
  .quiz-action-container {
    width: 100%;
    margin-top: 3rem; /* Space between options and button */
    padding: 0;
    display: flex;
    justify-content: flex-end; /* Align button to the right */
  }

  .footer-action-button {
    padding: 18px 50px;
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    background-color: var(--duo-color-green);
    border: none;
    border-bottom: 5px solid var(--duo-color-green-dark);
    border-radius: 16px;
    cursor: pointer;
    transition: filter 0.2s ease;
  }

  .footer-action-button:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .footer-action-button:disabled {
    background-color: var(--duo-color-gray-light);
    border-color: var(--duo-color-gray-medium);
    cursor: not-allowed;
  }

  /* --- Footer and Feedback --- */
  .quiz-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 3px solid var(--duo-color-gray-light);
    background-color: #ffffff;
    min-height: 120px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 48px;
    transition: background-color 0.3s ease, border-top-color 0.3s ease;
  }
  
  .quiz-footer.correct-banner {
    background-color: var(--duo-color-green-light);
    border-top-color: var(--duo-color-green-dark);
  }
  
  .quiz-footer.incorrect-banner {
    background-color: var(--duo-color-red-light);
    border-top-color: var(--duo-color-red);
  }
  
  .feedback-message {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 2rem;
    font-weight: 700;
  }

  .feedback-message.correct-text { color: var(--duo-color-green-dark); }
  .feedback-message.incorrect-text { color: var(--duo-color-red); }
  
  .feedback-message .icon {
    font-size: 2.5rem;
  }

  /* --- Points Animation --- */
  @keyframes pop-in {
    0% { opacity: 0; transform: scale(0.5) translateY(20px); }
    70% { opacity: 1; transform: scale(1.1) translateY(0); }
    100% { transform: scale(1); }
  }

  .points-animation {
    display: inline-block;
    color: var(--duo-color-green);
    font-weight: 700;
    font-size: 2rem;
    animation: pop-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  /* --- Media Queries for smaller screens --- */
  @media (max-width: 768px) {
    .duolingo-quiz-container {
      padding: 24px;
      padding-bottom: 120px;
    }
    .quiz-question { font-size: 2rem; }
    .quiz-options-grid { grid-template-columns: 1fr; }
    .quiz-option-button { font-size: 1.25rem; padding: 20px; }
    .feedback-message { font-size: 1.5rem; }
    .feedback-message .icon { font-size: 2rem; }
    .points-animation { font-size: 1.5rem; }
    .quiz-action-container { justify-content: center; } /* Center button on mobile */
    .footer-action-button { width: 100%; }
  }
`;

// --- COMPONENT LOGIC ---
type QuizStatus = 'idle' | 'checking' | 'correct' | 'incorrect';

export default function MultipleChoiceQuiz({ children, answer, distractors = '', onContinue }: QuizProps) {
  // Memoize shuffled options so they don't change on re-render
  const options = useMemo(() =>
    shuffle([
      ...distractors.split('|').filter(Boolean),
      answer,
    ]), [answer, distractors]);

  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');

  // --- Points Animation State ---
  const [pointsAnimation, setPointsAnimation] = useState<{ x: number; y: number; key: string } | null>(null);
  const optionRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const registerRef = (option: string) => (el: HTMLButtonElement | null) => {
    optionRefs.current.set(option, el);
  };

  const handleOptionClick = (option: string) => {
    if (status !== 'idle') return;
    setSelected(option);
  };

  const handleCheck = () => {
    if (!selected) return;
    setStatus('checking');
    const isCorrect = selected === answer;
    if (isCorrect) {
      // Trigger points animation above the correct option
      const btnEl = optionRefs.current.get(selected);
      const containerEl = containerRef.current;
      if (btnEl && containerEl) {
        const btnRect = btnEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        setPointsAnimation({
          x: btnRect.left - containerRect.left + btnRect.width / 2,
          y: btnRect.top - containerRect.top,
          key: selected + Date.now(),
        });
        setTimeout(() => setPointsAnimation(null), 1000);
      }
    }
    setStatus(isCorrect ? 'correct' : 'incorrect');
  };

  const handleContinue = () => {
    setSelected(null);
    setStatus('idle');
    console.log(onContinue, 'onContinue prop in JsxRenderer');
    if (onContinue) {
      onContinue();
    }
  };

  const getButtonClass = (option: string) => {
    let classes = 'quiz-option-button';
    if (status !== 'idle' && status !== 'checking') {
      if (option === answer) {
        classes += ' correct';
      } else if (option === selected && status === 'incorrect') {
        classes += ' incorrect';
      }
    } else if (option === selected) {
      classes += ' selected';
    }
    return classes;
  };

  return (
    <>
      <style>{styles}</style>

      <article className="duolingo-quiz-container" ref={containerRef}>
        <div className="quiz-main-content">
          <div>
            <h2 className="quiz-question">{children}</h2>

            {/* --- Points Animation (float-up) --- */}
            {pointsAnimation && (
              <div
                key={pointsAnimation.key}
                className="points-animation"
                style={{
                  left: `${pointsAnimation.x}px`,
                  top: `${pointsAnimation.y}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                +10
              </div>
            )}

            <ul className="quiz-options-grid">
              {options.map(option => (
                <li key={option}>
                  <button
                    ref={registerRef(option)}
                    onClick={() => handleOptionClick(option)}
                    disabled={status !== 'idle' && status !== 'checking'}
                    className={getButtonClass(option)}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- INLINE FEEDBACK MESSAGE --- */}
        

          {/* --- ACTION BUTTON AREA --- */}
          <div className="quiz-action-container">
            {status === 'idle' || status === 'checking' ? (
              <button
                className="footer-action-button"
                onClick={handleCheck}
                disabled={!selected}
              >
                Check
              </button>
            ) : (
              <button
                className="footer-action-button"
                onClick={() => handleContinue()}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
