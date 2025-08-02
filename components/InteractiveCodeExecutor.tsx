'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
// Import all languages we might use
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-coy.css'; // A clean, light theme

// --- TYPES & PROPS ---
type Language = 'javascript' | 'python';

interface InteractiveCodeExecutorProps {
  question: ReactNode;
  initialCode: string;
  language: Language;
  className?: string;
}

// Attach a custom property to the window object for the Pyodide instance
declare global {
  interface Window {
    pyodide: any;
    loadPyodide: (args: any) => Promise<any>;
  }
}


// --- STYLES (Unchanged) ---
const styles = `
  :root {
    --duo-color-blue: #1cb0f6;
    --duo-color-blue-dark: #1899d6;
    --duo-color-red: #ff4b4b;
    --duo-color-gray-light: #e5e5e5;
    --duo-color-gray-medium: #777777;
    --duo-font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --duo-font-family-mono: 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace;
  }
  
  .duo-executor-container { max-width: 700px; margin: 2rem auto; font-family: var(--duo-font-family); background-color: #ffffff; border-radius: 16px; border: 2px solid var(--duo-color-gray-light); padding: 24px; }
  .duo-executor-question { font-size: 1.5rem; font-weight: 700; color: #3c3c3c; margin-bottom: 16px; }
  .editor-wrapper { border: 2px solid var(--duo-color-gray-light); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
  .prism-editor-wrapper { background: #fdfdfd; min-height: 150px; font-family: var(--duo-font-family-mono); font-size: 0.95rem; padding: 16px !important; }
  .duo-executor-controls { display: flex; justify-content: flex-end; margin-bottom: 16px; }
  .duo-executor-run-button { min-width: 120px; text-align: center; padding: 10px 30px; font-size: 1rem; font-weight: 700; color: #ffffff; text-transform: uppercase; background-color: var(--duo-color-blue); border: none; border-bottom: 4px solid var(--duo-color-blue-dark); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
  .duo-executor-run-button:hover:not(:disabled) { filter: brightness(1.1); }
  .duo-executor-run-button:active:not(:disabled) { transform: translateY(2px); border-bottom-width: 2px; }
  .duo-executor-run-button:disabled { background-color: var(--duo-color-gray-light); border-color: var(--duo-color-gray-medium); color: var(--duo-color-gray-medium); cursor: not-allowed; }
  .duo-executor-output-wrapper { border: 2px solid var(--duo-color-gray-light); border-radius: 12px; background-color: #f7f7f7; }
  .duo-executor-output-header { padding: 8px 16px; font-weight: 700; color: var(--duo-color-gray-medium); border-bottom: 2px solid var(--duo-color-gray-light); }
  .duo-executor-output-content { padding: 16px; font-family: var(--duo-font-family-mono); font-size: 0.9rem; color: #333; min-height: 50px; white-space: pre-wrap; word-break: break-all; }
  .duo-executor-output-content .placeholder { color: var(--duo-color-gray-medium); }
  .duo-executor-output-content .error { color: var(--duo-color-red); }
`;

// --- COMPONENT LOGIC ---
export default function InteractiveCodeExecutor({
  question,
  initialCode,
  language,
  className = ''
}: InteractiveCodeExecutorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  // Effect to load Pyodide safely
  useEffect(() => {
    if (language !== 'python') return;

    // Check if Pyodide is already loaded or being loaded to prevent duplication
    if (window.pyodide) {
      if (!pyodide) setPyodide(window.pyodide);
      return;
    }
    
    const scriptId = 'pyodide-script';
    if(document.getElementById(scriptId)){
        // Script is already in the DOM, possibly still loading.
        // The onload handler will manage setting state.
        return;
    }
    
    setPyodideLoading(true);
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    script.async = true;

    // *** THE FIX IS HERE: Use the onload event listener ***
    script.onload = async () => {
      try {
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
        });
        // Make the instance globally available for other components
        window.pyodide = pyodideInstance;
        setPyodide(pyodideInstance);
      } catch (e: any) {
        console.error("Pyodide initialization failed:", e);
        setError(`Failed to initialize Python: ${e.message}`);
      } finally {
        setPyodideLoading(false);
      }
    };
    
    script.onerror = () => {
      console.error("Failed to load the Pyodide script from the network.");
      setError("Failed to load the Python environment script. Check your network connection.");
      setPyodideLoading(false);
    };

    document.head.appendChild(script);

  }, [language, pyodide]);


  const runCode = async () => {
    setOutput([]);
    setError(null);

    if (language === 'javascript') {
      runJavascript();
    } else if (language === 'python') {
      await runPython();
    }
  };
  
  const runJavascript = () => {
    const originalConsoleLog = console.log;
    const capturedLogs: string[] = [];
    console.log = (...args) => {
      const formattedArgs = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      capturedLogs.push(formattedArgs);
    };
    try {
      new Function(code)();
    } catch (e: any) {
      setError(`JavaScript Error: ${e.message}`);
    } finally {
      console.log = originalConsoleLog;
      setOutput(capturedLogs);
    }
  };

  const runPython = async () => {
    if (!pyodide) {
      setError("Python environment is not ready. Please wait.");
      return;
    }
    const capturedOutput: string[] = [];
    pyodide.globals.set("print", (...args: any[]) => {
      capturedOutput.push(args.map(String).join(' '));
    });

    try {
      await pyodide.runPythonAsync(code);
    } catch (e: any) {
      setError(`Python Error: ${e.message}`);
    } finally {
      setOutput(capturedOutput);
    }
  };

  const highlighter = (codeToHighlight: string) => highlight(codeToHighlight, languages[language], language);
  
  const isRunDisabled = language === 'python' && (!pyodide || pyodideLoading);

  return (
    <>
      <style>{styles}</style>
      <article className={`duo-executor-container ${className}`}>
        <h2 className="duo-executor-question">{question}</h2>

        <div className="editor-wrapper">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlighter}
            padding={16}
            
            disabled={isRunDisabled}
          />
        </div>

        <div className="duo-executor-controls">
          <button className="duo-executor-run-button" onClick={runCode} disabled={isRunDisabled}>
            {pyodideLoading ? 'Loading Python...' : 'Run'}
          </button>
        </div>

        <div className="duo-executor-output-wrapper">
          <div className="duo-executor-output-header">Console Output ({language})</div>
          <div className="duo-executor-output-content">
            {error ? (
              <span className="error">{error}</span>
            ) : output.length > 0 ? (
              output.map((line, i) => <div key={i}>{line}</div>)
            ) : (
              <span className="placeholder">Click "Run" to see output...</span>
            )}
          </div>
        </div>
      </article>
    </>
  );
}