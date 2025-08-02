'use client';

import React, { ReactNode } from 'react';

// --- PROPS INTERFACE ---
interface FoldProps {
  title: ReactNode;     // Accepts string or JSX (icon, math, etc)
  children: ReactNode;  // The collapsible content
  open?: boolean;       // Optional: should it be open by default?
  className?: string;   // For custom styling
}

// --- STYLES (CSS-in-JS for encapsulation and consistency) ---
const styles = `
  :root {
    /* Define colors if they aren't already defined globally */
    --duo-color-gray-light: #e5e5e5;
    --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  /* The main container for the collapsible section */
  .duo-fold-container {
    font-family: var(--duo-font-family);
    background-color: #ffffff;
    border: 2px solid var(--duo-color-gray-light);
    border-radius: 16px;
    margin-bottom: 1rem;
    overflow: hidden; /* Ensures content stays within rounded corners */
    transition: all 0.2s ease-in-out;
  }

  /* The clickable header area */
  .duo-fold-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 700;
    color: #3c3c3c;
    transition: background-color 0.2s ease;
    user-select: none; /* Prevents text selection on click */
  }

  /* Remove the default arrow/marker from the <summary> element */
  .duo-fold-summary::-webkit-details-marker {
    display: none;
  }
  .duo-fold-summary {
    list-style: none;
  }

  .duo-fold-summary:hover {
    background-color: #f7f7f7;
  }
  
  /* The animated chevron icon */
  .duo-fold-chevron {
    width: 24px;
    height: 24px;
    color: var(--duo-color-gray-medium);
    transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  /* Rotate the chevron when the 'open' attribute is present on the <details> tag */
  .duo-fold-container[open] > .duo-fold-summary .duo-fold-chevron {
    transform: rotate(90deg);
  }
  
  .duo-fold-title {
    margin-right: 1rem;
  }

  /* The content area that appears/disappears */
  .duo-fold-content {
    padding: 16px;
    color: var(--duo-color-gray-medium);
    font-size: 1rem;
    line-height: 1.6;
    /* Add a separator line when the section is open */
    border-top: 2px solid var(--duo-color-gray-light);
  }
`;

// A simple chevron SVG icon component
const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);


// --- COMPONENT LOGIC ---
export default function Fold({
  title,
  children,
  open = false,
  className = ''
}: FoldProps) {
  return (
    <>
      {/* Inject styles into the document head */}
      <style>{styles}</style>

      <details
        open={open}
        className={`duo-fold-container ${className}`}
      >
        <summary className="duo-fold-summary">
          <span className="duo-fold-title">{title}</span>
          <ChevronIcon className="duo-fold-chevron" />
        </summary>
        <div className="duo-fold-content">
          {children}
        </div>
      </details>
    </>
  );
}