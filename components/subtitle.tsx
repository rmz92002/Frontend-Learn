'use client';

import React, { ReactNode, ElementType } from 'react';

// --- PROPS INTERFACE ---
interface SubtitleProps {
  /** The content of the subtitle. Can be a string or any JSX. */
  children: ReactNode;
  /** The HTML tag to render, e.g., 'p', 'h3'. Defaults to 'p'. */
  as?: ElementType;
  /** Text alignment. Defaults to 'center'. */
  align?: 'left' | 'center' | 'right';
  /** Optional custom class name for additional styling. */
  className?: string;
}

// --- STYLES (CSS-in-JS for encapsulation) ---
const styles = `
  :root {
    /* Define colors if they aren't already defined globally */
    --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  /* Base styles for the subtitle */
  .duo-subtitle {
    font-family: var(--duo-font-family);
    font-weight: 400; /* Regular font weight for readability */
    font-size: 1.125rem; /* Slightly larger than standard body text */
    color: var(--duo-color-gray-medium);
    line-height: 1.6;
    
    /* Pulls it closer to the Title above it, and adds space below */
    margin: -1.5rem auto 2.5rem; 

    /* Constrains width for better readability on wide screens */
    max-width: 65ch; 
  }

  /* Alignment helpers */
  .duo-subtitle.align-center {
    text-align: center;
  }
  .duo-subtitle.align-left {
    text-align: left;
    margin-left: 0;
    margin-right: 0;
  }
  .duo-subtitle.align-right {
    text-align: right;
    margin-left: 0;
    margin-right: 0;
  }
`;

// --- COMPONENT LOGIC ---
export default function Subtitle({
  children,
  as: Tag = 'p',
  align = 'center',
  className = ''
}: SubtitleProps) {
  
  // Combine all the classes together
  const finalClassName = `
    duo-subtitle
    align-${align}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <>
      <style>{styles}</style>
      <Tag className={finalClassName}>
        {children}
      </Tag>
    </>
  );
}