'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

// --- TYPES & PROPS ---
interface SortTheSentenceProps {
  /** The question or title for the quiz. */
  children: ReactNode;
  /** The full, correct sentence as a string. E.g., "The cat sat on the mat" */
  correctSentence: string;
  onContinue?: () => void;
}

type WordItem = { id: string; text: string };

// --- STYLES (CSS-in-JS) ---
const styles = `
  :root {
    --duo-color-green: #58cc02; --duo-color-green-light: #d7ffb8; --duo-color-green-dark: #58a700;
    --duo-color-red: #ff4b4b; --duo-color-red-light: #ffdfe0; --duo-color-blue-light: #ddf4ff;
    --duo-color-gray-light: #e5e5e5; --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .duo-sort-container { max-width: 600px; margin: 2rem auto; font-family: var(--duo-font-family); background-color: #ffffff; border-radius: 16px; border: 2px solid var(--duo-color-gray-light); }
  .duo-sort-content { padding: 24px; }
  
  .sentence-area, .word-bank-area {
    display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px;
    padding: 16px; min-height: 60px;
  }
  .sentence-area {
    border-bottom: 2px solid var(--duo-color-gray-light);
    margin-bottom: 24px;
  }
  .word-bank-area { min-height: 120px; }

  .drop-zone.over { background-color: var(--duo-color-blue-light); border-radius: 12px; }
  
  .word-chip { padding: 8px 16px; font-size: 1.1rem; font-weight: 700; background-color: #fff; border: 2px solid var(--duo-color-gray-light); border-bottom-width: 4px; border-radius: 12px; cursor: grab; user-select: none; }
  .word-chip.dragging { opacity: 0.3; }

  /* Footer */
  .duo-sort-footer { background-color: #ffffff; min-height: 100px; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; display: flex; align-items: center; padding: 0 24px; border-top: 2px solid var(--duo-color-gray-light); margin-top: 24px; }
  .duo-sort-footer.correct-banner { background-color: var(--duo-color-green-light); border-top-color: var(--duo-color-green-dark); }
  .duo-sort-footer.incorrect-banner { background-color: var(--duo-color-red-light); border-top-color: var(--duo-color-red); }
  .feedback-message { display: flex; align-items: center; gap: 12px; font-size: 1.2rem; font-weight: 700; }
  .feedback-message.correct-text { color: var(--duo-color-green-dark); }
  .feedback-message.incorrect-text { color: var(--duo-color-red); }
  .footer-action-button { min-width: 140px; text-align: center; margin-left: auto; padding: 14px 40px; font-size: 1rem; font-weight: 700; color: #ffffff; text-transform: uppercase; background-color: var(--duo-color-green); border: none; border-bottom: 4px solid var(--duo-color-green-dark); border-radius: 12px; cursor: pointer; }
  .footer-action-button:disabled { background-color: var(--duo-color-gray-light); border-color: var(--duo-color-gray-medium); color: var(--duo-color-gray-medium); cursor: not-allowed; }
`;

// --- HELPER COMPONENTS ---
const InternalTitle = ({ children }: { children: ReactNode }) => ( <h2 style={{ fontFamily: 'var(--duo-font-family)', fontWeight: 800, color: '#3c3c3c', fontSize: '1.75rem', textAlign: 'center', margin: '0 0 2.5rem 0' }}>{children}</h2> );
const WordChip = React.forwardRef<HTMLDivElement, { children: ReactNode, isDragging?: boolean }>(({ children, isDragging, ...props }, ref) => ( <div ref={ref} className={`word-chip ${isDragging ? 'dragging' : ''}`} {...props}>{children}</div> ));
WordChip.displayName = 'WordChip';
const DraggableWord = ({ item }: { item: WordItem }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  return <WordChip ref={setNodeRef} isDragging={isDragging} {...listeners} {...attributes}>{item.text}</WordChip>;
};
const DropZone = ({ id, children, isOver }: { id: string, children: ReactNode, isOver: boolean }) => {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className={`drop-zone ${isOver ? 'over' : ''}`}>{children}</div>;
};

// --- MAIN COMPONENT LOGIC ---
type QuizStatus = 'idle' | 'correct' | 'incorrect';

