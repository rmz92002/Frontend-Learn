declare module 'react-katex' {
  import { ReactNode } from 'react'
  
  interface KatexProps {
    children?: ReactNode
    math?: string
    renderError?: (error: Error) => ReactNode
  }

  export const InlineMath: React.FC<KatexProps>
  export const BlockMath: React.FC<KatexProps>
}
