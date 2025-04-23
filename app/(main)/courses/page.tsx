"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Clock, BookOpen, User, Calendar, X, Plus } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock data for courses
const coursesData = [
  {
    id: "1",
    title: "Introduction to JavaScript",
    description: "Learn the basics of JavaScript programming language",
    duration: 45,
    category: "Programming",
    author: "John Doe",
    date: "2023-04-15",
    image: "/placeholder.svg?height=200&width=300",
    progress: 75,
    color: "blue",
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Explore advanced patterns and techniques in React",
    duration: 60,
    category: "Web Development",
    author: "Jane Smith",
    date: "2023-05-20",
    image: "/placeholder.svg?height=200&width=300",
    progress: 30,
    color: "green",
  },
  {
    id: "3",
    title: "Data Structures Fundamentals",
    description: "Understanding basic data structures and their implementations",
    duration: 90,
    category: "Computer Science",
    author: "Alex Johnson",
    date: "2023-03-10",
    image: "/placeholder.svg?height=200&width=300",
    progress: 100,
    color: "purple",
  },
  {
    id: "4",
    title: "Machine Learning Basics",
    description: "Introduction to machine learning concepts and algorithms",
    duration: 75,
    category: "AI",
    author: "Sarah Williams",
    date: "2023-06-05",
    image: "/placeholder.svg?height=200&width=300",
    progress: 50,
    color: "pink",
  },
  {
    id: "5",
    title: "UI/UX Design Principles",
    description: "Learn the core principles of effective UI/UX design",
    duration: 50,
    category: "Design",
    author: "Michael Brown",
    date: "2023-02-28",
    image: "/placeholder.svg?height=200&width=300",
    progress: 10,
    color: "orange",
  },
  {
    id: "6",
    title: "Python for Data Science",
    description: "Using Python for data analysis and visualization",
    duration: 65,
    category: "Data Science",
    author: "Emily Davis",
    date: "2023-07-12",
    image: "/placeholder.svg?height=200&width=300",
    progress: 0,
    color: "teal",
  },
]

// Color mapping for progress bars
const colorMap = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
}

// All available categories from the data
const allCategories = Array.from(new Set(coursesData.map((course) => course.category)))

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Filter courses based on search query and selected categories
  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category)

    return matchesSearch && matchesCategory
  })

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
  }

  // Handle input changes for new course
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewCourse({ ...newCourse, [name]: value })
  }

  // Handle course creation
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    // Simulate API call
    setTimeout(() => {
      setIsCreating(false)
      setShowSuccess(true)

      // Reset form and close modal after showing success message
      setTimeout(() => {
        setShowSuccess(false)
        setIsCreateModalOpen(false)
        setNewCourse({
          title: "",
          description: "",
        })
      }, 1500)
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Courses</h1>
          <p className="text-gray-600">Browse and discover educational courses</p>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategories.includes(category)
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active filters */}
          {(searchQuery || selectedCategories.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Active Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== category))}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create New Course Button */}
        <div className="flex justify-end">
          <Button
            className="rounded-full bg-black text-white hover:bg-gray-800 shadow-md"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        </div>

        {/* Create Course Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-4" style={{ borderRadius: 10 }}>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>

            {showSuccess ? (
              <div className="py-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Course Created!</h3>
                <p className="text-gray-500">Your new course has been created successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateCourse}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter course title"
                      value={newCourse.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter course description"
                      value={newCourse.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Link href={`/courses/${course.id}`} key={course.id}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                  <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Progress overlay */}
                    {course.progress > 0 && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                        <div
                          className={`h-full ${colorMap[course.color as keyof typeof colorMap] || "bg-blue-500"}`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{course.category}</Badge>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{course.duration} min</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                    {/* Progress indicator */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Progress</span>
                        <span className={`${course.progress === 100 ? "text-green-600 font-medium" : "text-gray-500"}`}>
                          {course.progress}%{course.progress === 100 && " • Completed"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorMap[course.color as keyof typeof colorMap] || "bg-blue-500"} transition-all duration-500 ease-out`}
                          style={{
                            width: `${course.progress}%`,
                            boxShadow:
                              course.progress > 0
                                ? `0 0 8px ${course.color === "blue" ? "#3b82f6" : course.color === "green" ? "#22c55e" : course.color === "purple" ? "#a855f7" : course.color === "pink" ? "#ec4899" : course.color === "orange" ? "#f97316" : "#14b8a6"}`
                                : "none",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{course.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(course.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

