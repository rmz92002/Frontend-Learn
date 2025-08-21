"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Loader2,
  Brain,
  CheckCircle,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { streamLecture } from "@/lib/api"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from 'framer-motion'
import JsxRenderer from "./JsxRenderer"
import { BuddyChatbot } from "@/components/BuddyChatbot"

type StreamEvent = {
  status: "outline_complete" | "code_complete" | "complete";
  length: number;
  title: string;
  code: {
    html: string;
    jsx: string | null;
  };
  index: number;
  progress?: number;
};

const CompletionScreen = ({ title, lectureId }: { title: string, lectureId: string }) => (
  <motion.div
    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="flex flex-col items-center gap-6 text-center p-8"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <CheckCircle className="w-24 h-24 text-green-500" />
      <h1 className="text-4xl font-bold text-gray-800">Well done!</h1>
      <p className="text-lg text-gray-600 max-w-md">
        You have successfully completed the lecture: <span className="font-semibold">{title}</span>
      </p>
      <Link href={`/lectures/${lectureId}`} className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
        Back to Lecture Overview
      </Link>
    </motion.div>
  </motion.div>
);

const SlideUpdatingOverlay = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-3 rounded-2xl px-5 py-4 border bg-gradient-to-br from-green-50 to-white"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="w-12 h-12 rounded-full border border-green-300 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-6 h-6 text-green-700" />
          </motion.div>
          <p className="text-green-900 text-sm font-medium">Updating slide…</p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

function Iframe({ html }: { html: string; }) {
  const ref = useRef<HTMLIFrameElement>(null)

  // Build a srcdoc that wraps the user HTML and adds a small script to post edge events
  const buildSrcDoc = (content: string) => `<!doctype html><html><head><meta charset="utf-8"/></head><body style="margin:0;">
    <div id="__slide_root" style="min-height:100vh;">
      ${content}
    </div>
    <script>(function(){
      var gate=false, acc=0, THRESH=150, DECAY_MS=600, COMMIT_MS=900, decayT, commitT;
      function reopen(){ gate=false; clearTimeout(commitT); }
      function commit(){ if(gate) return; gate=true; parent.postMessage({source:'lecture-iframe', type:'intent-next'}, '*'); commitT=setTimeout(reopen, COMMIT_MS); }
      function atTop(){ var el=document.scrollingElement||document.documentElement; return el.scrollTop<=0; }
      function atBottom(){ var el=document.scrollingElement||document.documentElement; return Math.ceil(el.scrollTop + window.innerHeight) >= el.scrollHeight; }
      function reset(){ acc=0; parent.postMessage({source:'lecture-iframe', type:'edge-reset'}, '*'); }
      function onWheel(e){
        if (e.deltaY>0 && atBottom()){
          acc += Math.abs(e.deltaY);
          var prog = Math.max(0, Math.min(1, acc/THRESH));
          parent.postMessage({source:'lecture-iframe', type:'edge-progress', dir: e.deltaY>0?'bottom':'top', progress: prog}, '*');
          clearTimeout(decayT); decayT = setTimeout(reset, DECAY_MS);
          if (acc >= THRESH){ commit(); acc=0; }
        } else {
          reset();
        }
      }
      window.addEventListener('wheel', onWheel, {passive:true});
    })();</script>
  </body></html>`;

  useEffect(() => {
    if (ref.current) {
      ref.current.srcdoc = buildSrcDoc(html || "");
    }
  }, [html])

  return <iframe ref={ref} title="Lecture Content" className="w-full h-full border-0" />
}

