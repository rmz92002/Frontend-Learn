"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createBetaSignup } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Sparkles, Brain, Zap, Users, ArrowRight, Code2, FlaskConical, Gamepad2 } from "lucide-react"

/*************************
 * Small, focused components
 *************************/

// Generic section wrapper to keep spacing consistent across the page
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  )
}

// Email capture form (self‑contained)
function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    try {
      await createBetaSignup({ email, source: "coming-soon-page" })
      setIsSubmitted(true)
    } catch (error) {
      console.error("Failed to sign up:", error)
      // Optionally: display an error message to the user
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">You're on the list!</h3>
          <p className="text-muted-foreground">We'll notify you as soon as Learnzy is ready for you.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 text-base"
          required
        />
        <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8 font-semibold">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Be the first to experience the future of learning</p>
    </form>
  )
}

// Typewriter demo (slower + clearer timing)
function TypingDemo({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState("")
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!phrases || phrases.length === 0) return

    const current = phrases[phraseIdx % phrases.length] ?? ""

    // gentler pacing
    const delay = !isDeleting
      ? (text.length === current.length ? 1500 : 110) // pause when fully typed
      : (text.length === 0 ? 500 : 55) // small pause before next word

    if (timerRef.current) window.clearTimeout(timerRef.current)

    timerRef.current = window.setTimeout(() => {
      if (!isDeleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1))
        } else {
          setIsDeleting(true)
        }
      } else {
        if (text.length > 0) {
          setText(current.slice(0, text.length - 1))
        } else {
          setIsDeleting(false)
          setPhraseIdx((i) => (i + 1) % phrases.length)
        }
      }
    }, delay) as unknown as number

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [phrases, phraseIdx, text, isDeleting])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border bg-card/50 backdrop-blur px-4 sm:px-6 py-5 shadow-sm">
        <div className="text-xs sm:text-sm text-muted-foreground mb-2">Try it: type what you want to learn</div>
        <div className="relative">
          <div className="w-full rounded-xl border bg-background px-4 sm:px-5 py-4 text-base sm:text-lg font-medium tracking-wide">
            <span className="text-muted-foreground">“</span>
            <span className="align-middle">{text}</span>
            <span className="inline-block w-[2px] h-5 sm:h-6 ml-0.5 bg-primary animate-pulse align-middle" />
            <span className="text-muted-foreground">”</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Examples: Quantum physics with SpongeBob • Crash course on black holes • Learn sushi by doing
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Mini interactive demos (auto-animated) ----
function MCQDemo() {
  const options = [
    { label: "Gravity", correct: true },
    { label: "Friction", correct: false },
    { label: "Magnetism", correct: false },
  ]
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    let t1: number, t2: number
    // auto-play: pick an answer, reveal, reset
    const play = () => {
      setSelected(1) // wrong first
      setShowResult(false)
      t1 = window.setTimeout(() => {
        setSelected(0) // switch to correct
        setShowResult(true)
      }, 1000) as unknown as number
      t2 = window.setTimeout(() => {
        setSelected(null)
        setShowResult(false)
      }, 2500) as unknown as number
    }
    play()
    const loop = window.setInterval(play, 3000)
    return () => {
      window.clearInterval(loop)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-sm mb-2">What force pulls objects toward Earth?</div>
      <div className="grid gap-2">
        {options.map((o, i) => {
          const isActive = selected === i
          const correct = showResult && o.correct
          return (
            <button
              key={i}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${
                isActive ? "border-primary ring-2 ring-primary/30" : "border-border"
              } ${correct ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500" : ""}`}
              aria-pressed={isActive}
            >
              <span className="text-sm">{o.label}</span>
              {correct ? (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Correct</span>
              ) : isActive ? (
                <span className="text-xs text-muted-foreground">Selected…</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CodeRunDemo() {
  const codeLines = [
    "function add(a, b) {",
    "  return a + b;",
    "}",
    "console.log(add(2, 3));",
  ]
  const [typed, setTyped] = useState("")
  const [line, setLine] = useState(0)
  const [output, setOutput] = useState<string | null>(null)

  useEffect(() => {
    let timeout: number
    const current = codeLines[line] ?? ""
    if (typed.length < current.length) {
      timeout = window.setTimeout(() => setTyped(current.slice(0, typed.length + 1)), 30) as unknown as number
    } else {
      if (line < codeLines.length - 1) {
        timeout = window.setTimeout(() => {
          setLine(line + 1)
          setTyped("")
        }, 250) as unknown as number
      } else if (output == null) {
        timeout = window.setTimeout(() => setOutput("5"), 600) as unknown as number
      } else {
        // reset loop
        timeout = window.setTimeout(() => {
          setTyped("")
          setLine(0)
          setOutput(null)
        }, 1500) as unknown as number
      }
    }
    return () => window.clearTimeout(timeout)
  }, [typed, line, output])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs sm:text-sm leading-relaxed">
        {codeLines.slice(0, line).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        <div>
          {typed}
          <span className="inline-block w-2 h-4 bg-primary align-[-2px] animate-pulse ml-0.5" />
        </div>
      </div>
      <div className="mt-3 rounded-lg border bg-background p-3 font-mono text-xs sm:text-sm">
        <div className="text-muted-foreground">console</div>
        <div className={`mt-1 transition-opacity ${output ? "opacity-100" : "opacity-0"}`}>{output}</div>
      </div>
    </div>
  )
}

function SimDemo() {
  // Animated parameter (k) and time (t) for point motion
  const [k, setK] = useState(1.2)
  const [t, setT] = useState(0)

  useEffect(() => {
    let dir = -1
    const idK = window.setInterval(() => {
      setK((prev) => {
        let next = prev + dir * 0.06
        if (next < 0.6) { dir = 1; next = 0.6 }
        if (next > 1.8) { dir = -1; next = 1.8 }
        return Number(next.toFixed(2))
      })
    }, 150)

    const idT = window.setInterval(() => setT((v) => v + 0.065), 30)

    return () => { window.clearInterval(idK); window.clearInterval(idT) }
  }, [])

  // SVG geometry helpers
  const W = 320, H = 180, P = 24
  const xmin = -1.2, xmax = 1.2
  const ymax = Math.max(0.8, k * xmax * xmax)
  const scaleX = (W - 2 * P) / (xmax - xmin)
  const scaleY = (H - 2 * P) / ymax
  const xToSvg = (x: number) => P + (x - xmin) * scaleX
  const yToSvg = (y: number) => H - P - y * scaleY

  // Build parabola path y = k x^2
  const samples = 80
  const path = Array.from({ length: samples + 1 }, (_, i) => {
    const x = xmin + (i / samples) * (xmax - xmin)
    const y = k * x * x
    return `${i === 0 ? 'M' : 'L'} ${xToSvg(x).toFixed(2)} ${yToSvg(y).toFixed(2)}`
  }).join(' ')

  // Moving point along the curve (oscillates with time)
  const xPoint = Math.sin(t) * 1.1
  const yPoint = k * xPoint * xPoint

  // Progress bar for k (visual affordance)
  const kPct = ((k - 0.6) / (1.8 - 0.6)) * 100

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Model: <span className="font-medium text-foreground">y = k·x²</span></span>
        <span>k = {k.toFixed(2)}</span>
      </div>

      {/* parameter bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden mb-4">
        <div className="absolute top-0 h-2 rounded-full bg-primary transition-all" style={{ width: `${kPct}%` }} />
      </div>

      <div className="relative rounded-xl border bg-background overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img" aria-label={`Parabola y equals ${k.toFixed(2)} times x squared`}> 
          {/* grid */}
          {[0.25, 0.5, 0.75].map((gy, i) => (
            <line key={`h-${i}`} x1={P} x2={W - P} y1={yToSvg(gy * ymax)} y2={yToSvg(gy * ymax)} stroke="currentColor" className="opacity-20" strokeDasharray="4 4" />
          ))}
          {[ -1, -0.5, 0, 0.5, 1 ].map((gx, i) => (
            <line key={`v-${i}`} y1={P} y2={H - P} x1={xToSvg(gx)} x2={xToSvg(gx)} stroke="currentColor" className="opacity-20" strokeDasharray="4 4" />
          ))}
          {/* axes */}
          <line x1={P} x2={W - P} y1={yToSvg(0)} y2={yToSvg(0)} stroke="currentColor" className="opacity-50" />
          <line y1={P} y2={H - P} x1={xToSvg(0)} x2={xToSvg(0)} stroke="currentColor" className="opacity-50" />

          {/* parabola */}
          <path d={path} fill="none" stroke="currentColor" className="text-primary" strokeWidth={2} />

          {/* moving point */}
          <circle cx={xToSvg(xPoint)} cy={yToSvg(yPoint)} r={5} className="fill-primary" />

          {/* labels */}
          <text x={xToSvg(1.0)} y={yToSvg(k * 1.0 * 1.0) - 8} fontSize="10" className="fill-current">k = {k.toFixed(2)}</text>
          <text x={xToSvg(0) + 6} y={yToSvg(0) - 6} fontSize="10" className="fill-muted-foreground">x</text>
          <text x={xToSvg(0) + 6} y={P + 10} fontSize="10" className="fill-muted-foreground">y</text>
        </svg>
      </div>

      <div className="mt-2 text-[11px] text-center text-muted-foreground">
        Watch how increasing <span className="text-foreground font-medium">k</span> makes the parabola steeper; the point moves to show y changing.
      </div>
    </div>
  )
}

function MiniGameDemo() {
  const [x, setX] = useState(0)
  const [collected, setCollected] = useState<boolean[]>([false, false, false])

  useEffect(() => {
    const coinsX = [10, 50, 85]
    const id = window.setInterval(() => {
      setX((prev) => {
        const next = prev + 2
        const pct = (next % 100)
        // collect if close
        setCollected((c) => c.map((v, i) => v || Math.abs(pct - coinsX[i]) < 4))
        return next
      })
    }, 30)
    const reset = window.setInterval(() => setCollected([false, false, false]), 2500)
    return () => { window.clearInterval(id); window.clearInterval(reset) }
  }, [])

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative h-28 rounded-xl border bg-gradient-to-b from-muted/40 to-background overflow-hidden">
        {/* player */}
        <div
          className="absolute bottom-3 w-6 h-6 rounded-full bg-primary shadow transition-transform"
          style={{ left: `${(x % 100)}%`, transform: "translateX(-50%)" }}
        />
        {/* coins */}
        {[10, 50, 85].map((pct, i) => (
          <div
            key={i}
            className={`absolute bottom-9 w-3 h-3 rounded-full bg-yellow-400 transition-opacity ${collected[i] ? "opacity-0" : "opacity-100"}`}
            style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
          />
        ))}
        {/* ground */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-primary/20" />
      </div>
      <div className="mt-2 text-center text-xs text-muted-foreground">Auto-plays: move to collect the coins</div>
    </div>
  )
}

// Rotating slides preview
function SlidesDemo() {
  const slides = [
    { title: "Multiple Choice Quiz", subtitle: "Check understanding in seconds", icon: <CheckCircle className="w-8 h-8" />, demo: <MCQDemo /> },
    { title: "Code & Run", subtitle: "Write a function, see output live", icon: <Code2 className="w-8 h-8" />, demo: <CodeRunDemo /> },
    { title: "Interactive Simulation", subtitle: "Play with variables to learn", icon: <FlaskConical className="w-8 h-8" />, demo: <SimDemo /> },
    { title: "Mini-Game Exercise", subtitle: "Learn by doing (and playing)", icon: <Gamepad2 className="w-8 h-8" />, demo: <MiniGameDemo /> },
  ]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000)
    return () => window.clearInterval(id)
  }, [slides.length])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-3xl border bg-card/40 backdrop-blur p-4 sm:p-6 shadow-sm">
        <div className="text-center mb-4">
          <Badge variant="secondary" className="px-3 py-1">Interactive preview</Badge>
        </div>
        <div className="relative overflow-hidden rounded-2xl border bg-background aspect-video">
          {slides.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 px-6 text-center transition-all duration-500 ${i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              aria-hidden={i !== index}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">{s.icon}</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md">{s.subtitle}</p>
              <div className="mt-2 w-full flex items-center justify-center px-2">
                {s.demo}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-3 bg-muted"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

/*****************
 * Static content
 *****************/
const FEATURES = [
  { icon: <Brain className="w-6 h-6" />, title: "AI-Powered Lectures", description: "Get personalized, interactive lessons on any topic you want to learn" },
  { icon: <Sparkles className="w-6 h-6" />, title: "Instant Generation", description: "Just tell us what you want to learn and we'll create it instantly" },
  { icon: <Zap className="w-6 h-6" />, title: "Bite-Sized Learning", description: "Fun, engaging lessons that fit into your busy schedule" },
]

/*****************
 * Page component
 *****************/
export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <Section className="pt-20 pb-16 relative">
          <div className="text-center space-y-8">
            {/* Brand */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold text-foreground">Learnzy</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Coming Soon
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Learn Anything,
                <span className="text-primary block">Instantly</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The AI-powered learning platform that creates personalized, interactive lectures on any topic. Like
                Duolingo, but for everything you want to learn.
              </p>
            </div>

            {/* Waitlist */}
            <div className="max-w-md mx-auto">
              <WaitlistForm />
            </div>

            {/* Live Typing Demo */}
            <div className="pt-4">
              <TypingDemo
                phrases={[
                  "Explain Newton's laws with a skateboard demo",
                  "Crash course on black holes (no math)",
                  "Learn sushi by doing: step‑by‑step, with quizzes",
                  "Quantum physics explained through SpongeBob",
                ]}
              />
            </div>

            {/* Transparency */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground text-center">
                We don’t publish vanity metrics. We’ll share real numbers after launch.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* How it works / Features */}
      <Section className="py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">How Learnzy Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Revolutionary AI technology that adapts to your learning style and creates engaging content on demand.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Interactive exercises preview */}
      <Section className="py-20 bg-background">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">See the Kinds of Exercises</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A rotating preview of the interactive activities your lecture can include.
          </p>
        </div>
        <SlidesDemo />
      </Section>

      {/* CTA */}
      <Section className="py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-muted-foreground">Join the early access list and be part of the launch cohort.</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Early access waitlist</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>No spam, ever</span>
            </div>
          </div>
          {/* Inline form so users don't scroll back to the top */}
          <div className="max-w-md mx-auto">
            <WaitlistForm />
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <Section>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Learnzy</span>
          </div>
          <p className="text-center text-muted-foreground mt-4">© 2025 Learnzy. The future of personalized education.</p>
        </Section>
      </footer>
    </div>
  )
}
