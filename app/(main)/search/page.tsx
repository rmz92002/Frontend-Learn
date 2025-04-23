"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, UserCheck } from "lucide-react"
import CourseCard from "@/components/course-card"
import { useSearchParams, useRouter } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""
  const initialTab = searchParams.get("tab") || "courses"

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isSearching, setIsSearching] = useState(false)

  // Mock courses data
  const courses = [
    {
      title: "Introduction to AI",
      description: "Learn the fundamentals of artificial intelligence",
      progress: 65,
      duration: "45 min",
      durationMinutes: 45,
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Beginner",
      category: "Technology",
    },
    {
      title: "Web Development",
      description: "Master modern web development techniques",
      progress: 32,
      duration: "1h 20min",
      durationMinutes: 80,
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Intermediate",
      category: "Technology",
    },
    {
      title: "Data Structures",
      description: "Essential algorithms and data structures",
      progress: 78,
      duration: "55 min",
      durationMinutes: 55,
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Advanced",
      category: "Technology",
    },
    {
      title: "Human Biology",
      description: "Explore the systems of the human body",
      progress: 45,
      duration: "1h 10min",
      durationMinutes: 70,
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Intermediate",
      category: "Science",
    },
    {
      title: "Digital Marketing",
      description: "Learn effective online marketing strategies",
      progress: 20,
      duration: "50 min",
      durationMinutes: 50,
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Beginner",
      category: "Business",
    },
  ]

  // Mock people data
  const people = [
    {
      id: 1,
      name: "Michael Kopfler",
      avatar: "/placeholder.svg?height=100&width=100",
      mutualFriends: 8,
      isFriend: true,
    },
    { id: 2, name: "Emma Wilson", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 5, isFriend: true },
    { id: 3, name: "Alice Koller", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 3, isFriend: true },
    {
      id: 4,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      mutualFriends: 4,
      isFriend: false,
    },
    { id: 5, name: "David Chen", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 7, isFriend: false },
    { id: 6, name: "Lisa Wang", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 3, isFriend: false },
    { id: 7, name: "James Wilson", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 2, isFriend: false },
  ]

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return false

    const query = searchQuery.toLowerCase()
    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query) ||
      course.difficulty.toLowerCase().includes(query)
    )
  })

  // Filter people based on search query
  const filteredPeople = people.filter((person) => {
    if (!searchQuery) return false

    const query = searchQuery.toLowerCase()
    return person.name.toLowerCase().includes(query)
  })

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)

    // Update URL with search parameters
    const params = new URLSearchParams()
    params.set("q", searchQuery)
    params.set("tab", activeTab)
    router.push(`/search?${params.toString()}`)

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL with new tab
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.push(`/search?${params.toString()}`)
  }

  // Simulate search on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      setIsSearching(true)
      setTimeout(() => {
        setIsSearching(false)
      }, 500)
    }
  }, [initialQuery])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <div className="rounded-bubble bg-black text-white p-8 relative overflow-hidden animate-float">
          {/* Decorative dots */}
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-dot-green opacity-30"></div>
          <div className="absolute bottom-4 left-8 w-2 h-2 rounded-full bg-dot-pink opacity-30"></div>
          <div className="absolute top-1/2 right-8 w-2 h-2 rounded-full bg-white opacity-30"></div>

          <h1 className="text-3xl font-bold mb-4">Search</h1>
          <p className="text-gray-300">Find courses, people, and more</p>
        </div>

        <div className="mt-6">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for courses, people, and more..."
                className="pl-12 pr-4 py-6 rounded-full text-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Searching...
                  </div>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </form>

          {searchQuery && (
            <div className="mt-6">
              <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
                <TabsList className="flex p-1 overflow-x-auto bg-white rounded-full border border-gray-100 shadow-sm mb-6">
                  <TabsTrigger value="courses" className="rounded-full px-4 py-2">
                    Courses {filteredCourses.length > 0 && `(${filteredCourses.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="people" className="rounded-full px-4 py-2">
                    People {filteredPeople.length > 0 && `(${filteredPeople.length})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="mt-0">
                  <Card className="rounded-bubble p-6">
                    <h2 className="text-xl font-bold mb-4">Courses</h2>

                    {isSearching ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-bubble overflow-hidden bg-gray-100 animate-pulse h-80"></div>
                        ))}
                      </div>
                    ) : filteredCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course, index) => (
                          <CourseCard
                            key={index}
                            title={course.title}
                            description={course.description}
                            progress={course.progress}
                            duration={course.duration}
                            image={course.image}
                            difficulty={course.difficulty as any}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-bold mb-2">No courses found</h3>
                        <p className="text-gray-500 mb-4">Try a different search term</p>
                      </div>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="people" className="mt-0">
                  <Card className="rounded-bubble p-6">
                    <h2 className="text-xl font-bold mb-4">People</h2>

                    {isSearching ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center p-4 rounded-xl bg-gray-100 animate-pulse h-20"
                          ></div>
                        ))}
                      </div>
                    ) : filteredPeople.length > 0 ? (
                      <div className="space-y-4">
                        {filteredPeople.map((person) => (
                          <div
                            key={person.id}
                            className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <Avatar className="w-12 h-12 border-2 border-white rounded-full mr-4">
                                <AvatarImage src={person.avatar} />
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold">{person.name}</h3>
                                  {person.isFriend && (
                                    <Badge className="ml-2 bg-pastel-green text-black">
                                      <UserCheck className="w-3 h-3 mr-1" />
                                      Friend
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {person.mutualFriends > 0
                                    ? `${person.mutualFriends} mutual friends`
                                    : "No mutual friends"}
                                </p>
                              </div>
                            </div>

                            {!person.isFriend && (
                              <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Friend
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-bold mb-2">No people found</h3>
                        <p className="text-gray-500 mb-4">Try a different search term</p>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!searchQuery && (
            <Card className="rounded-bubble p-6 mt-6">
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold mb-2">Search for anything</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Find courses, people, and more by typing in the search box above
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

