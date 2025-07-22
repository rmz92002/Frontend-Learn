// app/test-lecture/page.jsx
"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

export default function TestLecturePage() {
  // 1. State to track if we are on the client
  const [isClient, setIsClient] = useState(false);

  // 2. useEffect runs only on the client, after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Script src="/lecture-kit.min.js" strategy="afterInteractive" />

      <main style={{ padding: "2rem" }}>
        {/* 3. Conditionally render the content only on the client */}
        {isClient ? (
          <>
            <x-title>How to Say Hello in Spanish</x-title>
            <x-subtitle>Lesson 1: Greetings</x-subtitle>
            <x-description>
              In this lesson, you’ll learn how to greet people in Spanish and test
              yourself with a quiz and a drag‑and‑drop challenge.
            </x-description>

            <x-card>
              <h3>Key Phrase</h3>
              <x-fold title="Show the answer">
                <strong>¡Hola!</strong> — This means <em>Hello!</em>
              </x-fold>
            </x-card>

            <x-card>
              <x-quiz
                question="What is 'Hello' in Spanish?"
                answer="¡Hola!"
                distractors="Adiós|Gracias"
              ></x-quiz>
            </x-card>

            {/* ... other components ... */}
          </>
        ) : (
          // Optional: Render a loading skeleton or nothing on the server
          <p>Loading lecture...</p>
        )}
      </main>
    </>
  );
}