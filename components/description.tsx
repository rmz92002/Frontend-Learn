'use client';

import React, { ReactNode, ElementType } from 'react';

// --- PROPS INTERFACE ---
interface DescriptionProps {
  /** The content of the description. Can be a string or any JSX. */
  children: ReactNode;
  /** The HTML tag to render, e.g., 'p', 'div'. Defaults to 'p'. */
  as?: ElementType;
  /** Text alignment. Defaults to 'left'. */
  align?: 'left' | 'center' | 'justify';
  /** Optional custom class name for additional styling. */
  className?: string;
}

// --- STYLES (CSS-in-JS for encapsulation) ---
const styles = `
  :root {
    /* Define colors if they aren't already defined globally */
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  /* Base styles for the description paragraph */
  .duo-description {
    font-family: var(--duo-font-family);
    font-weight: 400; /* Standard weight */
    font-size: 1.0625rem; /* 17px, a comfortable reading size */
    color: #4b4b4b; /* A dark gray, softer than pure black */
    line-height: 1.65;
    
    /* Good default spacing for paragraphs */
    margin-bottom: 1.5rem; 

    /* Constrains width for better readability on wide screens */
    max-width: 70ch; 
  }

  /* Alignment helpers */
  .duo-description.align-left {
    text-align: left;
  }
  .duo-description.align-center {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
  .duo-description.align-justify {
    text-align: justify;
  }
`;

// --- COMPONENT LOGIC ---
export default function Description({
  children,
  as: Tag = 'p',
  align = 'left',
  className = ''
}: DescriptionProps) {
  
  // Combine all the classes together
  const finalClassName = `
    duo-description
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