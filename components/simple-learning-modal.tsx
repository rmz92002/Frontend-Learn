"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Headphones, Code, FileText, Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface SimpleLearningModalProps {
  courseSlug: string
  moduleId: number
  courseName: string
}

export default function SimpleLearningModal({ courseSlug, moduleId, courseName }: SimpleLearningModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const learningOptions = [
    {
      id: "comprehensive",
      title: "Comprehensive Lesson",
      subtitle: "Interactive Webpage Creation",
      description:
        "Learn how to build multiple HTML pages through reading content, viewing visual examples, interactive exercises, and listening to guided audio narration.",
      includes: [
        { text: "Text explanations", icon: <FileText className="w-4 h-4" /> },
        { text: "Visual images and diagrams", icon: <BookOpen className="w-4 h-4" /> },
        { text: "Interactive coding exercises", icon: <Code className="w-4 h-4" /> },
        { text: "Audio narration for each section", icon: <Headphones className="w-4 h-4" /> },
      ],
      icon: <Sparkles className="w-10 h-10" />,
      color: "bg-pastel-purple",
    },
    {
      id: "audio",
      title: "Audio Only",
      subtitle: "Web Development Podcast",
      description:
        "Listen to a concise, podcast-style audio lesson guiding you through the essentials of creating HTML pages, ideal for learning on-the-go.",
      includes: [
        { text: "Audio-only instruction", icon: <Headphones className="w-4 h-4" /> },
        { text: "Clear and engaging podcast format", icon: <FileText className="w-4 h-4" /> },
      ],
      icon: <Headphones className="w-10 h-10" />,
      color: "bg-pastel-yellow",
    },
  ]

  const handleSelectOption = (optionId: string) => {
    router.push(`/courses/${courseSlug}/learn/${moduleId}?format=${optionId}`)
    setIsOpen(false)
  }

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <>
      <Button className="rounded-full bg-black text-white hover:bg-gray-800" onClick={() => setIsOpen(true)}>
        <Sparkles className="w-4 h-4 mr-2" />
        Learn This Module
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-4xl mx-4 my-8 rounded-bubble bg-white position-absolute overflow-hidden shadow-xl animate-in zoom-in-95"
          >
            <div className="sticky top-0 z-50 bg-black text-white p-6 rounded-t-bubble">
              <button
                className="absolute right-4 top-4 text-white/70 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold">Choose Your Learning Style</h2>
              <p className="text-gray-300 mt-1">
                Select how you'd like to learn Module {moduleId} of {courseName}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`${option.color} rounded-bubble p-6 cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden`}
                    onClick={() => handleSelectOption(option.id)}
                  >
                    <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
                    <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-black opacity-5"></div>

                    <div className="bg-white p-4 rounded-xl inline-block mb-4">{option.icon}</div>

                    <h3 className="text-xl font-bold">{option.title}</h3>
                    <h4 className="text-lg font-medium mb-2">{option.subtitle}</h4>
                    <p className="text-sm text-gray-700 mb-4">{option.description}</p>

                    <div className="bg-white/50 rounded-xl p-4">
                      <h5 className="font-bold mb-2">Includes:</h5>
                      <ul className="space-y-2">
                        {option.includes.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            {item.icon}
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full mt-4 rounded-full bg-black text-white hover:bg-gray-800">
                      Start Learning
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

