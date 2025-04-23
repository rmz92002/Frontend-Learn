"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Users, Calendar, ChevronDown, Star, Clock, BookOpen, Award, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function LeaderboardPage() {
  // Add filter states
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [timeFrame, setTimeFrame] = useState<string>("monthly")
  const [showFriendsOnly, setShowFriendsOnly] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const leaderboardData = [
    {
      id: 1,
      name: "Kameron Porter",
      avatar: "/placeholder.svg?height=100&width=100",
      completedPercentage: 100,
      score: 180900,
      position: 1,
      color: "pastel-yellow",
      isFriend: true,
      streak: 42,
      completedCourses: 8,
      badges: ["Expert", "Mentor", "Streak Master"],
      categories: {
        technology: 95,
        science: 88,
        business: 76,
      },
    },
    {
      id: 2,
      name: "Michael Kopfler",
      avatar: "/placeholder.svg?height=100&width=100",
      completedPercentage: 75,
      score: 145600,
      position: 2,
      color: "pastel-purple",
      isFriend: true,
      streak: 28,
      completedCourses: 6,
      badges: ["Fast Learner", "Quiz Master"],
      categories: {
        technology: 92,
        science: 65,
        business: 89,
      },
    },
    {
      id: 3,
      name: "Alice Koller",
      avatar: "/placeholder.svg?height=100&width=100",
      completedPercentage: 95,
      score: 132400,
      position: 3,
      color: "pastel-green",
      isFriend: true,
      streak: 35,
      completedCourses: 7,
      badges: ["Dedicated", "Consistent"],
      categories: {
        technology: 78,
        science: 94,
        business: 72,
      },
    },
    {
      id: 4,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      completedPercentage: 82,
      score: 128700,
      position: 4,
      color: "pastel-pink",
      isFriend: false,
      streak: 21,
      completedCourses: 5,
      badges: ["Rising Star"],
      categories: {
        technology: 85,
        science: 90,
        business: 65,
      },
    },
    {
      id: 5,
      name: "David Chen",
      avatar: "/placeholder.svg?height=100&width=100",
      completedPercentage: 68,
      score: 115200,
      position: 5,
      color: "pastel-yellow",
      isFriend: false,
      streak: 14,
      completedCourses: 4,
      badges: ["Newcomer"],
      categories: {
        technology: 91,
        science: 72,
        business: 84,
      },
    },
    {
      id: 6,
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=100&width=100",
      completedPercentage: 79,
      score: 109800,
      position: 6,
      color: "pastel-purple",
      isFriend: true,
      streak: 19,
      completedCourses: 5,
      badges: ["Enthusiast"],
      categories: {
        technology: 75,
        science: 82,
        business: 91,
      },
    },
  ]

  // Current user data (for comparison)
  const currentUser = {
    id: 7,
    name: "You",
    avatar: "/placeholder.svg?height=100&width=100",
    completedPercentage: 72,
    score: 98500,
    position: 8,
    color: "pastel-green",
    streak: 16,
    completedCourses: 3,
    badges: ["Beginner"],
    categories: {
      technology: 82,
      science: 68,
      business: 75,
    },
  }

  const categories = ["All", "Technology", "Science", "Business", "Languages", "Arts"]
  const timeframes = ["Weekly", "Monthly", "All Time"]
  const badgeTypes = [
    "Expert",
    "Mentor",
    "Fast Learner",
    "Quiz Master",
    "Dedicated",
    "Consistent",
    "Rising Star",
    "Newcomer",
    "Enthusiast",
    "Beginner",
  ]

  // Apply filters to leaderboard data
  const filteredLeaderboardData = leaderboardData.filter((user) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!user.name.toLowerCase().includes(query)) {
        return false
      }
    }

    // Friends only filter
    if (showFriendsOnly && !user.isFriend) {
      return false
    }

    return true
  })

  // Count active filters
  const countActiveFilters = () => {
    let count = 0
    if (showFriendsOnly) count++
    return count
  }

  // Reset all filters
  const resetFilters = () => {
    setShowFriendsOnly(false)
    setActiveFilters([])
  }

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    if (filter === "Friends Only") {
      setShowFriendsOnly(false)
    }

    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  const updateActiveFilters = (filter: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter)
      } else {
        return [...prev, filter]
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <div className="rounded-bubble bg-black text-white p-8 relative overflow-hidden animate-float">
          {/* Decorative dots */}
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-dot-green opacity-30"></div>
          <div className="absolute bottom-4 left-8 w-2 h-2 rounded-full bg-dot-pink opacity-30"></div>
          <div className="absolute top-1/2 right-8 w-2 h-2 rounded-full bg-white opacity-30"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Leaderboard
              <Trophy className="w-8 h-8 text-yellow-400" />
            </h1>

            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full bg-white/10 text-white border-white/20">
                    <Calendar className="w-4 h-4 mr-2" />
                    {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem className="rounded-lg" onClick={() => setTimeFrame("weekly")}>
                    Weekly
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg" onClick={() => setTimeFrame("monthly")}>
                    Monthly
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg" onClick={() => setTimeFrame("all time")}>
                    All Time
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className={`rounded-full ${showFriendsOnly ? "bg-white/20" : "bg-white/10"} text-white border-white/20`}
                onClick={() => {
                  setShowFriendsOnly(!showFriendsOnly)
                  if (!showFriendsOnly) {
                    updateActiveFilters("Friends Only")
                  } else {
                    setActiveFilters((prev) => prev.filter((f) => f !== "Friends Only"))
                  }
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                Friends
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {activeFilters.map((filter) => (
              <Badge key={filter} className="rounded-full px-3 py-1 bg-black text-white flex items-center gap-1">
                {filter}
                <button className="ml-1 text-white hover:text-gray-200" onClick={() => removeFilter(filter)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </Badge>
            ))}
            <Button variant="ghost" className="text-sm h-7 rounded-full" onClick={resetFilters}>
              Clear All
            </Button>
          </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="md:w-3/4">
            <Card className="rounded-bubble p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Rankings</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 rounded-full w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Tabs defaultValue="All" className="w-full">
                <TabsList className="flex p-1 overflow-x-auto bg-white rounded-full border border-gray-100 shadow-sm mb-4">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="rounded-full px-4 py-2">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-0">
                    <div className="space-y-4">
                      {/* Current user card (highlighted) */}
                      <div className="bg-black/5 p-4 rounded-xl border-2 border-dashed border-black/20">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 text-center font-bold">#{currentUser.position}</div>
                          <Avatar className="w-12 h-12 border-2 border-white rounded-full">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <h3 className="font-bold">{currentUser.name}</h3>
                              <Badge className="ml-2 bg-pastel-purple text-black">You</Badge>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span>{currentUser.score.toLocaleString()} pts</span>
                              <span>{currentUser.completedPercentage}% completed</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-center px-3 py-1 rounded-full bg-pastel-yellow">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span className="font-bold">{currentUser.streak}</span>
                              </div>
                              <div className="text-xs">Streak</div>
                            </div>
                            <div className="text-center px-3 py-1 rounded-full bg-pastel-green">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-bold">{currentUser.completedCourses}</span>
                              </div>
                              <div className="text-xs">Courses</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Leaderboard entries */}
                      {filteredLeaderboardData
                        .filter(
                          (user) =>
                            category === "All" || (user.categories && user.categories[category.toLowerCase()] > 0),
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            className={`p-4 rounded-xl ${user.isFriend ? "bg-pastel-green/20" : "bg-white"}`}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-12 text-center font-bold">
                                {user.position === 1 ? (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-400 rounded-full">
                                    <Trophy className="w-4 h-4 text-black" />
                                  </div>
                                ) : (
                                  `#${user.position}`
                                )}
                              </div>
                              <Avatar
                                className={`w-12 h-12 border-2 border-white rounded-full ${user.position === 1 ? "ring-2 ring-yellow-400" : ""}`}
                              >
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-4 flex-1">
                                <div className="flex items-center">
                                  <h3 className="font-bold">{user.name}</h3>
                                  {user.isFriend && <Badge className="ml-2 bg-pastel-green text-black">Friend</Badge>}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-4">
                                  <span>{user.score.toLocaleString()} pts</span>
                                  <span>{user.completedPercentage}% completed</span>
                                  {category !== "All" && user.categories && (
                                    <span className="font-medium">
                                      {category}: {user.categories[category.toLowerCase()]}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-center px-3 py-1 rounded-full bg-pastel-yellow">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    <span className="font-bold">{user.streak}</span>
                                  </div>
                                  <div className="text-xs">Streak</div>
                                </div>
                                <div className="text-center px-3 py-1 rounded-full bg-pastel-green">
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="font-bold">{user.completedCourses}</span>
                                  </div>
                                  <div className="text-xs">Courses</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* No results message */}
                      {filteredLeaderboardData.filter(
                        (user) =>
                          category === "All" || (user.categories && user.categories[category.toLowerCase()] > 0),
                      ).length === 0 && (
                        <div className="text-center py-12">
                          <h3 className="text-xl font-bold mb-2">No users match your filters</h3>
                          <p className="text-gray-500 mb-4">Try adjusting your filter criteria</p>
                          <Button variant="outline" className="rounded-full" onClick={resetFilters}>
                            Reset Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          </div>

          <div className="md:w-1/4">
            <Card className="rounded-bubble p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Your Stats</h2>
              <div className="space-y-4">
                <div className="bg-pastel-yellow p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      <span className="font-medium">Rank</span>
                    </div>
                    <span className="text-xl font-bold">#{currentUser.position}</span>
                  </div>
                </div>

                <div className="bg-pastel-green p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      <span className="font-medium">Streak</span>
                    </div>
                    <span className="text-xl font-bold">{currentUser.streak} days</span>
                  </div>
                </div>

                <div className="bg-pastel-purple p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      <span className="font-medium">Courses</span>
                    </div>
                    <span className="text-xl font-bold">{currentUser.completedCourses}</span>
                  </div>
                </div>

                <div className="bg-pastel-pink p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium">Learning Time</span>
                    </div>
                    <span className="text-xl font-bold">28h 35m</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-3">Your Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.badges.map((badge, index) => (
                    <Badge key={index} className="bg-black text-white">
                      <Award className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-3">Category Performance</h3>
                {Object.entries(currentUser.categories).map(([category, score]) => (
                  <div key={category} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{category}</span>
                      <span>{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          category === "technology"
                            ? "bg-dot-green"
                            : category === "science"
                              ? "bg-dot-purple"
                              : "bg-dot-yellow"
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6 rounded-full bg-black text-white hover:bg-gray-800">
                <Users className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

