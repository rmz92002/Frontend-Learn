'use client';

import React, { ReactNode, ElementType } from 'react';

// --- PROPS INTERFACE ---
interface TitleProps {
  /** The content of the title. Can be a string or any JSX. */
  children: ReactNode;
  /** The HTML tag to render, e.g., 'h1', 'h2'. Defaults to 'h1'. */
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
    --duo-color-gray-light: #e5e5e5;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  /* Base styles for the title */
  .duo-title {
    font-family: var(--duo-font-family);
    font-weight: 800; /* Extra bold for impact */
    color: #3c3c3c;
    line-height: 1.3;
    margin: 1rem 0 2.5rem; /* Ample space above and below */
    padding: 0;
  }

  /* Tag-specific font sizes for semantic hierarchy */
  .duo-title.tag-h1 {
    font-size: 2.25rem;
  }
  .duo-title.tag-h2 {
    font-size: 1.75rem;
  }
  .duo-title.tag-h3 {
    font-size: 1.5rem;
  }

  /* Alignment helpers */
  .duo-title.align-center {
    text-align: center;
  }
  .duo-title.align-left {
    text-align: left;
  }
  .duo-title.align-right {
    text-align: right;
  }

  /* The signature Duolingo underline/separator for centered titles */
  .duo-title.align-center::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background-color: var(--duo-color-gray-light);
    border-radius: 2px;
    margin: 1rem auto 0;
  }
`;

// --- COMPONENT LOGIC ---
export default function Title({
  children,
  as: Tag = 'h1',
  align = 'center',
  className = ''
}: TitleProps) {
  
  // Combine all the classes together
  const finalClassName = `
    duo-title
    tag-${Tag}
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