import { Card } from "@/components/ui/card"
import { Clock, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FeaturedCourses() {
  const featuredCourses = [
    {
      id: 1,
      title: "Topographic Anatomy",
      duration: "16 min",
      color: "pastel-green",
      rating: "4.8",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      title: "Circulatory System",
      duration: "30 min",
      color: "pastel-purple",
      rating: "4.9",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      title: "Machine Learning Basics",
      duration: "45 min",
      color: "pastel-yellow",
      rating: "4.7",
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8">Featured Lectures</h2>
      <div className="grid gap-6">
        {featuredCourses.map((course) => (
          <Link href={`/courses/${course.id}`} key={course.id}>
            <Card
              className={`rounded-bubble bg-${course.color} p-5 relative overflow-hidden hover:scale-[1.02] transition-transform shadow-sm`}
            >
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white opacity-10"></div>
              <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-black opacity-5"></div>
              <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-black opacity-5"></div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center overflow-hidden">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">{course.title}</h3>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="text-sm flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                    <div className="text-sm flex items-center gap-1.5 font-medium">
                      <Star className="w-4 h-4" />
                      {course.rating}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

