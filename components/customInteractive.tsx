// components/CustomInteractive.tsx
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card } from "@/components/ui/card"; // Or any other wrapper you prefer

interface CustomInteractiveProps {
  libraryUrl?: string; // Optional URL for an external library like Matter.js
  initCode: string;   // The JavaScript code to execute
  className?: string;  // Optional classes for styling the container
}

const CustomInteractive: React.FC<CustomInteractiveProps> = ({
  libraryUrl,
  initCode,
  className = 'w-full min-h-96' // Default size, can be overridden
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(!libraryUrl); // True if no library is needed

  // Effect to load the external script (e.g., Matter.js)
  useEffect(() => {
    if (!libraryUrl) return;

    // Check if the script is already on the page to avoid re-loading
    if (document.querySelector(`script[src="${libraryUrl}"]`)) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = libraryUrl;
    script.async = true;
    script.onload = () => {
      console.log(`Library loaded: ${libraryUrl}`);
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error(`Failed to load library: ${libraryUrl}`);
    };

    document.body.appendChild(script);

    return () => {
      // Optional: Cleanup script tag if component unmounts before load,
      // though often it's fine to leave it.
      document.body.removeChild(script);
    };
  }, [libraryUrl]);

  // Effect to run the initialization code once the library is loaded and the container is ready
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current) return;

    let cleanupFunction: () => void = () => {};

    try {
      // Use 'new Function' for safer execution than 'eval'.
      // We pass the container element as an argument named 'mountEl' to the function.
      // This gives the custom code a direct reference to its DOM container via 'mountEl'.
      const customInit = new Function('mountEl', initCode);
      const cleanup = customInit(containerRef.current);

      // The custom code can optionally return a cleanup function
      if (typeof cleanup === 'function') {
        cleanupFunction = cleanup;
      }
    } catch (error) {
      console.error("Error executing custom interactive code:", error);
    }

    // This is the cleanup function that runs when the component unmounts
    return () => {
      // Clear the container's contents to prevent React/vanilla JS conflicts
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      cleanupFunction();
      console.log('Custom interactive instance cleaned up.');
    };
    // Re-run if the code itself changes (e.g., in a dynamic editor)
  }, [isScriptLoaded, initCode]);

  return (
    <Card className={`p-4 my-4 overflow-hidden`}>
      <div ref={containerRef} className={className}>
        {/* This div is the mount point for the custom vanilla JS code */}
      </div>
    </Card>
  );
};

export default CustomInteractive;