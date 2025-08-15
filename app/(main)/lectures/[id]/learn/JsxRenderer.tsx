"use client"

import React from "react"
import JsxParser from 'react-jsx-parser'
import { motion } from 'framer-motion'

// Import all interactive components
import MultipleChoiceQuiz from "@/components/multipleChoiceQuiz"
import Match from "@/components/Match"
import Title from "@/components/title"
import Subtitle from "@/components/subtitle"
import Description from "@/components/description"
import { Card } from "@/components/ui/card"
import Code from "@/components/code"
import MathKatex from "@/components/math"
import TypeInAnswer from "@/components/typeInAnswer"
import SortTheSentence from "@/components/sortSentence"
import DragToBuckets from "@/components/dragAndDrop"
import InteractiveCodeExecutor from "@/components/InteractiveCodeExecutor"
import InteractiveCodeTester from "@/components/InteractiveCodeTester"
import CustomInteractive from "@/components/customInteractive"
import { InlineMath, BlockMath } from 'react-katex'
import Sandbox from "@/components/sandbox"

interface JsxRendererProps {
  jsx: string;
  onContinue?: () => void;
}

export default function JsxRenderer({ jsx, onContinue }: JsxRendererProps) {
  if (!jsx || jsx.trim() === '') {
    return null;
  }

  // HOC to inject onContinue into question components
  const withContinue = (Component: React.ComponentType<any>) => {
    return (props: any) => <Component {...props} onContinue={onContinue} />;
  };

  const components: any = {
    MultipleChoiceQuiz: withContinue(MultipleChoiceQuiz),
    TypeInAnswer: withContinue(TypeInAnswer),
    Match: withContinue(Match),
    InlineMath: withContinue(InlineMath),
    BlockMath: withContinue(BlockMath),
    DragToBuckets: withContinue(DragToBuckets),
    SortTheSentence: withContinue(SortTheSentence)
    // Add other interactive components here if they need the onContinue prop
  };

  return (
    <JsxParser
      components={components}
      bindings={{ motion }} // No longer need to pass onContinue in bindings
      jsx={jsx}
    />
  );
}
