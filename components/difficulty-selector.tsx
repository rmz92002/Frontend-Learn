"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Sparkles, Loader2 } from "lucide-react"

interface DifficultySelectorProps {
  value: string
  onChange: (value: string) => void
  onRegenerate: () => void
  isGenerating: boolean
}

export default function DifficultySelector({ value, onChange, onRegenerate, isGenerating }: DifficultySelectorProps) {
  const difficultyLabels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
  }

  const difficultyColors = {
    beginner: "bg-pastel-green",
    intermediate: "bg-pastel-yellow",
    advanced: "bg-pastel-purple",
    expert: "bg-pastel-pink",
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`rounded-full flex items-center  ${difficultyColors[value as keyof typeof difficultyColors]} text-black`}
          >
            Difficulty: {difficultyLabels[value as keyof typeof difficultyLabels]}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem onClick={() => onChange("beginner")} className="rounded-lg hover:bg-pastel-green">
            Beginner
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("intermediate")} className="rounded-lg hover:bg-pastel-yellow">
            Intermediate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("advanced")} className="rounded-lg hover:bg-pastel-purple">
            Advanced
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("expert")} className="rounded-lg hover:bg-pastel-pink">
            Expert
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        className="rounded-full flex items-center text-black"
        onClick={onRegenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate
          </>
        )}
      </Button>
    </div>
  )
}

