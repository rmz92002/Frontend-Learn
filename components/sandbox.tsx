"use client";

import React, { useRef, useEffect, ReactNode } from 'react';
import { Card } from "@/components/ui/card";

interface SandboxProps {
  // The JS code that brings the static children to life.
  initCode: string;
  // The static JSX/HTML structure of the interactive element.
  children: ReactNode;
  // Optional classes for the container.
  className?: string;
  // Optional library to load
  libraryUrl?: string; 
}

const Sandbox: React.FC<SandboxProps> = ({
  initCode,
  children,
  className = 'w-full p-4', // Sensible default
  libraryUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track library loading state separately
  const [isLibraryLoaded, setIsLibraryLoaded] = React.useState(!libraryUrl);

  // Effect for loading an external script if a URL is provided
  useEffect(() => {
    if (!libraryUrl) return;
    if (document.querySelector(`script[src="${libraryUrl}"]`)) {
      setIsLibraryLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = libraryUrl;
    script.async = true;
    script.onload = () => setIsLibraryLoaded(true);
    script.onerror = () => console.error(`Failed to load library: ${libraryUrl}`);
    document.body.appendChild(script);

    return () => {
      // In a strict SPA, you might remove the script, but often it's fine to leave it.
      // If the script has side effects, leaving it might be desirable.
    };
  }, [libraryUrl]);


  // Effect to run the user's JS code
  useEffect(() => {
    // Don't run until the container is mounted AND the library is ready
    if (!containerRef.current || !isLibraryLoaded) return;

    // The container is the sandbox. The user code can use `container.querySelector`
    // to find elements within the JSX you passed in as `children`.
    const container = containerRef.current;
    let cleanup: (() => void) | void;

    try {
      // We create a function that receives the container element as an argument.
      // This is the "API" for the AI's code.
      const userFunction = new Function('container', initCode);
      cleanup = userFunction(container);
    } catch (error) {
      console.error("Error executing Sandbox initCode:", error);
    }

    return () => {
      // If the user's code returned a cleanup function, run it.
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
    // Re-run if the code changes or when the library finishes loading.
  }, [initCode, isLibraryLoaded]);

  return (
    <Card className="my-4 overflow-hidden">
      {/* The ref is on the wrapper div that contains the children */}
      <div ref={containerRef} className={className}>
        {children}
      </div>
    </Card>
  );
};

export default Sandbox;