export default function LearningView() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { data: userData } = useCurrentUser()
  const { toast } = useToast()

  const [lectureSections, setLectureSections] = useState<Array<{ html: string, jsx: string | null }>>([])
  const [currentSection, setCurrentSection] = useState(0)
  const [totalSections, setTotalSections] = useState(0)
  const [courseTitle, setCourseTitle] = useState("")
  const [availableSections, setAvailableSections] = useState<number[]>([])
  const [scrollAdvance, setScrollAdvance] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const isNewlyCreated = searchParams.get("new") === "true"
  const [isGeneratingContent, setIsGeneratingContent] = useState(isNewlyCreated)
  const [generationProgress, setGenerationProgress] = useState(isNewlyCreated ? 20 : 100)
  const [slideUpdating, setSlideUpdating] = useState(false);

  // Sub-slide step: 0 = HTML, 1 = JSX (if present)
  const [subStep, setSubStep] = useState<0 | 1>(0);

  const [swipeY, setSwipeY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const scrollEndTimeout = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 120;

  const controllerRef = useRef<AbortController>()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('scrollAdvance');
      if (saved !== null) setScrollAdvance(saved === 'true');
    } catch { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('scrollAdvance', String(scrollAdvance));
    } catch { }
  }, [scrollAdvance]);

  const getProfileId = (data: unknown): number | undefined => (data as any)?.profile?.id;

  // --- Navigation & Animation Logic (HTML/JSX as a unified stack) ---
  const hasJsx = useCallback((sec: number) => Boolean(lectureSections[sec]?.jsx), [lectureSections]);

  function stepFrom(sec: number, sub: 0 | 1, delta: number): { sec: number; sub: 0 | 1 } | null {
    let s = sec; let t: 0 | 1 = sub;
    let remaining = delta;
    while (remaining !== 0) {
      if (remaining > 0) {
        if (t === 0 && hasJsx(s)) t = 1;
        else { s += 1; t = 0; }
        remaining -= 1;
      } else {
        if (t === 1) t = 0;
        else {
          s -= 1;
          if (s < 0) return null;
          t = hasJsx(s) ? 1 : 0;
        }
        remaining += 1;
      }
      if (s < 0 || (totalSections > 0 && s >= totalSections)) return null;
    }
    return { sec: s, sub: t };
  }

  const goNext = useCallback(() => {
    // Step within the section to JSX if available
    if (subStep === 0 && hasJsx(currentSection)) {
      setSubStep(1);
      return;
    }
    const nextSection = currentSection + 1;
    if (nextSection >= totalSections) {
      if (totalSections > 0) setIsCompleted(true);
      return;
    }
    if (isGeneratingContent && !availableSections.includes(nextSection)) {
      toast({ title: 'Hold on!', description: 'The next slide is still being generated.' });
      return;
    }
    setCurrentSection(prev => prev + 1);
    setSubStep(0);
  }, [currentSection, subStep, totalSections, isGeneratingContent, availableSections, hasJsx, toast]);

  const goPrev = useCallback(() => {
    // Step back within the section from JSX to HTML first
    if (subStep === 1) {
      setSubStep(0);
      return;
    }
    const prevSection = currentSection - 1;
    if (prevSection < 0) return;
    setCurrentSection(prevSection);
    setSubStep(hasJsx(prevSection) ? 1 : 0);
  }, [currentSection, subStep, hasJsx]);
  // --- Listen for iframe messages to handle edge scroll events ---
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const d = (ev && ev.data) || {};
      if (!d || d.source !== 'lecture-iframe') return;

      if (d.type === 'edge-progress') {
        const p = Math.max(0, Math.min(1, Number(d.progress) || 0));
        const dir = d.dir === 'top' ? -1 : 1;
        setIsScrolling(true);
        setSwipeY(p * SWIPE_THRESHOLD * dir);
      } else if (d.type === 'edge-reset') {
        setIsScrolling(false);
        setSwipeY(0);
      } else if (d.type === 'intent-next' || d.type === 'intent-prev') {
        setIsScrolling(false);
        setIsAdvancing(true);
        const direction = d.type === 'intent-next' ? 1 : -1;
        setSwipeY((SWIPE_THRESHOLD + 120) * direction);
        window.setTimeout(() => {
          setSwipeY(0);
          if (direction === 1) goNext();
          else goPrev();
          window.setTimeout(() => setIsAdvancing(false), 60);
        }, 20);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [goNext, goPrev]);

  // --- Data Fetching and SSE Logic (Unchanged) ---
  useEffect(() => {
    const profileId = getProfileId(userData)
    if (!isNewlyCreated || !profileId) return;
    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;
    const fetchStream = async () => {
      try {
        const res = await streamLecture(id, { isNew: true, profileId }, signal);
        if (!res.ok) throw new Error(`Failed to start stream: ${res.statusText}`);
        await readSSE(res, handleSSE, signal);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Stream failed:", err);
      }
    };
    fetchStream();
    return () => controllerRef.current?.abort();
  }, [id, isNewlyCreated, userData]);

  useEffect(() => {
    const profileId = getProfileId(userData);
    if (isNewlyCreated || !profileId || (lectureSections[currentSection]?.html)) return;
    const controller = new AbortController();
    const { signal } = controller;
    streamLecture(id, { isNew: false, page: currentSection, profileId }, signal)
      .then(res => readSSE(res, handleSSE, signal))
      .catch(err => {
        if (err.name !== "AbortError") console.error("Fetch failed:", err)
      });
    return () => controller.abort();
  }, [id, currentSection, isNewlyCreated, lectureSections, userData]);

  function handleSSE(evt: StreamEvent) {
    if (evt.status === "outline_complete") {
      setTotalSections(evt.length);
      setCourseTitle(evt.title);
    }
    if (evt.status === "code_complete" && evt.code) {
      setTotalSections(evt.length);
      setLectureSections(prev => {
        const copy = [...prev];
        copy[evt.index] = { html: evt.code.html || "", jsx: evt.code.jsx || null };
        return copy;
      });
      setAvailableSections(p => p.includes(evt.index) ? p : [...p, evt.index]);
    }
    if (evt.progress) setGenerationProgress(evt.progress);
    if (evt.status === "complete") setIsGeneratingContent(false);
  }

  async function readSSE(res: Response, onMessage: (data: any) => void, signal?: AbortSignal) {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventDataLines: string[] = [];
    const dispatch = () => {
      if (eventDataLines.length === 0) return;
      const payload = eventDataLines.map(l => l.replace(/^data:\s?/, "")).join("");
      eventDataLines = [];
      const trimmed = payload.trim();
      if (!trimmed || trimmed === "[DONE]") return;
      try { onMessage(JSON.parse(trimmed)); } catch (e) { console.error("Bad JSON in SSE:", e, trimmed); }
    };
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line === "") { dispatch(); continue; }
        if (line.startsWith(":")) { continue; }
        if (line.startsWith("data:")) { eventDataLines.push(line); continue; }
      }
    }
    if (buffer.trim().length) {
      const trailing = buffer.split(/\r?\n/).filter(l => l.startsWith("data:")).map(l => l.replace(/^data:\s?/, "")).join("").trim();
      if (trailing && trailing !== "[DONE]") {
        try { onMessage(JSON.parse(trailing)); } catch (e) { console.error("Bad JSON in SSE:", e, trailing); }
      }
    } 
  }

  // Helpers to detect scrollable elements and boundaries
  function findScrollable(el: HTMLElement | null, container: HTMLElement | null): HTMLElement | null {
    while (el && container && el !== container && el !== document.body) {
      const style = getComputedStyle(el);
      const canScrollY = /(auto|scroll)/.test(style.overflowY);
      if (canScrollY && el.scrollHeight > el.clientHeight) return el;
      el = el.parentElement as HTMLElement | null;
    }
    return container; // default to container when none found
  }

  function atScrollBoundary(el: HTMLElement | null, deltaY: number): boolean {
    if (!el) return true;
    if (deltaY > 0) {
      return Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
    } else if (deltaY < 0) {
      return el.scrollTop <= 0;
    }
    return false;
  }



  const handleScrollEnd = useCallback(() => {
    setIsScrolling(false);
    if (swipeY > SWIPE_THRESHOLD) {
      goNext();
    }
    setSwipeY(0);
  }, [swipeY, goNext]);
  
  const handleWheel = useCallback((e: WheelEvent) => {
    if (currentSection >= totalSections - 1 || !scrollAdvance) {
      return; // allow normal interaction
    }
    console.log(swipeY)

    const container = document.getElementById('slide-container');
    const targetEl = e.target as HTMLElement | null;
    const scrollable = findScrollable(targetEl, container);
    const shouldCapture = atScrollBoundary(scrollable, e.deltaY);

    if (!shouldCapture || e.deltaY < 0) {
      // Let the inner element (iframe/JSX) scroll normally
      return;
    }

    // We are at an edge; animate the slide and potentially advance
    e.preventDefault();

    if (scrollEndTimeout.current) {
      clearTimeout(scrollEndTimeout.current);
    }
    if (!isScrolling) {
      setIsScrolling(true);
    }
    
    setSwipeY(prevY => Math.max(0, prevY + e.deltaY));
    scrollEndTimeout.current = window.setTimeout(handleScrollEnd, 150);
  }, [currentSection, totalSections, scrollAdvance, isScrolling, handleScrollEnd]);

  useEffect(() => {
    const container = document.getElementById('slide-container');
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  const handleSlideUpdateFromChat = (update: { new_html?: string | null; new_jsx?: string | null }) => {
    setLectureSections(prev => {
      const newSections = [...prev];
      const current = newSections[currentSection] || { html: '', jsx: null };
      newSections[currentSection] = {
        html: update.new_html ?? current.html,
        jsx: update.new_jsx ?? current.jsx,
      };
      return newSections;
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white p-6 flex items-center justify-between z-20 shrink-0">
        <Link href={`/lectures/${id}`} className="flex items-center text-sm hover:underline ">
          <ChevronLeft className="h-5 w-5 mr-1" onClick={goPrev} />
          Back to {courseTitle || "Lecture"}
        </Link>
        
      </header>

      <div className="h-1.5 bg-gray-200 relative">
        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((currentSection + 1) / Math.max(totalSections, 1)) * 100}%` }} />
        {isGeneratingContent && <div className="absolute top-0 h-full bg-green-500/30" style={{ width: `${generationProgress}%` }} />}
      </div>
      
      <main 
        id="slide-container" 
        className="flex-1 relative flex flex-col items-center justify-center font-sans overflow-hidden p-4 md:p-8"
      >
        <AnimatePresence>
          {isCompleted && <CompletionScreen title={courseTitle} lectureId={id} />}
        </AnimatePresence>
        {currentSection === 0 && (
            <div className="absolute bottom-10 text-primary animate-bounce flex flex-col items-center z-20"
                 style={{ transition: 'opacity 0.3s' }}>
                <span className="text-xl">Scroll Down</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        )}
        <div className="w-full h-full max-w-8xl relative">
          {/* Render virtual slides (HTML and optional JSX) to create the stack effect */}
          {[-1, 0, 1, 2].map((offset) => {
            const vs = stepFrom(currentSection, subStep, offset);
            if (!vs) return null;

            const section = lectureSections[vs.sec];
            const distance = offset;

            // During an animated advance, hide the previous slide so it doesn't reappear at position 0
            if (isAdvancing && distance < 0) {
              return null;
            }

            if (distance < -1 || distance > 2) return null;

            const transitionStyle = isScrolling ? 'none' : 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
            let style: React.CSSProperties = {};
            const progress = Math.min(1, Math.max(0, Math.abs(swipeY) / SWIPE_THRESHOLD));
            const direction = Math.sign(swipeY);

            if (distance === 0) {
              const y = (isScrolling || isAdvancing) ? swipeY : 0;
              const rotation = -y / 40;
              style = {
                transform: `translateY(-${y}px) rotate(${rotation}deg)`,
                zIndex: 10,
                opacity: 1 - progress,
                transition: transitionStyle,
                willChange: 'transform, opacity',
                transformOrigin: '50% 100%'
              };
            } else if (distance === 1) {
              const scale = 0.95 + progress * 0.05;
              const translateY = (1 - progress) * 2.5;
              if (swipeY < 0) {
                return null;
              }
              style = {
                transform: `translateY(${translateY}rem) scale(${scale})`,
                zIndex: 9,
                transition: transitionStyle,
                opacity: 0.7 + progress * 0.3,
                willChange: 'transform, opacity',
                transformOrigin: '50% 100%'
              };
            } else if (distance > 1) {
              style = {
                transform: `translateY(5rem) scale(0.9)`,
                opacity: 0,
                zIndex: 8,
                transition: transitionStyle,
                willChange: 'transform, opacity',
                transformOrigin: '50% 100%'
              };
            }

            if (distance < 0) {
              const y = (isScrolling || isAdvancing) && swipeY < 0 ? -100 + progress * 100 : -100;
              style = {
                transform: `translateY(${y}vh)`,
                opacity: 1,
                zIndex: 11,
                transition: transitionStyle,
                willChange: 'transform, opacity',
              };
            }

            return (
              <div
                key={`${vs.sec}-${vs.sub === 1 ? 'jsx' : 'html'}-${distance === 0 ? 'current' : 'stack'}`}
                style={style}
                className="absolute w-full h-full p-1"
              >
                <div className="h-full w-full bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden">
                  {section ? (
                    <div className="w-full h-full">
                      {vs.sub === 1 && section.jsx ? (
                        <motion.div className="w-full h-full bg-slate-50" initial={{opacity:0,y:20}} animate={{opacity:1, y:0}}>
                          <JsxRenderer jsx={section.jsx} onContinue={goNext} />
                        </motion.div>
                      ) : (
                        <Iframe html={section.html} />
                      )}
                    </div>
                  ) : (
                    distance >= 0 && <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  )}
                  <SlideUpdatingOverlay visible={slideUpdating && distance === 0} />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BuddyChatbot
        currentSection={currentSection}
        onSlideUpdate={handleSlideUpdateFromChat}
        onSlideUpdating={setSlideUpdating}
      />
    </div>
  )
}
