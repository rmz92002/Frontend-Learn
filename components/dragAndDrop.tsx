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

// --- PROPS INTERFACE ---
interface DragToBucketsProps {
  /** The question or title for the quiz. */
  children: ReactNode;
  /** A pipe-delimited string of bucket names. E.g., "Fruits|Vegetables|Dairy" */
  buckets: string;
  /** A pipe-delimited string of items and their correct bucket. E.g., "Apple:Fruits|Carrot:Vegetables|Milk:Dairy" */
  items: string;
  onContinue?: () => void;
}

// --- STYLES (CSS-in-JS) ---
const styles = `
  :root {
    --duo-color-green: #58cc02; --duo-color-green-light: #d7ffb8; --duo-color-green-dark: #58a700;
    --duo-color-red: #ff4b4b; --duo-color-red-light: #ffdfe0; --duo-color-blue-light: #ddf4ff;
    --duo-color-gray-light: #e5e5e5; --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .duo-buckets-container { max-width: 700px; margin: 2rem auto; font-family: var(--duo-font-family); background-color: #ffffff; border-radius: 16px; border: 2px solid var(--duo-color-gray-light); }
  .duo-buckets-content { padding: 24px; position: relative; }
  .buckets-area { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .bucket { border: 2px dashed var(--duo-color-gray-light); border-radius: 12px; min-height: 150px; display: flex; flex-direction: column; transition: background-color 0.2s ease; }
  .bucket.over { background-color: var(--duo-color-blue-light); }
  .bucket-title { font-weight: 700; color: var(--duo-color-gray-medium); text-align: center; padding: 12px; border-bottom: 2px dashed var(--duo-color-gray-light); }
  .bucket-content { padding: 12px; display: flex; flex-wrap: wrap; gap: 8px; flex-grow: 1; }
  
  .word-bank-container { border-top: 2px solid var(--duo-color-gray-light); padding-top: 24px; }
  .word-bank { min-height: 60px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 12px; }

  .word-chip { padding: 8px 20px; font-size: 1.1rem; font-weight: 700; background-color: #fff; border: 2px solid var(--duo-color-gray-light); border-bottom-width: 4px; border-radius: 12px; cursor: grab; user-select: none; }
  .word-chip.dragging { opacity: 0.3; }

  /* Footer */
  .duo-buckets-footer {
    margin-top: 24px;
    min-height: 80px;
    display: flex;
    align-items: center;
    border-top: 2px solid var(--duo-color-gray-light);
    border-radius: 12px;
    background-color: #ffffff;
  }
  .duo-buckets-footer.correct-banner { background-color: var(--duo-color-green-light); border-top-color: var(--duo-color-green-dark); }
  .duo-buckets-footer.incorrect-banner { background-color: var(--duo-color-red-light); border-top-color: var(--duo-color-red); }
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

const DraggableWord = ({ id }: { id: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return <WordChip ref={setNodeRef} isDragging={isDragging} {...listeners} {...attributes}>{id}</WordChip>;
};

const Bucket = ({ id, title, children }: { id: string, title: string, children: ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className={`bucket ${isOver ? 'over' : ''}`}><div className="bucket-title">{title}</div><div className="bucket-content">{children}</div></div>;
};

// --- MAIN COMPONENT LOGIC ---
type QuizStatus = 'idle' | 'correct' | 'incorrect';
const WORD_BANK = 'word-bank';

export default function DragToBuckets({ children, buckets, items, onContinue }: DragToBucketsProps) {
  // Parse string props into usable arrays and objects
  const { bucketList, itemSolutions } = useMemo(() => {
    const bucketList = buckets.split('|').map(b => b.trim());
    const itemSolutions: Record<string, string> = {};
    const allItems = items.split('|').map(i => {
      const [item, bucket] = i.split(':');
      if(item && bucket) itemSolutions[item.trim()] = bucket.trim();
      return item.trim();
    }).sort(() => Math.random() - 0.5);
    return { bucketList, itemSolutions, allItems };
  }, [buckets, items]);
  
  // State to track where each item is located
  const [containers, setContainers] = useState<Record<string, string[]>>(() => {
    const initialContainers: Record<string, string[]> = { [WORD_BANK]: Object.keys(itemSolutions) };
    bucketList.forEach(bucket => initialContainers[bucket] = []);
    return initialContainers;
  });
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    if (status !== 'idle') return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (status !== 'idle') return;
    const { active, over } = event;

    if (over && active.id) {
      const sourceContainer = Object.keys(containers).find(key => containers[key].includes(active.id as string));
      const destinationContainer = over.id as string;
      
      if (sourceContainer && sourceContainer !== destinationContainer) {
        setContainers(prev => {
          const newContainers = { ...prev };
          // Remove from source
          newContainers[sourceContainer] = newContainers[sourceContainer].filter(id => id !== active.id);
          // Add to destination
          newContainers[destinationContainer] = [...newContainers[destinationContainer], active.id as string];
          return newContainers;
        });
      }
    }
  };
  
  const handleCheck = () => {
    let isAllCorrect = true;
    if (containers[WORD_BANK].length > 0) {
      isAllCorrect = false; // Not all items were sorted
    } else {
      for (const bucket of bucketList) {
        for (const item of containers[bucket]) {
          if (itemSolutions[item] !== bucket) {
            isAllCorrect = false;
            break;
          }
        }
        if (!isAllCorrect) break;
      }
    }
    
    if (isAllCorrect) {
      setStatus('correct');
      setFeedback('Perfect! All sorted correctly.');
    } else {
      setStatus('incorrect');
      setFeedback('Not quite right. Double-check your categories.');
    }
  };

  const isLocked = status !== 'idle';
  const canCheck = containers[WORD_BANK].length === 0;

  return (
    <>
      <style>{styles}</style>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="duo-buckets-container">
          <div className="duo-buckets-content">
            {children && <InternalTitle>{children}</InternalTitle>}
            <div className="buckets-area">
              {bucketList.map(bucketId => (
                <Bucket key={bucketId} id={bucketId} title={bucketId}>
                  {containers[bucketId]?.map(item => <DraggableWord key={item} id={item} />)}
                </Bucket>
              ))}
            </div>
            <div className="word-bank-container">
              <Bucket id={WORD_BANK} title="Items to sort">
                {containers[WORD_BANK]?.map(item => <DraggableWord key={item} id={item} />)}
              </Bucket>
            </div>

            {/* ---- Feedback & Actions Footer ---- */}
            <footer
              className={`duo-buckets-footer ${
                status === 'correct' ? 'correct-banner' : ''
              } ${status === 'incorrect' ? 'incorrect-banner' : ''}`}
            >
              {status !== 'idle' && feedback && (
                <div
                  className={`feedback-message ${
                    status === 'correct' ? 'correct-text' : 'incorrect-text'
                  }`}
                >
                  {status === 'correct' ? '✅' : '❌'} {feedback}
                </div>
              )}

              {status === 'idle' ? (
                <button
                  className="footer-action-button"
                  onClick={handleCheck}
                  disabled={!canCheck}
                >
                  Check
                </button>
              ) : (
                <button
                  className="footer-action-button"
                  onClick={onContinue}
                >
                  Continue
                </button>
              )}
            </footer>
          </div>
          <DragOverlay>
            {activeId ? <WordChip>{activeId}</WordChip> : null}
          </DragOverlay>
        </div>
      </DndContext>
    </>
  );
}