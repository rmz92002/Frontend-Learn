'use client';

import React, { useState, ReactNode } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- PROPS INTERFACE ---
interface CodeProps {
  code: string;         // The code snippet to display
  language: string;     // e.g., 'tsx', 'css', 'javascript'
  title?: ReactNode;    // Optional title/filename for the header
  className?: string;   // For custom styling
}

// --- STYLES (CSS-in-JS for encapsulation) ---
const styles = `
  :root {
    /* Define colors if they aren't already defined globally */
    --duo-color-green: #58cc02;
    --duo-color-green-light: #d7ffb8;
    --duo-color-green-dark: #58a700;
    --duo-color-gray-light: #e5e5e5;
    --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  /* Main container with the Duolingo-style border and radius */
  .duo-code-container {
    font-family: var(--duo-font-family);
    border: 2px solid var(--duo-color-gray-light);
    border-radius: 16px;
    margin-bottom: 1rem;
    overflow: hidden; /* Important for child elements to respect the radius */
  }

  /* Header for the title and copy button */
  .duo-code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f7f7f7;
    padding: 8px 16px;
    border-bottom: 2px solid var(--duo-color-gray-light);
  }

  .duo-code-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--duo-color-gray-medium);
  }

  /* The copy button styling */
  .duo-code-copy-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--duo-color-gray-medium);
    background-color: #ffffff;
    border: 2px solid var(--duo-color-gray-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .duo-code-copy-button:hover {
    background-color: #f0f0f0;
    border-color: #dcdcdc;
  }
  
  /* Style for when the button is in the "Copied" state */
  .duo-code-copy-button.copied {
    color: var(--duo-color-green-dark);
    background-color: var(--duo-color-green-light);
    border-color: var(--duo-color-green);
  }

  /* Custom overrides for the syntax highlighter component */
  .duo-code-block pre {
    margin: 0 !important; /* Remove default margin */
    padding: 16px !important; /* Apply our own padding */
    border-radius: 0 !important; /* The container handles the radius */
  }
`;

// --- COMPONENT LOGIC ---
export default function Code({
  code,
  language,
  title,
  className = ''
}: CodeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500); // Reset after 2.5 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // You could add error state handling here
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`duo-code-container ${className}`}>
        {/* Render header only if a title is provided */}
        {title && (
          <header className="duo-code-header">
            <div className="duo-code-title">{title}</div>
            <button
              onClick={handleCopy}
              className={`duo-code-copy-button ${isCopied ? 'copied' : ''}`}
              disabled={isCopied}
            >
              {isCopied ? 'Copied! ✅' : 'Copy'}
            </button>
          </header>
        )}
        
        <div className="duo-code-block">
          <SyntaxHighlighter
            language={language}
            style={atomOneLight}
            customStyle={{
              // Ensure our container's styling takes precedence
              backgroundColor: 'transparent',
            }}
            codeTagProps={{
              style: {
                // Use a modern monospaced font
                fontFamily: "'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace",
                fontSize: '0.9rem',
              },
            }}
            PreTag="pre" // This is important for the CSS selector to work
          >
            {code.trim()}
          </SyntaxHighlighter>
        </div>
      </div>
    </>
  );
}