'use client';

import React, { useState, useMemo, useRef, ReactNode, useCallback } from 'react';

/**
 * PROPS
 */
interface DragAndMatchProps {
  children: ReactNode;
  /** Pipe + colon encoded pairs: "cat:gato|dog:perro" */
  pairs: string;
  onContinue?: () => void;
}

/**
 * STYLES - MODIFIED
 */
const styles = `
  :root {
    --duo-color-green: #58cc02; --duo-color-green-light: #d7ffb8; --duo-color-green-dark: #58a700;
    --duo-color-red: #ff4b4b; --duo-color-blue: #1cb0f6; --duo-color-blue-light: #ddf4ff;
    --duo-color-gray-light: #e5e5e5; --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  /* Animation for points when a correct match is made */
  @keyframes float-up {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-60px); }
  }
  .duo-match-container { width: 100vw; min-height: 100vh; margin: 0; font-family: var(--duo-font-family); background-color: #ffffff; border-radius: 0; border: none; display: flex; flex-direction: column; }
  .duo-match-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px; padding-bottom: 120px; position: relative; width: 100%; box-sizing: border-box; }
  /* Made the grid wider to fill more of the screen */
  .duo-match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; position: relative; width: 100%; max-width: 700px; margin: 0 auto; }
  .duo-match-column {
    display: flex;
    flex-direction: column;
    gap: 1.25rem; /* 20px, adjust as needed */
  }
  /* Made the matching items larger */
  .match-item { width: 100%; padding: 20px; font-size: 1.25rem; font-weight: 700; color: var(--duo-color-gray-medium); background-color: #ffffff; border: 2px solid var(--duo-color-gray-light); border-bottom-width: 4px; border-radius: 12px; cursor: pointer; text-align: center; user-select: none; transition: all 0.2s ease; }
  .match-item:hover:not(.paired):not(.disabled) { border-color: var(--duo-color-blue); }
  .match-item.selected { border-color: var(--duo-color-blue); background-color: var(--duo-color-blue-light); }
  .match-item.paired { border-color: var(--duo-color-green-dark); background-color: var(--duo-color-green-light); color: var(--duo-color-green-dark); cursor: default; }
  .match-item.incorrect { border-color: var(--duo-color-red); animation: shake 0.4s ease-in-out; }
  .connection-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; }
  .connection-lines line { stroke: var(--duo-color-green); stroke-width: 4px; stroke-linecap: round; }
  .footer-action-button { margin: 2.5rem auto 0 auto; display: block; padding: 14px 40px; font-size: 1rem; font-weight: 700; color: #ffffff; text-transform: uppercase; background-color: var(--duo-color-green); border: none; border-bottom: 4px solid var(--duo-color-green-dark); border-radius: 12px; cursor: pointer; }
  /* Class for the points animation */
  .points-animation { position: absolute; color: var(--duo-color-green); font-size: 1.75rem; font-weight: 800; animation: float-up 1s ease-out forwards; pointer-events: none; z-index: 10; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
`;

/**
 * INTERNAL TITLE
 */
const InternalTitle = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: 'var(--duo-font-family)',
      fontWeight: 800,
      color: '#3c3c3c',
      lineHeight: 1.3,
      fontSize: '1.75rem',
      textAlign: 'center',
      margin: '0 0 2.5rem 0',
    }}
  >
    {children}
  </h2>
);

/**
 * MATCH ITEM
 */
