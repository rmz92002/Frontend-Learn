import { Bookmark, Clock, Star } from "lucide-react"
import Link from "next/link"

export default function BookmarksPage() {
  const savedLectures = [
    {
      id: 1,
      title: "Introduction to Neural Networks",
      course: "Neural Networks",
      savedAt: "2 days ago",
      progress: 75,
      favorite: true,
    },
    {
      id: 2,
      title: "Variables and Data Types",
      course: "Programming Basics",
      savedAt: "1 week ago",
      progress: 100,
      favorite: false,
    },
    {
      id: 3,
      title: "The Renaissance Period",
      course: "World History",
      savedAt: "2 weeks ago",
      progress: 30,
      favorite: true,
    },
    {
      id: 4,
      title: "Derivatives and Integrals",
      course: "Calculus",
      savedAt: "1 month ago",
      progress: 0,
      favorite: false,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Lectures</h1>

      <div className="bg-white rounded-lg shadow">
        {savedLectures.length > 0 ? (
          <div className="divide-y">
            {savedLectures.map((lecture) => (
              <div key={lecture.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/courses/${lecture.course.toLowerCase().replace(/\s+/g, "-")}/learn/${lecture.id}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    >
                      {lecture.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Course: {lecture.course}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Saved {lecture.savedAt}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className={`p-1 rounded-full ${lecture.favorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-500"}`}
                    >
                      <Star className="h-5 w-5" />
                    </button>
                    <button className="p-1 rounded-full text-blue-500 hover:text-blue-600">
                      <Bookmark className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{lecture.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${lecture.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full mb-4">
              <Bookmark className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No saved lectures</h3>
            <p className="text-gray-500 mt-1">Bookmark lectures to access them quickly later!</p>
          </div>
        )}
      </div>
    </div>
  )
}

