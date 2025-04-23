"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
// Import additional icons for sharing options
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  BookmarkPlus,
  Share2,
  ThumbsUp,
  MessageSquare,
  Play,
  Copy,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Check,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"

// Add these imports at the top with the other imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

// Replace the existing component with this updated version that includes animations
export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const courseTitle = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Add state for button interactions
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [shareAnimation, setShareAnimation] = useState(false)
  const [likeCount, setLikeCount] = useState(156)

  // Add sharePopupOpen state after the other state declarations
  const [sharePopupOpen, setSharePopupOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Add this to the state declarations after the other state variables
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState([
    {
      id: 1,
      author: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "SJ",
      },
      text: "This course has been transformative for my learning journey. The instructor explains complex topics in a way that's easy to understand.",
      date: "3 days ago",
      likes: 15,
    },
    {
      id: 2,
      author: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "MC",
      },
      text: "I've taken several courses on this subject, but this one stands out for its practical approach and comprehensive coverage.",
      date: "1 week ago",
      likes: 9,
    },
    {
      id: 3,
      author: {
        name: "Alex Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "AR",
      },
      text: "Would love to see more advanced content in future updates. Overall, a great foundation for beginners.",
      date: "2 weeks ago",
      likes: 7,
    },
  ])

  // Mock course data
  const course = {
    id: params.slug,
    title: courseTitle,
    description:
      "Learn everything you need to know about this fascinating subject with our comprehensive course. Perfect for beginners and advanced learners alike.",
    instructor: {
      name: "Dr. Jane Smith",
      avatar: "/placeholder.svg?height=48&width=48",
      initials: "JS",
      title: "Professor of Advanced Studies",
    },
    duration: "12 hours",
    rating: 4.8,
    reviews: 342,
    students: 1245,
    progress: 35,
    lastUpdated: "March 2023",
    category: "Technology",
    level: "Intermediate",
    categoryColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
    likes: 156,
    comments: 24,
  }

  // Handle button clicks with animations
  const handleSaveClick = () => {
    setIsSaved(!isSaved)
  }

  // Replace the handleShareClick function with this updated version
  const handleShareClick = () => {
    setShareAnimation(true)
    setTimeout(() => setShareAnimation(false), 500)
    setSharePopupOpen(true)
  }

  const handleLikeClick = () => {
    if (!isLiked) {
      setLikeCount(likeCount + 1)
    } else {
      setLikeCount(likeCount - 1)
    }
    setIsLiked(!isLiked)
  }

  // Add this new function after handleLikeClick
  const handleCopyLink = () => {
    // Create a URL to share (in a real app, this would be the actual URL)
    const shareUrl = `${window.location.origin}/courses/${course.id}`

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  // Add this new function to close the share popup
  const closeSharePopup = () => {
    setSharePopupOpen(false)
  }

  // Add this function after the other handler functions
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    // Add new comment to the list
    const newComment = {
      id: comments.length + 1,
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "YO",
      },
      text: commentText,
      date: "Just now",
      likes: 0,
    }

    setComments([newComment, ...comments])
    setCommentText("")
  }

  // Mock lectures data
  const lectures = [
    {
      id: "1",
      title: "Introduction to Basics",
      description: "Learn the fundamental concepts and principles that form the foundation of this subject.",
      duration: "45 min",
      progress: 100,
      category: "Fundamentals",
      categoryColor: "bg-gradient-to-r from-green-500 to-emerald-600",
      image: "/placeholder.svg?height=200&width=350",
    },
    {
      id: "2",
      title: "Core Principles",
      description: "Dive deeper into the core principles and understand how they apply to real-world scenarios.",
      duration: "1 hour",
      progress: 75,
      category: "Principles",
      categoryColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
      image: "/placeholder.svg?height=200&width=350",
    },
    {
      id: "3",
      title: "Advanced Techniques",
      description: "Master advanced techniques and methodologies used by professionals in the field.",
      duration: "1.5 hours",
      progress: 30,
      category: "Advanced",
      categoryColor: "bg-gradient-to-r from-purple-500 to-pink-600",
      image: "/placeholder.svg?height=200&width=350",
    },
    {
      id: "4",
      title: "Practical Applications",
      description: "Apply your knowledge to practical scenarios and build real-world solutions.",
      duration: "2 hours",
      progress: 0,
      category: "Practical",
      categoryColor: "bg-gradient-to-r from-orange-500 to-red-600",
      image: "/placeholder.svg?height=200&width=350",
    },
    {
      id: "5",
      title: "Case Studies & Examples",
      description: "Analyze real-world case studies and examples to deepen your understanding.",
      duration: "1.5 hours",
      progress: 0,
      category: "Case Studies",
      categoryColor: "bg-gradient-to-r from-yellow-500 to-amber-600",
      image: "/placeholder.svg?height=200&width=350",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <Link href="/courses" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Courses
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{course.instructor.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Last updated: {course.lastUpdated}</span>
                </div>
              </div>

              {course.id && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">This course contains {lectures.length} lectures</p>
                  <p className="font-medium text-blue-600">
                    {lectures.filter((l) => l.progress === 100).length} completed •{" "}
                    {lectures.filter((l) => l.progress > 0 && l.progress < 100).length} in progress
                  </p>
                </div>
              )}

              <Button
                className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg shadow-md hover:shadow-lg transition-all"
                onClick={() => (window.location.href = `/courses/${course.id}/learn`)}
              >
                <Play className="w-5 h-5 mr-2" />
                Continue Learning
              </Button>
            </div>

            <div className="md:w-1/3 flex flex-col">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">About this Course</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Badge className="bg-blue-100 text-blue-800">{course.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{course.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{course.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Your Progress */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2 rounded-full bg-gray-100" />
              </div>

              {/* Action buttons in a row with animations */}
              <div className="grid grid-cols-2 gap-2">
                <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                  <Button
                    variant="outline"
                    className={`rounded-full flex items-center justify-center w-full ${isSaved ? "bg-blue-50 border-blue-200" : ""}`}
                    onClick={handleSaveClick}
                  >
                    <motion.div animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                      <BookmarkPlus className={`mr-2 h-4 w-4 ${isSaved ? "fill-blue-500 text-blue-500" : ""}`} />
                    </motion.div>
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                  <Button
                    variant="outline"
                    className="rounded-full flex items-center justify-center w-full"
                    onClick={handleShareClick}
                  >
                    <motion.div animate={{ rotate: shareAnimation ? [0, -45, 0] : 0 }} transition={{ duration: 0.5 }}>
                      <Share2 className="mr-2 h-4 w-4" />
                    </motion.div>
                    Share
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                  <Button
                    variant="outline"
                    className={`rounded-full flex items-center justify-center w-full ${isLiked ? "bg-red-50 border-red-200" : ""}`}
                    onClick={handleLikeClick}
                  >
                    <motion.div animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                      <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </motion.div>
                    Like ({likeCount})
                  </Button>
                </motion.div>

                {/* Replace the Comment button with this updated version */}
                <Button
                  variant="outline"
                  className="rounded-full flex items-center justify-center"
                  onClick={() => setCommentsOpen(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Comment ({course.comments})
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Course Lectures</h2>

          <div className="space-y-4">
            {lectures.map((lecture, index) => (
              <Link href={`/lectures/${lecture.id}`} key={lecture.id}>
                <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row gap-4 my-4">
                  <div className="md:w-1/4 aspect-video rounded-lg overflow-hidden">
                    <img
                      src={lecture.image || "/placeholder.svg"}
                      alt={lecture.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge className="bg-blue-100 text-blue-800 mb-2">{lecture.category}</Badge>
                        <h3 className="text-lg font-bold">
                          {index + 1}. {lecture.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">{lecture.duration}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{lecture.description}</p>

                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">
                          {lecture.progress === 100 ? (
                            <span className="text-green-600">Completed</span>
                          ) : lecture.progress > 0 ? (
                            `${lecture.progress}% complete`
                          ) : (
                            "Not started"
                          )}
                        </span>
                      </div>
                      <Progress value={lecture.progress} className="h-2 rounded-full bg-gray-100" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* Share Popup */}
        {sharePopupOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeSharePopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Share this course</h3>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={closeSharePopup}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">Share "{course.title}" with your friends and colleagues</p>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                    <Mail className="h-6 w-6 mb-1 text-gray-700" />
                    <span className="text-xs">Email</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                    <Twitter className="h-6 w-6 mb-1 text-blue-400" />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                    <Facebook className="h-6 w-6 mb-1 text-blue-600" />
                    <span className="text-xs">Facebook</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                    <Linkedin className="h-6 w-6 mb-1 text-blue-700" />
                    <span className="text-xs">LinkedIn</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="flex items-center border rounded-full overflow-hidden bg-gray-50">
                    <div className="flex-1 px-4 py-2 text-sm truncate">
                      {`${window.location.origin}/courses/${course.id}`}
                    </div>
                    <Button
                      variant="ghost"
                      className={`rounded-full h-full px-4 ${linkCopied ? "bg-green-100 text-green-700" : ""}`}
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {linkCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>

              <Button className="w-full rounded-full bg-black text-white hover:bg-gray-800" onClick={closeSharePopup}>
                Done
              </Button>
            </motion.div>
          </div>
        )}
        {/* Comments Section */}
        {commentsOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCommentsOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white rounded-xl max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => setCommentsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 border-b">
                <form onSubmit={handleCommentSubmit} className="flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>YO</AvatarFallback>
                    </Avatar>
                    <Textarea
                      placeholder="Add a comment..."
                      className="flex-1 resize-none"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="rounded-full bg-black text-white hover:bg-gray-800"
                      disabled={!commentText.trim()}
                    >
                      Post Comment
                    </Button>
                  </div>
                </form>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3"
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.text}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-gray-700">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="hover:text-gray-700">Reply</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

