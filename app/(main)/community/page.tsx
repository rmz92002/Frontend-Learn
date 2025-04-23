"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Clock, BookOpen, Calendar, X, Heart, MessageSquare, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Color mapping for progress bars
const colorMap = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  yellow: "bg-yellow-500",
  indigo: "bg-indigo-500",
  red: "bg-red-500",
}

// Mock data for community content
const communityData = {
  courses: [
    {
      id: "1",
      title: "Machine Learning for Beginners",
      description: "A comprehensive introduction to machine learning concepts and techniques",
      image: "/placeholder.svg?height=200&width=300",
      category: "Data Science",
      author: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "alexj",
      },
      stats: {
        likes: 245,
        comments: 32,
        shares: 18,
      },
      date: "2023-06-15",
      color: "blue",
      type: "course",
      lectures: 12,
      duration: 480,
      students: 1245,
    },
    {
      id: "2",
      title: "Modern Web Development",
      description: "Learn to build responsive and dynamic websites with modern frameworks",
      image: "/placeholder.svg?height=200&width=300",
      category: "Web Development",
      author: {
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "sarahm",
      },
      stats: {
        likes: 189,
        comments: 24,
        shares: 15,
      },
      date: "2023-07-02",
      color: "purple",
      type: "course",
      lectures: 8,
      duration: 320,
      students: 876,
    },
    {
      id: "3",
      title: "Digital Marketing Essentials",
      description: "Master the fundamentals of digital marketing and grow your online presence",
      image: "/placeholder.svg?height=200&width=300",
      category: "Marketing",
      author: {
        name: "Michael Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "michaelb",
      },
      stats: {
        likes: 156,
        comments: 18,
        shares: 12,
      },
      date: "2023-05-20",
      color: "green",
      type: "course",
      lectures: 10,
      duration: 360,
      students: 654,
    },
  ],
  lectures: [
    {
      id: "1",
      title: "Understanding Neural Networks",
      description: "A deep dive into how neural networks function and their applications",
      image: "/placeholder.svg?height=200&width=300",
      category: "AI",
      author: {
        name: "Emily Davis",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "emilyd",
      },
      stats: {
        likes: 178,
        comments: 26,
        shares: 14,
      },
      date: "2023-07-10",
      color: "pink",
      type: "lecture",
      duration: 45,
    },
    {
      id: "2",
      title: "Advanced CSS Techniques",
      description: "Master complex CSS layouts and animations for modern web design",
      image: "/placeholder.svg?height=200&width=300",
      category: "Web Development",
      author: {
        name: "David Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "davidw",
      },
      stats: {
        likes: 132,
        comments: 19,
        shares: 8,
      },
      date: "2023-06-28",
      color: "indigo",
      type: "lecture",
      duration: 35,
    },
    {
      id: "3",
      title: "Financial Planning Basics",
      description: "Learn essential strategies for personal financial planning and investment",
      image: "/placeholder.svg?height=200&width=300",
      category: "Finance",
      author: {
        name: "Jessica Taylor",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "jessicat",
      },
      stats: {
        likes: 98,
        comments: 12,
        shares: 5,
      },
      date: "2023-07-05",
      color: "yellow",
      type: "lecture",
      duration: 40,
    },
    {
      id: "4",
      title: "Introduction to Blockchain",
      description: "Understand the fundamentals of blockchain technology and cryptocurrencies",
      image: "/placeholder.svg?height=200&width=300",
      category: "Technology",
      author: {
        name: "Ryan Martinez",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "ryanm",
      },
      stats: {
        likes: 145,
        comments: 22,
        shares: 11,
      },
      date: "2023-06-20",
      color: "orange",
      type: "lecture",
      duration: 50,
    },
  ],
  trending: [
    {
      id: "1",
      title: "Data Visualization with Python",
      description: "Learn to create compelling data visualizations using Python libraries",
      image: "/placeholder.svg?height=200&width=300",
      category: "Data Science",
      author: {
        name: "Chris Anderson",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "chrisa",
      },
      stats: {
        likes: 312,
        comments: 45,
        shares: 28,
      },
      date: "2023-07-08",
      color: "blue",
      type: "course",
      lectures: 8,
      duration: 320,
      students: 1876,
    },
    {
      id: "2",
      title: "Public Speaking Mastery",
      description: "Overcome fear and deliver powerful presentations with confidence",
      image: "/placeholder.svg?height=200&width=300",
      category: "Personal Development",
      author: {
        name: "Lisa Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "lisaj",
      },
      stats: {
        likes: 287,
        comments: 38,
        shares: 22,
      },
      date: "2023-07-01",
      color: "green",
      type: "lecture",
      duration: 55,
    },
  ],
}

// All available categories from the data
const allCategories = Array.from(
  new Set([
    ...communityData.courses.map((item) => item.category),
    ...communityData.lectures.map((item) => item.category),
  ]),
)

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Get filtered content based on active tab, search query, and selected categories
  const getFilteredContent = () => {
    let content = []

    if (activeTab === "all") {
      content = [...communityData.courses, ...communityData.lectures]
    } else if (activeTab === "courses") {
      content = [...communityData.courses]
    } else if (activeTab === "lectures") {
      content = [...communityData.lectures]
    } else if (activeTab === "trending") {
      content = [...communityData.trending]
    }

    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category)

      return matchesSearch && matchesCategory
    })
  }

  const filteredContent = getFilteredContent()

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-gray-600">Discover courses and lectures shared by our community</p>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search community content..."
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

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              <Card
                key={item.id}
                className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              >
                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`${
                        item.type === "course" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      } px-2 py-1 text-xs font-medium rounded-full`}
                    >
                      {item.type === "course" ? "Course" : "Lecture"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Author info */}
                  <div className="flex items-center mb-3">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={item.author.avatar} alt={item.author.name} />
                      <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700 font-medium">{item.author.name}</span>
                    <span className="text-sm text-gray-500 ml-1">@{item.author.username}</span>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{item.category}</Badge>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{item.type === "course" ? formatDuration(item.duration) : `${item.duration} min`}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                  {/* Additional info for courses */}
                  {item.type === "course" && (
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{item.lectures} lectures</span>
                      <span>{item.students} students</span>
                    </div>
                  )}

                  {/* Engagement stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span>{item.stats.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span>{item.stats.comments}</span>
                      </div>
                      <div className="flex items-center">
                        <Share2 className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span>{item.stats.shares}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No content found</h3>
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

