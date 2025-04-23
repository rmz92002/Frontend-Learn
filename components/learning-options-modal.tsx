"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Headphones, BookOpen, Code, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

// Minimalist props interface
interface LearningOptionsModalProps {
  moduleId: number
}

export default function LearningOptionsModal({ moduleId }: LearningOptionsModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Learning customization options
  const [proficiency, setProficiency] = useState("intermediate")
  const [includeVoiceover, setIncludeVoiceover] = useState(true)
  const [includeExercises, setIncludeExercises] = useState(true)
  const [customInstructions, setCustomInstructions] = useState("")

  const proficiencyLevels = [
    { id: "beginner", label: "Beginner", description: "New to the subject", color: "bg-pastel-green" },
    { id: "intermediate", label: "Intermediate", description: "Familiar with basics", color: "bg-pastel-yellow" },
    { id: "advanced", label: "Advanced", description: "Experienced learner", color: "bg-pastel-purple" },
  ]

  const handleStartLearning = () => {
    // Include all customization options in the URL
    const params = new URLSearchParams({
      proficiency,
      voiceover: includeVoiceover.toString(),
      exercises: includeExercises.toString(),
    })

    if (customInstructions.trim()) {
      params.append("instructions", encodeURIComponent(customInstructions.trim()))
    }

    // Get the current course slug from the URL
    const pathSegments = window.location.pathname.split("/")
    const courseSlug = pathSegments[2] // This should be the slug in /courses/[slug]
    router.push(`/courses/${courseSlug}/learn/${moduleId}?${params.toString()}`)
    setOpen(false)
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  return (
    <>
      <Button className="rounded-full bg-black text-white hover:bg-gray-800" onClick={handleOpenDialog}>
        <Sparkles className="w-4 h-4 mr-2" />
        Learn This Module
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 border-none">
          <DialogHeader className="bg-black text-white p-6">
            <DialogTitle className="text-xl font-bold">Customize Your Learning</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Proficiency Level */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Your Proficiency Level
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {proficiencyLevels.map((level) => (
                  <Card
                    key={level.id}
                    className={`${level.color} p-3 cursor-pointer transition-all hover:scale-[1.02] ${
                      proficiency === level.id ? "ring-2 ring-black" : "opacity-80"
                    }`}
                    onClick={() => setProficiency(level.id)}
                  >
                    <div className="text-center">
                      <h4 className="font-bold text-sm">{level.label}</h4>
                      <p className="text-xs mt-1 text-gray-700">{level.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
              <h3 className="font-medium mb-2">Content Options</h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-pastel-yellow p-2 rounded-full mr-3">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <Label htmlFor="include-voiceover" className="font-medium">
                      Voiceover
                    </Label>
                    <p className="text-xs text-gray-500">Audio narration of content</p>
                  </div>
                </div>
                <Switch id="include-voiceover" checked={includeVoiceover} onCheckedChange={setIncludeVoiceover} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-pastel-green p-2 rounded-full mr-3">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <Label htmlFor="include-exercises" className="font-medium">
                      Interactive Exercises
                    </Label>
                    <p className="text-xs text-gray-500">Hands-on practice activities</p>
                  </div>
                </div>
                <Switch id="include-exercises" checked={includeExercises} onCheckedChange={setIncludeExercises} />
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <div className="flex items-center mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                <Label htmlFor="custom-instructions" className="font-medium">
                  Custom Instructions
                </Label>
              </div>
              <Textarea
                id="custom-instructions"
                placeholder="How would you like this content presented? E.g., 'Focus on real-world examples' or 'Explain concepts visually'"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="h-20 resize-none bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Add specific requests for your learning experience</p>
            </div>

            <Button className="w-full rounded-full bg-black text-white hover:bg-gray-800" onClick={handleStartLearning}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