export default function SortTheSentence({ children, correctSentence, onContinue }: SortTheSentenceProps) {
  const initialWords = useMemo(() => {
    return correctSentence.split(' ')
      .map((word, index) => ({ id: `word-${index}`, text: word }))
      .sort(() => Math.random() - 0.5);
  }, [correctSentence]);

  const [wordBank, setWordBank] = useState<WordItem[]>(initialWords);
  const [currentSentence, setCurrentSentence] = useState<WordItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    // Lock sentence once it's correct, otherwise allow edits
    if (status === 'correct') return;

    // If the user was incorrect and starts moving words, reset state
    if (status === 'incorrect') {
      setStatus('idle');
      setFeedback(null);
    }

    setActiveId(event.active.id as string);
  };
  
  const findItemAndContainer = (id: string): [WordItem | undefined, 'wordBank' | 'currentSentence'] => {
      let item = wordBank.find(i => i.id === id);
      if (item) return [item, 'wordBank'];
      item = currentSentence.find(i => i.id === id);
      if (item) return [item, 'currentSentence'];
      return [undefined, 'wordBank'];
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (status === 'correct') return;
    const { active, over } = event;

    const [activeItem, sourceContainer] = findItemAndContainer(active.id as string);
    if (!activeItem) return;

    const overContainerId = over ? String(over.id) : null;
    const isOverSentence = overContainerId === 'sentence-drop-zone' || currentSentence.some(item => item.id === overContainerId);
    const isOverBank = overContainerId === 'bank-drop-zone' || wordBank.some(item => item.id === overContainerId);
    
    // Move logic
    if (sourceContainer === 'wordBank' && isOverSentence) {
        setWordBank(prev => prev.filter(i => i.id !== activeItem.id));
        setCurrentSentence(prev => [...prev, activeItem]);
    } else if (sourceContainer === 'currentSentence' && isOverBank) {
        setCurrentSentence(prev => prev.filter(i => i.id !== activeItem.id));
        setWordBank(prev => [...prev, activeItem]);
    } else if (sourceContainer === 'currentSentence' && isOverSentence && overContainerId && over) {
        // Reorder within sentence
        const oldIndex = currentSentence.findIndex(i => i.id === active.id);
        const newIndex = currentSentence.findIndex(i => i.id === over.id);
        if (oldIndex !== newIndex) {
            setCurrentSentence(prev => {
                const newItems = [...prev];
                const [removed] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, removed);
                return newItems;
            });
        }
    }
  };

  const handleCheck = () => {
    const userAnswer = currentSentence.map(item => item.text).join(' ');
    if (userAnswer === correctSentence) {
      setStatus('correct');
      setFeedback('Perfect!');
    } else {
      setStatus('incorrect');
      setFeedback('Not quite. Try a different order.');
    }
  };

  const activeItem = activeId ? (wordBank.find(i=>i.id===activeId) || currentSentence.find(i=>i.id===activeId)) : null;
  const isCheckDisabled = wordBank.length > 0;

  return (
    <>
      <style>{styles}</style>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="duo-sort-container">
          <div className="duo-sort-content">
            {children && <InternalTitle>{children}</InternalTitle>}
            
            <DropZone id="sentence-drop-zone" isOver={!!activeId}>
              <div className="sentence-area">
                {currentSentence.map(item => <DraggableWord key={item.id} item={item} />)}
              </div>
            </DropZone>
            
            <DropZone id="bank-drop-zone" isOver={!!activeId}>
              <div className="word-bank-area">
                {wordBank.map(item => <DraggableWord key={item.id} item={item} />)}
              </div>
            </DropZone>

            <div
              className={`duo-sort-footer ${
                status === 'correct' ? 'correct-banner' : ''
              } ${status === 'incorrect' ? 'incorrect-banner' : ''}`}
            >
              {status === 'correct' && (
                <div className="feedback-message correct-text">
                  <span className="icon">✅</span> {feedback}
                </div>
              )}
              {status === 'incorrect' && (
                <div className="feedback-message incorrect-text">
                  <span className="icon">❌</span> {feedback}
                </div>
              )}
              <button className="footer-action-button" onClick={onContinue}>
                  Continue
                </button>

              {status === 'correct' ? (
                <button className="footer-action-button" onClick={onContinue}>
                  Continue
                </button>
              ) : (
                <button
                  className="footer-action-button"
                  onClick={handleCheck}
                  disabled={isCheckDisabled}
                >
                  {status === 'idle' ? 'Check' : 'Try\u00A0Again'}
                </button>
              )}
            </div>
          </div>
          
          <DragOverlay>
            {activeItem ? <WordChip>{activeItem.text}</WordChip> : null}
          </DragOverlay>
        </div>
      </DndContext>
    </>
  );
}
