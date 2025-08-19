'use client';

import React, { useState, ReactNode, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for classnames

// --- PROPS INTERFACE ---
interface QuizProps {
  children: ReactNode;
  answer: string;
  distractors?: string | string[]; // e.g., "option1|option2|option3" or array of distractors
  onContinue?: () => void;
}

// --- HELPER FUNCTION ---
const shuffle = (arr: string[]) => {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

// --- KEYFRAME STYLES ---
const keyframeStyles = `
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
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

// --- COMPONENT LOGIC ---
type QuizStatus = 'idle' | 'checking' | 'correct' | 'incorrect';

export default function MultipleChoiceQuiz({ children, answer, distractors = '', onContinue }: QuizProps) {

  const distractorList: string[] = useMemo(() => {
    if (Array.isArray(distractors)) return distractors.filter(Boolean);
    if (typeof distractors === 'string') return distractors.split('|').filter(Boolean);
    return [];
  }, [distractors]);

  const options = useMemo(() => shuffle([...distractorList, answer]), [distractorList, answer]);

  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');
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
      const btnEl = optionRefs.current.get(selected);
      const containerEl = containerRef.current;
      if (btnEl && containerEl) {
        const btnRect = btnEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        setPointsAnimation({
          x: btnRect.left - containerRect.left + btnRect.width / 2,
          y: btnRect.top,
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
    if (onContinue) {
      onContinue();
    }
  };

  const getButtonClass = (option: string) => {
    const isGraded = status !== 'idle' && status !== 'checking';
    const isCorrectAnswer = option === answer;
    const isSelected = option === selected;

    return cn(
      'w-full p-4 sm:p-6 text-left text-lg sm:text-xl font-bold border-2 border-b-4 rounded-xl transition-all duration-200 break-words',
      'text-gray-700 bg-white border-gray-200',
      'hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
      {
        'border-green-400 text-black-500': isSelected && !isGraded,
        'bg-green-100 border-green-500 text-green-600': isGraded && isCorrectAnswer,
        'bg-red-100 border-red-400 text-red-500': isGraded && isSelected && !isCorrectAnswer,
        'opacity-50': isGraded && !isSelected && !isCorrectAnswer,
      }
    );
  };

  const actionButtonClass = cn(
    'px-8 py-3 text-lg font-bold text-white uppercase rounded-xl border-b-4 transition-transform duration-200',
    'disabled:bg-gray-300 disabled:border-gray-400 disabled:cursor-not-allowed',
    {
      'bg-green-500 border-green-700 hover:bg-green-600 active:scale-95': status === 'idle' || status === 'checking',
      'bg-green-600 border-green-800 hover:bg-green-700 active:scale-95': status === 'correct' || status === 'incorrect',
    }
  );

  return (
    <>
      <style>{keyframeStyles}</style>
      <article ref={containerRef} className="flex flex-col justify-center items-center w-full min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-8 sm:mb-12 text-center break-words">
            {children}
          </h2>

           {/* {pointsAnimation && (
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
          )}  */}

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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

          <div className="mt-8 sm:mt-12 flex justify-center md:justify-end">
            {status === 'idle' || status === 'checking' ? (
              <button
                className={actionButtonClass}
                onClick={handleCheck}
                disabled={!selected}
              >
                Check
              </button>
            ) : (
              <button
                className={actionButtonClass}
                onClick={handleContinue}
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
