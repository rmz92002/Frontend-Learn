import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CourseCardProps {
  title: string
  description: string
  progress: number
  duration: string
  image: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

export default function CourseCard({ title, description, progress, duration, image, difficulty }: CourseCardProps) {
  const difficultyColor = {
    Beginner: "bg-pastel-green",
    Intermediate: "bg-pastel-yellow",
    Advanced: "bg-pastel-purple",
  }[difficulty]

  return (
    <Link href={`/courses/${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <Card className="rounded-bubble overflow-hidden hover:scale-[1.02] transition-transform relative">
        <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-black opacity-5"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-black opacity-5"></div>

        <div className="relative h-48 rounded-t-bubble overflow-hidden">
          <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${difficultyColor} rounded-full px-4 py-1 text-black`}>{difficulty}</Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {duration}
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full ${
                  difficulty === "Beginner"
                    ? "bg-dot-green"
                    : difficulty === "Intermediate"
                      ? "bg-dot-yellow"
                      : "bg-dot-purple"
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

