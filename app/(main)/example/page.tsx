// File: app/(main)/example/page.tsx

"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion"; // Import dependencies the *main app* needs to provide
import React, { useState, useEffect } from "react";
import MultipleChoiceQuiz from "@/components/multipleChoiceQuiz"
import Match from "@/components/Match"
import TypeInAnswer from "@/components/typeInAnswer";

// The component string, exactly as you want it.
// const componentString = 

declare global {
  interface Window {
    Babel: any;
  }
}

export default function TestLecturePage() {
  const [MyDynamicComponent, setMyDynamicComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.Babel) {
      console.error("Babel is not loaded.");
      setError("Component compiler (Babel) is not available.");
      return;
    }

    try {
      // 1. Transpile the JSX to React.createElement.
      // We are NOT transforming modules here, just the syntax.
      // let transformedCode = window.Babel.transform(componentString, {
      //   presets: ["react"],
      // }).code;

      // 2. Clean up the code for the function body.
      // Remove all import statements since dependencies will be injected.
      // transformedCode = transformedCode.replace(/import\s+.*\s+from\s+['"].*['"];?/g, '');
      // Replace the export default with a return statement.
      // transformedCode = transformedCode.replace(/export\s+default\s+DynamicComponent;?/, 'return DynamicComponent;');

      // 3. Define the dependencies that our sandboxed function will need.
      // The keys ('React', 'motion') must match the variable names used in the string.
      const dependencies = {
        React: React,
        motion: motion,
      };

      // 4. Create the component using the safe 'new Function' constructor.
      // This creates a function that accepts our dependencies as arguments.
      // const factory = new Function(...Object.keys(dependencies), transformedCode);

      // 5. Execute the factory, injecting the actual dependencies from our app.
      // This ensures it uses the *same instance* of React and framer-motion.
      // const Component = factory(...Object.values(dependencies));

      // 6. Set the component in state. This is synchronous, so no Suspense is needed.
      // setMyDynamicComponent(() => Component);

    } catch (err: any) {
      console.error("Failed to create dynamic component:", err);
      setError(`Component creation failed: ${err.message}`);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {/* <Card
        className="max-w-3xl min-h-[50%] w-full mx-auto rounded-3xl shadow-lg bg-white border-2 border-green-200/70 p-6 flex items-center justify-center 
                   transition-transform duration-200 hover:scale-[1.02] font-['Nunito','Poppins',sans-serif]"
      > */}
        {/* {error ? (
          <div className="text-red-500 font-mono p-4 bg-red-50 rounded">{error}</div>
        ) : MyDynamicComponent ? (
          <MyDynamicComponent />
        ) : (
          <div>Loading Component...</div>
        )} */}
        <TypeInAnswer answers="ACCEPTABLE 1|ACCEPTABLE 2" placeholder="e.g., Type here...">Prompt</TypeInAnswer>
      {/* </Card> */}
    </div>
  );
}