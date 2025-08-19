"use client"

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useParams, redirect } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, Play, Pause, MessageSquare, Send, X, Brain,
  Loader2,
  Check,
  PenTool,
  LucidePenTool,
  Hammer,
  MessageCircle,
  MessageSquareCode,
  MessageCircleHeart,
  MessageCircleCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { streamLecture, getCurrentUser, chatWithLecture } from "@/lib/api"    // helper imported here
import type { ChatMessage } from "@/lib/api"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useToast } from "@/components/ui/use-toast"
// NEW: Import motion from framer-motion
import { motion, AnimatePresence } from 'framer-motion'
import JsxRenderer from "./JsxRenderer"

/* ------------------------------------------------------------------ */
/* A. The new BuddyChatbot component with "cool" Framer Motion animations */
/* ------------------------------------------------------------------ */


const ThinkingIndicator = () => (
  <div className="flex items-end gap-2 justify-start">
    <motion.div
      className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      <motion.div
        className="w-6 h-6 rounded-full border border-green-300 flex items-center justify-center"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="w-4 h-4 text-green-700" />
      </motion.div>
      <motion.span
        className="text-green-900 text-sm font-medium"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        thinking…
      </motion.span>
    </motion.div>
  </div>
);

// SlideUpdatingOverlay: overlay for when slide is updating via AI
const SlideUpdatingOverlay = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-3 rounded-2xl px-5 py-4 border bg-gradient-to-br from-green-50 to-white"
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{
            scale: [0.95, 1, 0.98, 1],
            opacity: 1,
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-12 h-12 rounded-full border border-green-300 flex items-center justify-center"
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="w-6 h-6 text-green-700" />
          </motion.div>
          <motion.div
            className="w-40 h-1 rounded-full overflow-hidden bg-green-100"
            initial={false}
          >
            <motion.div
              className="h-full bg-green-500"
              animate={{ x: ["-100%", "0%", "100%"], width: ["30%", "60%", "30%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <motion.span
            className="text-green-900 text-sm font-medium"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            Updating slide…
          </motion.span>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

function BuddyChatbot({ currentSection, onSlideUpdate, onSlideUpdating }: { currentSection: number; onSlideUpdate?: (update: { new_html?: string; new_jsx?: string | null }) => void; onSlideUpdating?: (v: boolean) => void }) {
  const { id: lectureId } = useParams<{ id: string }>()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hey there! 👋 Got any questions about this slide? Ask away! I\'ll do my best to help.',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast();

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user' as const,
      text: inputValue,
    }

    // Build history from prior messages (exclude the current user message and any empty placeholders)
    const history: ChatMessage[] = messages
      .filter(m => m.text && m.text.trim().length > 0)
      .map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

    // Prepare placeholder for the bot so we can stream into it
    const botMsgId = userMessage.id + 1
    const botPlaceholder = {
      id: botMsgId,
      sender: 'bot' as const,
      text: '',
    }

    setMessages(prev => [...prev, userMessage, botPlaceholder])
    setInputValue('')
    setIsLoading(true)

    // We'll accumulate streamed chunks here
    let answer = ''

    try {
      await chatWithLecture(
        lectureId,
        currentSection,
        userMessage.text,
        {
          history,
          onStream: (data: any) => {
            // If the API streams partial text, append; if it sends full text, this still works
            if (typeof data?.answer === 'string') {
              answer = data.answer
              setMessages(prev => prev.map(m => (
                m.id === botMsgId ? { ...m, text: answer } : m
              )))
            }
            if (data?.slide_update) {
              if (data.slide_update.new_html === 'updating') {
                onSlideUpdating?.(true);
                toast({
                  title: 'Updating slide...',
                  description: 'AI is updating the slide. Hang tight!',
                  variant: 'default',
                })
                setMessages(prev => [
                  ...prev,
                  { id: Date.now() + 2, sender: 'bot' as const, text: '' },
                ])
              } else {
                onSlideUpdate?.(data.slide_update);
                onSlideUpdating?.(false);
                toast({
                  title: 'Slide updated!',
                  description: 'Your slide refreshed automatically.',
                  variant: 'default',
                })
                setMessages(prev => [
                  ...prev,
                  { id: Date.now() + 3, sender: 'bot' as const, text: '✅ Updated the slide for you.' },
                ])
              }
            }
          }
        }
      )

      // If nothing was streamed but we have a final answer elsewhere, ensure the placeholder isn't empty
      if (answer === '') {
        setMessages(prev => prev.map(m => (
          m.id === botMsgId ? { ...m, text: 'Got it! (No detailed answer returned.)' } : m
        )))
      }
    } catch (err: any) {
      // Ensure the placeholder exists and shows the error
      setMessages(prev => {
        const hasPlaceholder = prev.some(m => m.id === botMsgId)
        return hasPlaceholder
          ? prev.map(m => (m.id === botMsgId ? { ...m, text: 'Sorry, there was an error contacting the AI.' } : m))
          : [...prev, { id: botMsgId, sender: 'bot' as const, text: 'Sorry, there was an error contacting the AI.' }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants for the chat window
  const chatWindowVariants = {
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        duration: 0.3,
      },
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Animation variants for the FAB icon
  const fabIconVariants = {
    open: {
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2 },
    },
    closed: {
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2 },
    },
  }


  return (
    <>
      {/* AnimatePresence monitors for components being added or removed */}
      <AnimatePresence>
        {isOpen && (
          // Use motion.div for animated HTML elements
          <motion.div
            className="fixed bottom-24 right-4 w-80 h-[28rem] bg-white border rounded-2xl shadow-2xl flex flex-col z-50 animate-in fade-in-5 slide-in-from-bottom-2"
            variants={chatWindowVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-green-100 to-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                {/* <span className="text-2xl">🦜</span> */}
                <h3 className="font-semibold text-base text-green-700">Chat</h3>
              </div>
              <button
                type="button"
                className="rounded-full p-1 hover:bg-green-200 transition-colors"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-green-700" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
              {messages.map((msg) => {
                // If the bot placeholder message has no text yet, show the thinking animation
                if (msg.sender === 'bot' && msg.text === '') {
                  return <ThinkingIndicator key={msg.id} />
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow ${
                        msg.sender === 'user'
                          ? 'bg-black text-white ml-auto'
                          : 'bg-green-50 text-green-900'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 rounded-lg border-gray-200 focus:ring-green-400"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" className="bg-green-500 hover:bg-green-600 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB only visible when chat is closed */}
      {!isOpen && (
        <>
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-16 right-4 z-50 w-16 h-16 rounded-full shadow-lg bg-green-200 flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Open AI Buddy Chatbot"
          animate="closed"
          variants={fabIconVariants}
        >
          <MessageCircle color="black" size={22} />
        </motion.button>
        </>
      )}
    </>
  )
}


/* ------------------------------------------------------------------ */
/* Isolated iframe component                                         */
/* ------------------------------------------------------------------ */
function Iframe({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.srcdoc = html
  }, [html])
  return <iframe ref={ref} style={{ width: "100%", height: "100%" }} />
}


/* ------------------------------------------------------------------ */
/* Main component                                                    */
/* ------------------------------------------------------------------ */
export default function LearningView() {
  /* ------------- params & query ---------------- */
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const searchParams = useSearchParams()
  const isNewlyCreated = searchParams.get("new") === "true"
  const controllerRef = useRef<AbortController | null>(null);
  const { data: userDataRaw, isLoading: userLoading } = useCurrentUser()

  /* ------------- state ------------------------- */
  const [currentSection, setCurrentSection] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [lectureSections, setLectureSections] = useState<Array<{html: string, jsx: string | null}>>([])
  const [availableSections, setAvailableSections] = useState<number[]>([])
  const [totalSections, setTotalSections] = useState(0)
  const [isGeneratingContent, setIsGeneratingContent] = useState(isNewlyCreated)
  const [generationProgress, setGenerationProgress] = useState(isNewlyCreated ? 20 : 100)
  const [lectureStatus, setLectureStatus] = useState("Generating outline…")
  const [courseTitle, setCourseTitle] = useState("")
  const [slideUpdating, setSlideUpdating] = useState(false);

  const handleSlideUpdateFromChat = (update: { new_html?: string; new_jsx?: string | null }) => {
    setLectureSections(prev => {
      const copy = [...prev];
      const cur = copy[currentSection] || { html: '', jsx: null };
      copy[currentSection] = {
        html: update.new_html ?? cur.html,
        jsx: (update as any).new_jsx ?? cur.jsx,
      };
      return copy;
    });
  };

  // Helper to safely extract profileId from userDataRaw
  function getProfileId(userData: unknown): number | undefined {
    if (
      userData &&
      typeof userData === 'object' &&
      'profile' in userData &&
      userData.profile &&
      typeof (userData as any).profile === 'object' &&
      'id' in (userData as any).profile
    ) {
      return (userData as any).profile.id as number;
    }
    return undefined;
  }

  /* ------------------------------------------------------------------ */
  /* B.  live‑generation stream  (only once, only if new)               */
  /* ------------------------------------------------------------------ */

  function handleSSE(evt: any) {
    if (evt.status === "outline_complete") {
      setTotalSections(evt.outline.length);
      setCourseTitle(evt.title);
      setLectureStatus("Generating slides…");
    }
    if (evt.status === "code_complete" && evt.code) {
      setLectureSections(prev => {
        const copy = [...prev];
        copy[evt.index] = {
          html: evt.code.html || "",
          jsx: evt.code.jsx || null,
        };
        return copy;
      });
      setAvailableSections(p =>
        p.includes(evt.index) ? p : [...p, evt.index]
      );
    }
    if (evt.progress) setGenerationProgress(evt.progress);
    if (evt.status === "complete") setIsGeneratingContent(false);
  }


  useEffect(() => {
    if (!isNewlyCreated) return;
    if (!userDataRaw || userLoading) return;
    const profileId = getProfileId(userDataRaw);
    if (!profileId) return;
    // 1️⃣ keep one controller for the whole component‑lifetime
    if (!controllerRef.current || controllerRef.current.signal.aborted) {
      controllerRef.current = new AbortController();
    }
    const { signal } = controllerRef.current;
    const fetchStream = async () => {
      try {
        const res = await streamLecture(id, { isNew: true, profileId }, signal);
        if (!res.ok) {
          setTimeout(fetchStream, 500);
          setLectureStatus("Waiting for generator to start…");
          console.error("Failed to start lecture stream:", res.statusText);
          return;
        }
        await readSSE(res, handleSSE, signal);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      }
    };
    fetchStream();
    return () => controllerRef.current?.abort();
  }, [id, isNewlyCreated, userDataRaw, userLoading]);   // 👈 stays stable, so this runs just once
  

  /**
 * Stream an SSE response and call `onMessage(json)` for every complete event.
 */
async function readSSE(
  res: Response,
  onMessage: (data: any) => void,
  signal?: AbortSignal
) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";          // accumulated text

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // process every *complete* event (ends with \n\n)
    let nl;
    while ((nl = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, nl).trim(); // full event block
      buffer = buffer.slice(nl + 2);               // remainder

      // collect all ‘data:’ lines → single JSON string
      const jsonString = rawEvent
        .split("\n")               // split lines
        .filter(l => l.startsWith("data:"))
        .map(l => l.slice(5))      // drop leading "data:"
        .join("");                 // spec: concatenate

      if (!jsonString) continue;   // ignore empty events
      try {
        onMessage(JSON.parse(jsonString));
      } catch (e) {
        console.error("Bad JSON in SSE:", e, jsonString);
      }
    }
  }
}
const nextSectionReady = availableSections.includes(currentSection + 1);

const nextDisabled =
  currentSection >= totalSections - 1      // at the end
  || isGeneratingContent && !nextSectionReady; // still streaming


  /* ------------------------------------------------------------------ */
  /* C.  lazy page fetch  (fires whenever currentSection changes)       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (isNewlyCreated) return;
    if (!userDataRaw || userLoading) return;
    const profileId = getProfileId(userDataRaw);
    if (!profileId) return;
    if (lectureSections[currentSection] && lectureSections[currentSection].html) return;
    const controller = new AbortController();
    streamLecture(id, { isNew: false, page: currentSection, profileId }, controller.signal)
      .then(res =>
        readSSE(res, evt => {
          console.log(evt);
          if (evt.status === "code_complete" && evt.code) {
            if (evt.index === 0) {
              setTotalSections(evt.length);
            }
            setLectureSections(prev => {
              const copy = [...prev];
              copy[evt.index] = {
                html: evt.code.html || "",
                jsx: evt.code.jsx || null,
              };
              return copy;
            });
            setAvailableSections(p =>
              p.includes(evt.index) ? p : [...p, evt.index]
            );
          }
        })
      )
      .catch(console.error);
    return () => controller.abort();
  }, [id, currentSection, isNewlyCreated, lectureSections, userDataRaw, userLoading]);

  /* ------------------------------------------------------------------ */
  /* Navigation helpers (unchanged)                                     */
  /* ------------------------------------------------------------------ */
  const goNext = () => {
    const currentSlide = lectureSections[currentSection]
    if (currentSlide && currentSlide.jsx && !showQuestion) {
      setShowQuestion(true)
    } else {
      setShowQuestion(false)
      setCurrentSection(currentSection + 1)
    }
  }
  const goPrev = () => {
    setShowQuestion(false)
    setCurrentSection(currentSection - 1)
  }

  useEffect(() => {
    setShowQuestion(false)
  }, [currentSection])
  /* ------------------------------------------------------------------ */
  /* UI (simplified to core parts)                                    */
  /* ------------------------------------------------------------------ */
  return (
    <div className="h-[100vh] flex flex-col">
      {/* header */}
      <header className="border-b p-5 py-7 flex items-center justify-between">
        <Link href={`/lectures/${id}`} className="flex items-center text-sm">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to {courseTitle}
        </Link>
      </header>

      {/* progress bar */}
      <div className="h-2 bg-gray-100 relative">
        <div
          className="h-full bg-primary"
          style={{ width: `${((currentSection + 1) / Math.max(totalSections, 1)) * 100}%` }}
        />
        {isGeneratingContent && (
          <div
            className="absolute top-0 h-full bg-gray-300/50"
            style={{ width: `${generationProgress}%` }}
          />
        )}
      </div>

      {/* slide area */}
      {/* <Card
                className="max-w-5xl min-h-[90%] w-full mx-auto rounded-3xl shadow-lg bg-white border-2 border-green-200/70 p-6 flex items-center justify-center 
                          font-['Nunito','Poppins',sans-serif]"
              > */}
      <main className="flex-1 overflow-auto h-full px-4">
          
        {lectureSections[currentSection] && lectureSections[currentSection].html ? (
          <div className="flex flex-col h-full">
            {(lectureSections[currentSection].jsx && showQuestion)?
           
                <JsxRenderer
                  jsx={lectureSections[currentSection].jsx}
                  onContinue={goNext}
                />
              :
              <div className="flex-grow relative">
                <Iframe html={lectureSections[currentSection].html} />
                <SlideUpdatingOverlay visible={slideUpdating} />
              </div>}

        
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
            <p className="mt-4 text-sm text-gray-600">{lectureStatus}</p>
          </div>
        )}
        
      </main>
{/* </Card> */}
      {/* nav buttons and chatbot */}
      
      {/* Navigation buttons only shown if not showing question */}
      {!showQuestion && (
        <>
          <Button
            onClick={goPrev}
            disabled={currentSection === 0}
            variant="outline"
            className="fixed ml-4 bottom-4 z-50 text-gray-700"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              Previous
            </span>
          </Button>

          {currentSection >= totalSections - 1 && totalSections !== 0 ? (
            <Button
              onClick={() => redirect('/lectures')}
              className="bg-green-500 text-white hover:bg-green-500 absolute right-4 bottom-4"
            >
              <span className="hidden sm:inline">
                Finish
              </span> <Check className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="bg-primary text-white absolute right-4 bottom-4"
              disabled={nextDisabled}
            >
              <span className="hidden sm:inline">
                Next
              </span>  <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          )}
        </>
      )}

      {/* B. The BuddyChatbot is added here */}
      <BuddyChatbot
        currentSection={currentSection}
        onSlideUpdate={handleSlideUpdateFromChat}
        onSlideUpdating={setSlideUpdating}
      />
    </div>
  )
}
