declare namespace JSX {
  interface IntrinsicElements {
    "x-title": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    "x-subtitle": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    "x-description": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    "x-card": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    "x-fold": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { title: string }, HTMLElement>;
    "x-quiz": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { question: string; answer: string; distractors: string; }, HTMLElement>;
    "x-drag": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { prompt: string; items: string; correct: string; }, HTMLElement>;
    "x-code": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}