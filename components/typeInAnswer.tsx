'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// --- PROPS INTERFACE ---
interface TypeInAnswerProps {
  children: ReactNode;
  answers: string;
  placeholder?: string;
  onContinue?: () => void;
}

// --- KEYFRAME STYLES ---
const keyframeStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @keyframes float-up {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-60px); }
  }
  .points-animation {
    position: absolute;
    color: #58cc02; /* Green-500 */
    font-size: 1.75rem;
    font-weight: 800;
    animation: float-up 1s ease-out forwards;
    pointer-events: none;
    z-index: 10;
    left: 50%;
    top: -32px;
    transform: translateX(-50%);
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .shake-animation {
    animation: shake 0.4s ease-in-out;
  }
`;

// --- MAIN COMPONENT LOGIC ---
type QuizStatus = 'idle' | 'correct' | 'incorrect';

export default function TypeInAnswer({ children, answers, placeholder = "Type your answer...", onContinue }: TypeInAnswerProps) {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [pointsAnimation, setPointsAnimation] = useState<boolean>(false);
  const [showingAnswer, setShowingAnswer] = useState(false);

  const parsedAnswers = useMemo(() => {
    return answers.split('|').map(a => a.trim().toLowerCase());
  }, [answers]);

  const handleCheck = () => {
    const userInput = inputValue.trim().toLowerCase();
    const isCorrect = parsedAnswers.includes(userInput);
    
    if (isCorrect) {
      setStatus('correct');
      setPointsAnimation(true);
      setTimeout(() => setPointsAnimation(false), 1000);
    } else {
      setStatus('incorrect');
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

  const handleContinue = () => {
    setShowingAnswer(false);
    setInputValue('');
    setStatus('idle');
    if (onContinue) {
      onContinue();
    }
  };

  const inputClassName = cn(
    'w-full max-w-lg text-center text-xl sm:text-2xl font-bold p-4 sm:p-5 border-2 border-b-4 rounded-xl transition-all duration-200 bg-white',
    'focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200',
    'placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed',
    {
      'border-gray-200 text-gray-700': status === 'idle',
      'border-green-500 bg-green-50 text-green-700 focus:border-green-500': status === 'correct',
      'border-red-400 text-red-600 shake-animation': status === 'incorrect',
    }
  );

  const actionButtonClass = cn(
    'px-8 py-3 text-lg font-bold text-white uppercase rounded-xl border-b-4 transition-transform duration-200',
    'disabled:bg-gray-300 disabled:border-gray-400 disabled:cursor-not-allowed',
    {
      'bg-green-500 border-green-700 hover:bg-green-600 active:scale-95': status === 'idle' || status === 'incorrect',
      'bg-green-600 border-green-800 hover:bg-green-700 active:scale-95': status === 'correct',
    }
  );

  return (
    <>
      <style>{keyframeStyles}</style>
      <div className="flex flex-col justify-center items-center w-full min-h-screen bg-white p-4 sm:p-6">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          
          {children && (
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center break-words">
              {children}
            </h2>
          )}

          <div className="relative w-full flex justify-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (status === 'incorrect') {
                  setStatus('idle');
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={inputClassName}
              disabled={status === 'correct'}
              autoFocus
            />
            {/* {pointsAnimation && <div className="points-animation">+10</div>} */}
          </div>

          {status !== 'correct' && !showingAnswer && (
            <button
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              onClick={() => {
                setShowingAnswer(true);
                setStatus('incorrect');
              }}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Show Answer
            </button>
          )}
          {showingAnswer && (
            <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm max-w-lg w-full">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Correct Answer</h3>
                  <div className="text-blue-700 font-medium text-lg">
                    {answers.split('|').map((answer, index) => (
                      <span key={index} className="inline-block bg-white px-3 py-1 rounded-full mr-2 mb-2 shadow-sm">
                        {answer.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 sm:mt-10">
            {status === 'correct' || showingAnswer ? (
              <button className={actionButtonClass} onClick={handleContinue}>
                Continue
              </button>
            ) : (
              <button
                className={actionButtonClass}
                onClick={handleCheck}
                disabled={!inputValue.trim()}
              >
                Check
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
