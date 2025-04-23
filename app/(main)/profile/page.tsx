"use client"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Settings, BookOpen, Award, Users, Clock, Calendar, Star, Sparkles, Zap, Trophy } from "lucide-react"

export default function ProfilePage() {
  // Mock user data
  const userData = {
    name: "Alex Johnson",
    username: "alexj",
    avatar: "/placeholder.svg?height=200&width=200",
    email: "alex.johnson@example.com",
    bio: "Passionate learner and technology enthusiast. Always looking to expand my knowledge and skills.",
    joinDate: "January 2023",
    stats: {
      coursesCompleted: 12,
      coursesInProgress: 3,
      totalLearningTime: "86h 45m",
      streak: 28,
      points: 24680,
      rank: 8,
      friends: 14,
    },
    badges: [
      { name: "Streak Master", icon: <Zap className="w-4 h-4" />, color: "bg-pastel-yellow" },
      { name: "Quiz Champion", icon: <Star className="w-4 h-4" />, color: "bg-pastel-green" },
      { name: "Early Adopter", icon: <Sparkles className="w-4 h-4" />, color: "bg-pastel-purple" },
      { name: "Dedicated Learner", icon: <BookOpen className="w-4 h-4" />, color: "bg-pastel-pink" },
      { name: "Helpful Peer", icon: <Users className="w-4 h-4" />, color: "bg-pastel-yellow" },
      { name: "Top 10%", icon: <Trophy className="w-4 h-4" />, color: "bg-pastel-green" },
    ],
    categories: {
      technology: 85,
      science: 62,
      business: 78,
      languages: 45,
      arts: 30,
    },
  }

  // Mock courses data
  const currentCourses = [
    {
      title: "Advanced JavaScript",
      description: "Master modern JavaScript concepts and patterns",
      progress: 75,
      duration: "2h 15min",
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Intermediate",
    },
    {
      title: "Data Science Fundamentals",
      description: "Learn the basics of data analysis and visualization",
      progress: 45,
      duration: "3h 30min",
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Beginner",
    },
    {
      title: "UX Design Principles",
      description: "Create user-centered designs with proven methodologies",
      progress: 20,
      duration: "1h 45min",
      image: "/placeholder.svg?height=200&width=300",
      difficulty: "Advanced",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        {/* Hero Section with Profile Info */}
        <div className="relative mb-12">
          {/* Background gradient banner */}
          <div className="absolute inset-0 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/3 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
          </div>

          <div className="relative pt-8 px-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar - larger and more prominent */}
              <Avatar className="w-32 h-32 border-4 border-white rounded-full shadow-xl">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left text-white pb-4">
                <h1 className="text-4xl font-bold">{userData.name}</h1>
                <p className="text-gray-300">@{userData.username}</p>
                <p className="mt-2 text-gray-300 max-w-xl">{userData.bio}</p>
              </div>

              <div className="pb-4">
                <Link href="/profile/settings">
                  <Button
                    variant="outline"
                    className="rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats cards - positioned to overlap the banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="rounded-2xl p-4 border-none shadow-md bg-white backdrop-blur-sm transform hover:scale-105 transition-all">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-pastel-yellow mb-2">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">{userData.stats.coursesCompleted}</span>
                  <span className="text-sm text-gray-500">Courses Completed</span>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 border-none shadow-md bg-white backdrop-blur-sm transform hover:scale-105 transition-all">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-pastel-green mb-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">{userData.stats.streak}</span>
                  <span className="text-sm text-gray-500">Day Streak</span>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 border-none shadow-md bg-white backdrop-blur-sm transform hover:scale-105 transition-all">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-pastel-purple mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">#{userData.stats.rank}</span>
                  <span className="text-sm text-gray-500">Global Rank</span>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 border-none shadow-md bg-white backdrop-blur-sm transform hover:scale-105 transition-all">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-pastel-pink mb-2">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">{userData.stats.totalLearningTime.split(" ")[0]}</span>
                  <span className="text-sm text-gray-500">Hours Learned</span>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Wider */}
          <div className="md:col-span-2 space-y-8">
            {/* Current Courses */}
            <Card className="rounded-2xl overflow-hidden border-none shadow-md">
              <div className="bg-white p-6 border-b">
                <h2 className="text-xl font-bold text-black flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Current Courses
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {currentCourses.map((course, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={course.image || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{course.title}</h3>
                          <Badge
                            className={`
                              ${
                                course.difficulty === "Beginner"
                                  ? "bg-pastel-green"
                                  : course.difficulty === "Intermediate"
                                    ? "bg-pastel-yellow"
                                    : "bg-pastel-purple"
                              } 
                              text-black text-xs`}
                          >
                            {course.difficulty}
                          </Badge>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.duration}
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{course.progress}% complete</span>
                          </div>
                          <Progress
                            value={course.progress}
                            className="h-1.5 rounded-full bg-gray-100"
                            indicatorClassName={
                              course.difficulty === "Beginner"
                                ? "bg-pastel-green"
                                : course.difficulty === "Intermediate"
                                  ? "bg-pastel-yellow"
                                  : "bg-pastel-purple"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6 rounded-full">View All Courses</Button>
              </div>
            </Card>

            {/* Learning Progress */}
            <Card className="rounded-2xl overflow-hidden border-none shadow-md">
              <div className="bg-white p-6 border-b">
                <h2 className="text-xl font-bold text-black flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Learning Progress
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(userData.categories).map(([category, progress]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="capitalize font-medium">{category}</span>
                        <span className="text-sm font-bold">{progress}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2 rounded-full bg-gray-100"
                        indicatorClassName={
                          category === "technology"
                            ? "bg-pastel-green"
                            : category === "science"
                              ? "bg-pastel-purple"
                              : category === "business"
                                ? "bg-pastel-yellow"
                                : category === "languages"
                                  ? "bg-pastel-pink"
                                  : "bg-pastel-blue"
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Narrower */}
          <div className="space-y-8">
            {/* Badges */}
            <Card className="rounded-2xl overflow-hidden border-none shadow-md">
              <div className="bg-white p-6 border-b">
                <h2 className="text-xl font-bold text-black flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Achievements
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {userData.badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`${badge.color} p-3 rounded-xl text-center transform hover:scale-105 transition-all`}
                    >
                      <div className="bg-white p-2 rounded-full inline-block mb-2 shadow-sm">{badge.icon}</div>
                      <h3 className="text-xs font-bold">{badge.name}</h3>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-6 rounded-full">
                  View All Badges
                </Button>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="rounded-2xl overflow-hidden border-none shadow-md">
              <div className="bg-white p-6 border-b">
                <h2 className="text-xl font-bold text-black flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Account Info
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pastel-yellow">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">{userData.joinDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pastel-green">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Friends</p>
                      <p className="font-medium">{userData.stats.friends} connections</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pastel-purple">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Points</p>
                      <p className="font-medium">{userData.stats.points.toLocaleString()} XP</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4">
                  <Link href="/profile/settings">
                    <Button className="w-full rounded-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