interface MatchItemProps {
  id: string;
  children: ReactNode;
  isSelected?: boolean;
  isPaired?: boolean;
  isIncorrect?: boolean;
  onClick?: () => void;
}
const MatchItem = React.forwardRef<HTMLDivElement, MatchItemProps>(
  ({ children, isSelected, isPaired, isIncorrect, onClick }, ref) => (
    <div
      ref={ref}
      className={`match-item ${isSelected ? 'selected' : ''} ${isPaired ? 'paired' : ''} ${
        isIncorrect ? 'incorrect' : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  ),
);
MatchItem.displayName = 'MatchItem';

/**
 * COMPONENT
 */
export default function Match({ children, pairs, onContinue }: DragAndMatchProps) {
  /**
   * Parse pairs prop into a { left: right } map.
   */
  const parsedPairs = useMemo(() => {
    const result: Record<string, string> = {};
    if (!pairs) return result;
    pairs.split('|').forEach((pairStr) => {
      const [key, value] = pairStr.split(':');
      if (key && value) result[key.trim()] = value.trim();
    });
    return result;
  }, [pairs]);

  /**
   * Shuffle left & right independently
   */
  const { leftItems, rightItems } = useMemo(() => {
    const keys = Object.keys(parsedPairs);
    const values = Object.values(parsedPairs);
    const rand = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
    return { leftItems: rand(keys), rightItems: rand(values) };
  }, [parsedPairs]);

  /**
   * STATE
   */
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [incorrectMatch, setIncorrectMatch] = useState<{ sourceId: string; targetId: string } | null>(
    null,
  );
  // State to manage the points animation
  const [pointsAnimation, setPointsAnimation] = useState<{ id: string; x: number; y: number } | null>(null);


  /**
   * Refs for line drawing and animations
   */
  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const contentRef = useRef<HTMLDivElement | null>(null);

  const registerRef = useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      itemRefs.current.set(id, el);
    };
  }, []);

  /**
   * CLICK HANDLERS
   */
  const handleSelectSource = (sourceId: string) => {
    if (matches[sourceId]) return;
    setSelectedSource((prev) => (prev === sourceId ? null : sourceId));
    setIncorrectMatch(null);
  };

  const handleSelectTarget = (targetId: string) => {
    if (!selectedSource || Object.values(matches).includes(targetId)) return;
    
    const correctTarget = parsedPairs[selectedSource];
    if (correctTarget === targetId) {
      setMatches((prev) => ({ ...prev, [selectedSource]: targetId }));

      // --- Trigger points animation ---
      const targetEl = itemRefs.current.get(targetId);
      const contentEl = contentRef.current;
      if (targetEl && contentEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const contentRect = contentEl.getBoundingClientRect();
        setPointsAnimation({
          id: `${selectedSource}-${targetId}`, // A unique key to re-trigger animation
          x: targetRect.left - contentRect.left + targetRect.width / 2,
          y: targetRect.top - contentRect.top,
        });
        // Remove the animation from state after it finishes
        setTimeout(() => setPointsAnimation(null), 1000);
      }
      // --- End animation logic ---
      
      setSelectedSource(null);
    } else {
      setIncorrectMatch({ sourceId: selectedSource, targetId });
      setTimeout(() => setIncorrectMatch(null), 500);
      setSelectedSource(null);
    }
  };

  /**
   * Completion
   */
  const isComplete =
    Object.keys(matches).length === Object.keys(parsedPairs).length &&
    Object.keys(parsedPairs).length > 0;

  /**
   * RENDER
   */
  return (
    <>
      <style>{styles}</style>
      <div className="duo-match-container">
        <div className="duo-match-content" ref={contentRef}>
          {children && <InternalTitle>{children}</InternalTitle>}

          {/* Render the points animation when state is set */}
          {pointsAnimation && (
            <div
              key={pointsAnimation.id}
              className="points-animation"
              style={{
                left: `${pointsAnimation.x}px`,
                top: `${pointsAnimation.y}px`,
                transform: 'translateX(-50%)', // Horizontally center above the item
              }}
            >
              +10
            </div>
          )}

          <div className="duo-match-grid">
            {/* LEFT COLUMN (sources) */}
            <div className="duo-match-column">
              {leftItems.map((item) => {
                const isPaired = !!matches[item];
                const isSelected = selectedSource === item;
                const isIncorrect = incorrectMatch?.sourceId === item;
                return (
                  <MatchItem
                    key={item}
                    id={item}
                    ref={registerRef(item)}
                    isSelected={isSelected}
                    isPaired={isPaired}
                    isIncorrect={isIncorrect}
                    onClick={() => handleSelectSource(item)}
                  >
                    {item}
                  </MatchItem>
                );
              })}
            </div>
            {/* RIGHT COLUMN (targets) */}
            <div className="duo-match-column">
              {rightItems.map((item) => {
                const isPaired = Object.values(matches).includes(item);
                const isIncorrect = incorrectMatch?.targetId === item;
                return (
                  <MatchItem
                    key={item}
                    id={item}
                    ref={registerRef(item)}
                    isPaired={isPaired}
                    isIncorrect={isIncorrect}
                    onClick={() => handleSelectTarget(item)}
                  >
                    {item}
                  </MatchItem>
                );
              })}
            </div>

            {/* CONNECTION LINES */}
            <svg className="connection-lines">
              {Object.entries(matches).map(([sourceId, targetId]) => {
                const sourceEl = itemRefs.current.get(sourceId);
                const targetEl = itemRefs.current.get(targetId);
                if (!sourceEl || !targetEl) return null;
                const gridEl = sourceEl.closest('.duo-match-grid') as HTMLElement | null;
                if (!gridEl) return null;
                const sourceRect = sourceEl.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();
                const containerRect = gridEl.getBoundingClientRect();
                const x1 = sourceRect.right - containerRect.left;
                const y1 = sourceRect.top - containerRect.top + sourceRect.height / 2;
                const x2 = targetRect.left - containerRect.left;
                const y2 = targetRect.top - containerRect.top + targetRect.height / 2;
                return <line key={sourceId} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
            </svg>
          </div>

        <button
          className="footer-action-button"
          style={{
            opacity: Object.keys(matches).length > 0 ? 1 : 0.5,
            pointerEvents: Object.keys(matches).length > 0 ? 'auto' : 'none',
            transition: 'opacity 0.2s',
          }}
          disabled={Object.keys(matches).length === 0}
          onClick={onContinue}
        >
          Continue
        </button>
        </div>
      </div>
    </>
  );
}
