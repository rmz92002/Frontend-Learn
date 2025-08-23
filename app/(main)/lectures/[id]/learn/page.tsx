"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Loader2, Brain, CheckCircle } from "lucide-react"
import { streamLecture } from "@/lib/api"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence, useInView } from 'framer-motion'
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

// --- Reusable Animated Slide Component ---
const AnimatedSlide = ({ children, onVisible }: { children: React.ReactNode; onVisible: () => void; }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      onVisible();
    }
  }, [isInView, onVisible]);

  return (
    <div ref={ref} className="h-screen w-full flex items-center justify-center snap-start p-4 md:p-8">
      <motion.div className="h-full w-full max-w-8xl">
        {children}
      </motion.div>
    </div>
  );
};

// --- Completion Screen Component ---
const CompletionScreen = ({ title, lectureId }: { title: string, lectureId: string }) => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white rounded-xl shadow-2xl border p-8">
    <CheckCircle className="w-24 h-24 text-green-500" />
    <h1 className="text-4xl font-bold text-gray-800 mt-6">Well done!</h1>
    <p className="text-lg text-gray-600 max-w-md text-center mt-4">
      You have successfully completed the lecture: <span className="font-semibold">{title}</span>
    </p>
    <Link href={`/lectures/${lectureId}`} className="mt-8 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
      Back to Lecture Overview
    </Link>
  </div>
);

// --- Slide Updating Overlay Component ---
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
        <div className="flex flex-col items-center gap-3 rounded-2xl px-5 py-4 border bg-gradient-to-br from-green-50 to-white">
          <motion.div
            className="w-12 h-12 rounded-full border border-green-300 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-6 h-6 text-green-700" />
          </motion.div>
          <p className="text-green-900 text-sm font-medium">Updating slide…</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Iframe Component ---
function Iframe({ html }: { html: string; }) {
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"/></head><body style="margin:0; min-height:100vh;">${html || ""}</body></html>`;
  return <iframe srcDoc={srcDoc} title="Lecture Content" className="w-full h-full border-0" />
}

