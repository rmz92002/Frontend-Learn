"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Play,
  Pause,
  MessageSquare,
  Send,
  X,
  Brain,
  Code,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import Spline from '@splinetool/react-spline/next';
import {getLecture} from "@/lib/api"
import { useParams } from 'next/navigation'



interface LearningViewProps {
  params: {
    slug: string
    moduleId: string
  }
}

// Iframe component to isolate generated HTML content from the parent UI styles
function Iframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (iframeRef.current) {
      // Use srcdoc to inject HTML content
      iframeRef.current.srcdoc = html
    }
  }, [html])
  return <iframe ref={iframeRef} style={{width:'100%', height:'100%'}} />
}

export default function LearningView({ params }: any) {
  const searchParams = useSearchParams()
 
  const { slug, id } = useParams<{ slug: string; id: string }>()

  // Parse URL parameters
  const moduleTitle = searchParams.get("title") 
  const isNewlyCreated = searchParams.get("new") === "true"

  // Content and playback states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [progress, setProgress] = useState(0)
  const [lectureStatus, setLectureStatus] = useState("Generating Lecture outline...")

  // Generation states
  const [isGeneratingContent, setIsGeneratingContent] = useState(isNewlyCreated)
  const [generationProgress, setGenerationProgress] = useState(isNewlyCreated ? 20 : 100)
  const [availableSections, setAvailableSections] = useState<number[]>(isNewlyCreated ? [] : [0, 1, 2, 3, 4])
  // This state holds the generated lecture HTML per section
  const [lecturePages, setLecturePages] = useState<string[]>([])

  // Chat states (unchanged)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Format the course slug for display
  const courseTitle = slug
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Untitled Course"

  // Static module content as fallback
  const moduleContent = {
    title: `Module ${id}: Core Concepts`,
    description: "Learn the fundamental concepts and principles of web development.",
    sections: [
      {
        title: "Introduction",
        content: `Welcome to Module ${id} of ${courseTitle}. In this module, we'll explore the core concepts and principles that form the foundation of this subject.`,
        beginner: "This is a friendly introduction to get you started with the basics.",
        intermediate: "This module builds on your existing knowledge to deepen your understanding.",
        advanced: "This advanced module assumes you're already familiar with the fundamentals.",
      },
      {
        title: "Learning Objectives",
        content:
          "By the end of this module, you will be able to understand the fundamental principles, apply theoretical knowledge to practical scenarios, analyze complex problems, and develop effective solutions.",
      },
      {
        title: "Key Concepts",
        content: `The key concepts covered in this module include theoretical frameworks, practical applications, and case studies that illustrate the importance of ${courseTitle} in various contexts.`,
      },
      {
        title: "Practical Applications",
        content:
          "We'll examine several real-world examples where these concepts are applied, helping you understand their practical significance.",
      },
      {
        title: "Summary",
        content:
          "This module provides a comprehensive overview of the core concepts, setting the foundation for more advanced topics in subsequent modules.",
      },
    ],
    exercises: [
      {
        title: "Interactive Exercise 1",
        description: "Apply what you've learned by completing this interactive exercise.",
        difficulty: "beginner",
      },
      {
        title: "Interactive Exercise 2",
        description: "Test your understanding with this intermediate challenge.",
        difficulty: "intermediate",
      },
      {
        title: "Interactive Exercise 3",
        description: "Tackle this advanced problem to demonstrate mastery.",
        difficulty: "advanced",
      },
    ],
  }

  // Helper: Get content based on proficiency level
  // const getProficiencyContent = (section: any) => {
  //   if (section[proficiency]) {
  //     return section[proficiency]
  //   }
  //   return section.content
  // }

  // Total sections is determined by generated lecture pages (if available) or fallback static sections
  const totalSections = lecturePages.length > 0 ? lecturePages.length : moduleContent.sections.length

  // POST to localhost:8000 to generate lecture content if newly created
  useEffect(() => {
    
    if (isNewlyCreated) {
      const controller = new AbortController()
      getLecture(id, controller.signal).then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let buffer = ""
          function read() {
            return reader?.read().then(({ done, value }) => {
              if (done) return
              buffer += decoder.decode(value, { stream: true })
              const parts = buffer.split("\n\n")
              buffer = parts.pop() || ""
              parts.forEach((part) => {
                if (part.trim()) {
                  try {
                    const event = JSON.parse(part)
                    // print event
                    console.log(event)
                    if (event.status === "outline_complete") {
                      setLectureStatus("Generating Lecture Slides...")
                    }
                    if (event.status === "html_complete") {

                      setLecturePages((prev) => [...prev, event.html]);
                      
                      setAvailableSections((prev) => [...prev, event.index]); // Use event.index instead of prev.length
                    }
                    if (event.progress) {
                      setGenerationProgress(event.progress)
                    }
                    if (event.status === "complete") {
                      setIsGeneratingContent(false)
                    }
                  } catch (err) {
                    console.error("Error parsing stream chunk", err)
                  }
                }
              })
              return read()
            })
          }
          return read()
        })
        .catch((error) => {
          console.error("Error generating lecture:", error)
        })

    }
  }, [isNewlyCreated, moduleTitle,])

  // Update progress when current section changes
  useEffect(() => {
    const newProgress = ((currentSection + 1) / totalSections) * 100
    setProgress(newProgress)
  }, [currentSection, totalSections])

  // Text-to-speech function
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const togglePlayPause = () => {

    if (isPlaying) {
      window.speechSynthesis.cancel()
    } else {
      const sectionText =
        moduleContent.sections[currentSection].title +
        ". " +
        (lecturePages.length > 0
          ? lecturePages[currentSection].replace(/<[^>]+>/g, "")
          : moduleContent.sections[currentSection].content)
      speakText(sectionText)
    }
    setIsPlaying(!isPlaying)
  }

  // Navigation functions
  const goToNextSection = () => {
    if (currentSection < totalSections - 1 && availableSections.includes(currentSection + 1)) {
      setCurrentSection(currentSection + 1)
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      window.scrollTo(0, 0)
    }
  }

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      window.scrollTo(0, 0)
    }
  }


  const isLastSection = () => {
    return currentSection === totalSections - 1
  }

  // Chat message handler (placeholder implementation)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = { role: "user" as const, content: message }
    setChatMessages([...chatMessages, userMessage])
    setMessage("")
    setIsLoading(true)

    setTimeout(() => {
      const currentContent = moduleContent.sections[currentSection]
      let aiResponse = ""
      if (message.toLowerCase().includes("what") && message.toLowerCase().includes("this module")) {
        aiResponse = `This module covers ${currentContent.title}. ${currentContent.content}`
      } else if (message.toLowerCase().includes("explain")) {
        aiResponse = `I'd be happy to explain more about ${currentContent.title}`
      } else if (message.toLowerCase().includes("example")) {
        aiResponse = `Here's an example related to ${currentContent.title}: In web development, you would apply these concepts when building responsive interfaces that adapt to different screen sizes.`
      } else {
        aiResponse = `That's a great question about ${currentContent.title}. The key thing to understand is that ${courseTitle} builds on fundamental principles that you'll master throughout this course.`
      }
      setChatMessages((prev) => [...prev, { role: "assistant", content: aiResponse }])
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  return (
    <div className={`h-[100vh] bg-white `}>
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link href={`/courses/${slug}`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to {courseTitle}
          </Link>
          <div className="flex items-center space-x-2 relative mr-28 "> 
            <Badge
              className={`${
               "bg-pastel-green"
              } text-black`}
            >
              <Brain className="w-3 h-3 mr-1" />
              
            </Badge>
        
              <Button variant="ghost" size="sm" className="rounded-full" onClick={togglePlayPause}>
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause Audio
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Play Audio
                  </>
                )}
              </Button>
         
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 relative">
          <div
            className={`h-full ${
  
                "bg-pastel-green"
               
            }`}
            style={{ width: `${progress}%` }}
          ></div>
          {isGeneratingContent && (
            <div
              className="absolute top-0 h-full bg-gray-300/50"
              style={{
                left: `${progress}%`,
                width: `${generationProgress - progress}%`,
                transition: "width 0.5s ease-out",
              }}
            ></div>
          )}
        </div>
      </div>

      {/* Main content */}
      {/* <div className=" px-4 md:px-8 mx-auto h-full"> */}
        
        {/* Content display */}
        <div className="prose max-w-none h-full br-4">
          {lecturePages.length > 0 ? (
            // Render generated lecture HTML inside an iframe to avoid UI conflicts
            <Iframe html={lecturePages[currentSection]}  />
          ) : (
            //loading animation placeholder 
            <div className="flex items-center justify-center h-full flex-col space-y-4">
    <Loader2 className={`w-12 h-12 animate-spin ${
      "text-pastel-green" 
      
    }`} />
    <div className="text-center space-y-2">
      {/* <p className="text-gray-600 font-medium">{generationStatus}</p>
      <p className="text-sm text-gray-400">
        {generationProgress.toFixed(0)}% complete
      </p> */}
      <p className="text-gray-600 font-medium">{lectureStatus}</p>
    </div>
  </div>
          )}
          
        </div>
      {/* </div> */}

      {/* Navigation Footer */}
      {/* <div className="fixed bottom-0 left-0 right-0 border-t py-3 px-4"> */}
        {/* <div className="container mx-auto flex justify-between items-center"> */}
          <Button variant="outline" onClick={goToPreviousSection} disabled={currentSection === 0} className="rounded-full sticky bottom-4 ml-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
            {/* <Button variant="outline" className="rounded-full" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
           */}
          <Button
            onClick={goToNextSection}
            disabled={isLastSection() || (isGeneratingContent && !availableSections.includes(currentSection + 1))}
            className="rounded-full bg-black text-white hover:bg-gray-800 fixed bottom-4 right-4"
          >
            {isGeneratingContent && !availableSections.includes(currentSection + 1) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Next
                <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
              </>
            )}
          </Button>
        {/* </div>
      </div> */}

      {/* Chat Button & Panel */}
      {/* <Spline
        scene="https://prod.spline.design/Bsda9mAsBegR0A69/scene.splinecode" 
      /> */}
      <div className="fixed bottom-20 right-4 z-20">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`rounded-full w-12 h-12 p-0 shadow-md ${isChatOpen ? "hidden" : "bg-black text-white hover:bg-gray-800"}`}
        >
          {/* <MessageSquare className="h-5 w-5" /> */}
          
          
        </Button>
      </div>
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-10 flex flex-col max-h-[60vh] overflow-hidden">
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">AI Tutor</h3>
                <p className="text-xs text-gray-500">Ask questions about this module</p>
              </div>
            </div>
            <Button onClick={() => setIsChatOpen(false)} variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: "300px" }}>
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">Ask a question about the module</div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-2 text-sm ${msg.role === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-800"}`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-2 text-sm">
                  <span className="inline-block animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-2 border-t flex">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question..."
              className="rounded-full text-sm"
            />
            <Button type="submit" size="icon" className="ml-1 rounded-full h-9 w-9 p-0 flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
