'use client';

import React, { ReactNode } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

// You MUST import the KaTeX CSS for it to render correctly.
// You can do this here or in your global layout/CSS file.
import 'katex/dist/katex.min.css';

// --- PROPS INTERFACE ---
interface MathProps {
  /** The LaTeX math string to render, e.g., 'c = \\pm\\sqrt{a^2 + b^2}' */
  children: string;
  /** How to display the math. 'block' is for centered, display equations. 'inline' is for within a line of text. */
  display?: 'block' | 'inline';
  /** Optional custom class name for the container. */
  className?: string;
}

// --- STYLES (CSS-in-JS for the container) ---
const styles = `
  :root {
    --duo-color-gray-light: #e5e5e5;
  }

  /* Styling for the block-level container */
  .duo-mathblock-container {
    background-color: #f7f7f7;
    border: 2px solid var(--duo-color-gray-light);
    border-radius: 12px;
    padding: 24px;
    /* Center the block and let its width shrink‑wrap around the content */
    margin: 1.5rem auto;
    display: inline-block;
    max-width: 90%;
    overflow-x: auto; 
  }
  
  /* KaTeX font size adjustment for consistency */
  .katex {
    font-size: 1.2em !important; 
  }

.block{
    font-size: 2em !important;
}
`;

// --- COMPONENT LOGIC ---
export default function MathKatex({
  children,
  display = 'block',
  className = ''
}: MathProps) {

  // Validate that children is a string
  if (typeof children !== 'string') {
    console.error("DuolingoMath component's child must be a string of LaTeX.");
    return <span style={{color: 'red'}}>Error: Math content must be a string.</span>;
  }
  
  if (display === 'inline') {
    return <InlineMath math={children} />;
  }
  
  // For 'block' display
  const finalClassName = `duo-mathblock-container ${className}`.trim();
  
  return (
    <>
      <style>{styles}</style>
      <div className={finalClassName + ' block'}>
        <BlockMath math={children} />
      </div>
    </>
  );
}