'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-coy.css';

// --- TYPES & PROPS ---
type Language = 'javascript' | 'python';
type QuizStatus = 'idle' | 'correct' | 'incorrect';

interface InteractiveCodeTesterProps {
  question: ReactNode;
  initialCode: string;
  language: Language;
  /**
   * A string of code containing test cases.
   * For JS, use the provided `assert(condition, message)` function.
   * For Python, use the standard `assert condition, message` statement.
   * The tests pass if this code runs without throwing an error.
   */
  testCode: string;
  onContinue?: () => void;
  className?: string;
}

declare global {
  interface Window {
    pyodide: any;
    loadPyodide: (args: any) => Promise<any>;
  }
}

// --- STYLES (Reusing styles from previous components) ---
const styles = `
  :root {
    --duo-color-green: #58cc02;
    --duo-color-green-light: #d7ffb8;
    --duo-color-green-dark: #58a700;
    --duo-color-red: #ff4b4b;
    --duo-color-red-light: #ffdfe0;
    --duo-color-gray-light: #e5e5e5;
    --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --duo-font-family-mono: 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace;
  }
  
  .duo-tester-container { max-width: 700px; margin: 2rem auto; font-family: var(--duo-font-family); padding-bottom: 120px; position: relative; background-color: #ffffff; border-radius: 16px; border: 2px solid var(--duo-color-gray-light); }
  .duo-tester-question { font-size: 1.5rem; font-weight: 700; color: #3c3c3c; padding: 24px 24px 16px; }
  .editor-wrapper { margin: 0 24px 24px; border: 2px solid var(--duo-color-gray-light); border-radius: 12px; overflow: hidden; }
  .prism-editor-wrapper { background: #fdfdfd; min-height: 150px; font-family: var(--duo-font-family-mono); font-size: 0.95rem; padding: 16px !important; }
  .duo-tester-footer { position: absolute; bottom: 0; left: 0; right: 0; border-top: 2px solid var(--duo-color-gray-light); background-color: #ffffff; height: 100px; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; display: flex; align-items: center; padding: 0 24px;  }
  .duo-tester-footer.correct-banner { background-color: var(--duo-color-green-light); border-top-color: var(--duo-color-green-dark); }
  .duo-tester-footer.incorrect-banner { background-color: var(--duo-color-red-light); border-top-color: var(--duo-color-red); }
  .feedback-message { display: flex; align-items: center; gap: 12px; font-size: 1.2rem; font-weight: 700; }
  .feedback-message.correct-text { color: var(--duo-color-green-dark); }
  .feedback-message.incorrect-text { color: var(--duo-color-red); }
  .feedback-message .icon { font-size: 1.5rem; }
  .footer-action-button { min-width: 140px; text-align: center; margin-left: auto; padding: 14px 40px; font-size: 1rem; font-weight: 700; color: #ffffff; text-transform: uppercase; background-color: var(--duo-color-green); border: none; border-bottom: 4px solid var(--duo-color-green-dark); border-radius: 12px; cursor: pointer; transition: filter 0.2s ease; }
  .footer-action-button:hover:not(:disabled) { filter: brightness(1.1); }
  .footer-action-button:disabled { background-color: var(--duo-color-gray-light); border-color: var(--duo-color-gray-medium); color: var(--duo-color-gray-medium); cursor: not-allowed; }
`;

// --- COMPONENT LOGIC ---
export default function InteractiveCodeTester({
  question,
  initialCode,
  language,
  testCode,
  onContinue,
  className = ''
}: InteractiveCodeTesterProps) {
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  // Pyodide loading logic (same as before, safe and sound)
  useEffect(() => {
    if (language !== 'python' || window.pyodide) {
      if(window.pyodide && !pyodide) setPyodide(window.pyodide);
      return;
    }
    const scriptId = 'pyodide-script';
    if(document.getElementById(scriptId)) return;
    setPyodideLoading(true);
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    script.async = true;
    script.onload = async () => {
      try {
        const pyodideInstance = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
        window.pyodide = pyodideInstance;
        setPyodide(pyodideInstance);
      } catch (e: any) {
        setFeedback(`Failed to load Python: ${e.message}`);
        setStatus('incorrect');
      } finally {
        setPyodideLoading(false);
      }
    };
    script.onerror = () => {
      setFeedback("Failed to load Python environment. Check network.");
      setStatus('incorrect');
      setPyodideLoading(false);
    };
    document.head.appendChild(script);
  }, [language, pyodide]);

  const handleCheck = async () => {
    if (language === 'javascript') {
      validateJavaScript();
    } else if (language === 'python') {
      await validatePython();
    }
  };

  const validateJavaScript = () => {
    // Helper function to be injected for tests
    const assertHelper = `
      function assert(condition, message) {
        if (!condition) {
          throw new Error(message || "Assertion failed");
        }
      }
    `;
    const fullCode = `${code}\n\n${assertHelper}\n\n${testCode}`;

    try {
      new Function(fullCode)();
      setStatus('correct');
      setFeedback('All tests passed!');
    } catch (e: any) {
      setStatus('incorrect');
      setFeedback(e.message);
    }
  };

  const validatePython = async () => {
    if (!pyodide) {
      setStatus('incorrect');
      setFeedback("Python environment is not ready.");
      return;
    }
    const fullCode = `${code}\n\n${testCode}`;
    try {
      await pyodide.runPythonAsync(fullCode);
      setStatus('correct');
      setFeedback('All tests passed!');
    } catch (e: any) {
      setStatus('incorrect');
      setFeedback(e.message);
    }
  };

  const handleContinueClick = () => {
    if (onContinue) onContinue();
    // In a real app, you'd likely navigate to the next lesson,
    // so resetting state isn't always necessary.
  };

  const highlighter = (codeToHighlight: string) => highlight(codeToHighlight, languages[language], language);
  const isButtonDisabled = (language === 'python' && (!pyodide || pyodideLoading)) || status === 'correct';

  return (
    <>
      <style>{styles}</style>
      <article className={`duo-tester-container ${className}`}>
        <h2 className="duo-tester-question">{question}</h2>

        <div className="editor-wrapper">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlighter}
            padding={16}
            disabled={status === 'correct'}
          />
        </div>

        <footer className={`duo-tester-footer ${status === 'correct' ? 'correct-banner' : ''} ${status === 'incorrect' ? 'incorrect-banner' : ''}`}>
          {status === 'correct' && <div className="feedback-message correct-text"><span className="icon">✅</span> {feedback}</div>}
          {status === 'incorrect' && <div className="feedback-message incorrect-text truncate"><span className="icon">❌</span> {feedback}</div>}
          
          {status !== 'correct' ? (
            <button className="footer-action-button" onClick={handleCheck} disabled={isButtonDisabled}>
              {pyodideLoading ? 'Loading Python...' : 'Check'}
            </button>
          ) : (
            <button className="footer-action-button" onClick={handleContinueClick}>
              Continue
            </button>
          )}
        </footer>
      </article>
    </>
  );
}