"use client"

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useParams, redirect } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, Play, Pause, MessageSquare, Send, X, Brain,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { streamLecture } from "@/lib/api"    // helper imported here

/* ------------------------------------------------------------------ */
/*  helper (keep in lib/api.ts or here if you prefer)                 */
/* ------------------------------------------------------------------ */
export async function streamLecture(
  lectureId: string,
  opts: { isNew: boolean; page?: number },
  signal?: AbortSignal
) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/stream`
  )
  if (!opts.isNew && opts.page !== undefined) {
    url.searchParams.set("page", String(opts.page))
  }
  return fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "text/event-stream" },
    mode: "cors",
    signal,
  })
}

/* ------------------------------------------------------------------ */
/*  Isolated iframe component                                         */
/* ------------------------------------------------------------------ */
function Iframe({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.srcdoc = html
  }, [html])
  return <iframe ref={ref} style={{ width: "100%", height: "100%" }} />
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export default function LearningView() {
  /* ------------- params & query ---------------- */
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const searchParams = useSearchParams()
  const isNewlyCreated = searchParams.get("new") === "true"

  /* ------------- state ------------------------- */
  const [currentSection, setCurrentSection] = useState(0)
  const [lecturePages, setLecturePages] = useState<string[]>([])
  const [availableSections, setAvailableSections] = useState<number[]>([])
  const [totalSections, setTotalSections] = useState(0)
  const [isGeneratingContent, setIsGeneratingContent] = useState(isNewlyCreated)
  const [generationProgress, setGenerationProgress] = useState(isNewlyCreated ? 20 : 100)
  const [lectureStatus, setLectureStatus] = useState("Generating outline…")
  const [courseTitle, setCourseTitle] = useState("")

  /* ------------------------------------------------------------------ */
  /* A.  live‑generation stream  (only once, only if new)               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isNewlyCreated) return;
  
    // 1️⃣ keep one controller for the whole component‑lifetime
    const controllerRef = controllerRef ?? new AbortController();
    const { signal } = controllerRef;
  
    // 2️⃣ do NOT blow up if React’s test‑cleanup aborts us
    const fetchStream = async () => {
      try {
        const res = await streamLecture(id, { isNew: true }, signal);
        if (!res.ok) {
          // The generator may not be ready yet – try again in 500 ms
          setTimeout(fetchStream, 500);
          return;
        }
        await readSSE(res, handleSSE, signal);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      }
    };
  
    fetchStream();
  
    // 3️⃣ abort **only** when the component really unmounts
    return () => controllerRef.abort();
  }, [id, isNewlyCreated]);   // 👈 stays stable, so this runs just once
  

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


  /* ------------------------------------------------------------------ */
  /* B.  lazy page fetch  (fires whenever currentSection changes)       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (isNewlyCreated) return;
    if (lecturePages[currentSection]) return;
  
    const controller = new AbortController();
    streamLecture(id, { isNew: false, page: currentSection }, controller.signal)
      .then(res =>
        readSSE(res, evt => {
          if (evt.status === "html_complete") {
            if (evt.index   == 0) {
              setTotalSections(evt.length)
            }
            setLecturePages(p => {
              const copy = [...p];
              copy[evt.index] = evt.html;
              return copy;
            });
            setAvailableSections(p => [...p, evt.index]);
          }
        })
      )
      .catch(console.error);
  
    return () => controller.abort();
  }, [id, currentSection, isNewlyCreated, lecturePages]);

  /* ------------------------------------------------------------------ */
  /* Navigation helpers (unchanged)                                     */
  /* ------------------------------------------------------------------ */
  const goNext = () =>
    setCurrentSection(currentSection + 1)
  const goPrev = () =>
    setCurrentSection(currentSection - 1)

  /* ------------------------------------------------------------------ */
  /*   UI (simplified to core parts)                                    */
  /* ------------------------------------------------------------------ */
  return (
    <div className="h-[100vh] flex flex-col">
      {/* header */}
      <header className="border-b p-5 py-7 flex items-center justify-between">
        <Link href={`/lectures/${id}`} className="flex items-center text-sm">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to {courseTitle}
        </Link>
        {/* <Badge className="bg-green-300 text-black flex items-center mr-20">
          <Brain className="h-4 w-4 mr-1" /> AI
        </Badge> */}
      </header>

      {/* progress bar */}
      <div className="h-2 bg-gray-100 relative">
        <div
          className="h-full bg-green-500"
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
      <main className="flex-1 overflow-auto">
        {lecturePages[currentSection] ? (
          <Iframe html={lecturePages[currentSection]} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
            <p className="mt-4 text-sm text-gray-600">{lectureStatus}</p>
          </div>
        )}
      </main>

      {/* nav buttons */}
      
      
      <footer className="p-4 flex justify-between bg-transparent backdrop-blur-sm border-t">
        <Button onClick={goPrev} disabled={currentSection === 0} variant="outline">
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        {currentSection >= totalSections - 1 ? (
          <Button
          onClick={() => redirect('/lectures')}
          className="bg-green-500 text-white hover:bg-green-500  "
        >
          Finish <ChevronLeft className="h-4 w-4 ml-2 rotate-180 " />
        </Button>
        ):
        (<Button
          onClick={goNext}
          className="bg-black text-white"
        >
          Next <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
        </Button>)} 
      </footer>
    </div>
  )
}