export default function LearningView() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { data: userData } = useCurrentUser()
  const { toast } = useToast()

  const isNewlyCreated = searchParams.get("new") === "true";

  const [lectureSections, setLectureSections] = useState<Array<{ html: string, jsx: string | null }>>([])
  const [currentSection, setCurrentSection] = useState(0)
  const [totalSections, setTotalSections] = useState(0)
  const [courseTitle, setCourseTitle] = useState("")
  const [availableSections, setAvailableSections] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(searchParams.get("new") === "true")
  const [generationProgress, setGenerationProgress] = useState(isGeneratingContent ? 20 : 100);
  const [slideUpdating, setSlideUpdating] = useState(false);

  // --- State for enforcing interactive exercises ---
  const [interactionLocked, setInteractionLocked] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const controllerRef = useRef<AbortController | null>(null)

  const getProfileId = (data: unknown): number | undefined => (data as any)?.profile?.id;

  // --- Updated navigation to manage scroll lock ---
  const goNext = useCallback(() => {
    setInteractionLocked(false);
    const nextSection = currentSection + 1;

    if (nextSection >= totalSections && totalSections > 0) {
      setIsCompleted(true);
      // Wait for the completion slide to be rendered before scrolling
      setTimeout(() => {
        document.getElementById(`slide-${totalSections}`)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (isGeneratingContent && !availableSections.includes(nextSection)) {
      toast({ title: 'Hold on!', description: 'The next slide is still being generated.' });
      return;
    }

    document.getElementById(`slide-${nextSection}`)?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSection, totalSections, isGeneratingContent, availableSections, toast]);

  const goPrev = useCallback(() => {
    // Unlock scrolling before moving to the previous slide.
    setInteractionLocked(false);

    const prevSection = currentSection - 1;
    if (prevSection < 0) return;

    document.getElementById(`slide-${prevSection}`)?.scrollIntoView({ behavior: 'smooth' });

  }, [currentSection]);

  // --- Effect to block scrolling when an interaction is required ---
  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If interaction is locked and the user tries to scroll down, prevent it.
      if (interactionLocked && e.deltaY > 0) {
        e.preventDefault();
        toast({
          variant: "destructive",
          title: "Action Required",
          description: "Please complete the interactive exercise to continue.",
        });
      }
    };

    // Use { passive: false } to allow preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };

  }, [interactionLocked, toast]);

  useEffect(() => {
    const isLastSection = currentSection === totalSections - 1;
    const isNotInteractive = !lectureSections[currentSection]?.jsx;

    if (isLastSection && isNotInteractive && totalSections > 0) {
      setIsCompleted(true);
    }
  }, [currentSection, totalSections, lectureSections]);

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
        <div 
          className="h-full bg-green-500 transition-all duration-500" 
          style={{ width: `${((currentSection + 1) / (totalSections + (isCompleted ? 1 : 0))) * 100}%` }} 
        />
        {isGeneratingContent && <div className="absolute top-0 h-full bg-green-500/30" style={{ width: `${generationProgress}%` }} />}
      </div>
      
      <main
        id="slide-container"
        ref={mainContainerRef} // Add ref to the main container
        className="flex-1 w-full bg-gray-200 overflow-y-auto snap-y snap-mandatory"
      >
        
        
        {currentSection === 0 && !isCompleted && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-primary animate-bounce flex flex-col items-center z-20 pointer-events-none">
            <span className="text-xl">Scroll Down</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
        
        {(totalSections > 0 ? Array.from({ length: totalSections }) : []).map((_, index) => {
          const section = lectureSections[index];
          if (section && section.jsx) {
            return [
              <div>
              <AnimatedSlide onVisible={() => {
                if (currentSection !== index) {
                  setCurrentSection(index);
                  // Lock scrolling if the new slide has a JSX part
                }
                setInteractionLocked(false);
              }}>
                <div className="relative h-full w-full bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden">
                  {section ? (
                    <div className="flex w-full h-full">
                        <div className="w-full h-full">
                          <Iframe html={section.html} />
                        </div>
                   
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  )}
                  <SlideUpdatingOverlay visible={slideUpdating && index === currentSection} />
                </div>
              </AnimatedSlide>
            </div>
              ,
              <div id={`slide-${index}`} key={index}>
              <AnimatedSlide onVisible={() => {
                if (currentSection !== index) {
                  setCurrentSection(index);
                  // Lock scrolling if the new slide has a JSX part
                }
                setInteractionLocked(true);
              }}>
                <div className="relative h-full w-full bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden">
                  {section ? (
                    <div className="flex w-full h-full items-center justify-center">
                      <JsxRenderer jsx={section.jsx} onContinue={goNext} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  )}
                  <SlideUpdatingOverlay visible={slideUpdating && index === currentSection} />
                </div>
              </AnimatedSlide>
            </div>
            ]
          }

          return   (
            <div id={`slide-${index}`} key={index}>
              <AnimatedSlide onVisible={() => {
                if (currentSection !== index) {
                  setCurrentSection(index);
                  // Lock scrolling if the new slide has a JSX part
                  setInteractionLocked(Boolean(lectureSections[index]?.jsx));
                }
              }}>
                <div className="relative h-full w-full bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden">
                  {section ? (
                    <div className="flex w-full h-full">
                        <div className="w-full h-full">
                          <Iframe html={section.html} />
                        </div>
                   
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  )}
                  <SlideUpdatingOverlay visible={slideUpdating && index === currentSection} />
                </div>
              </AnimatedSlide>
            </div>
          );
          
        })}
        
        {isCompleted && (
          <div id={`slide-${totalSections}`}>
            <AnimatedSlide onVisible={() => setCurrentSection(totalSections)}>
              <CompletionScreen title={courseTitle} lectureId={id} />
            </AnimatedSlide>
          </div>
        )}
      </main>

      <BuddyChatbot
        currentSection={currentSection}
        onSlideUpdate={handleSlideUpdateFromChat}
        onSlideUpdating={setSlideUpdating}
      />
    </div>
  )
}
