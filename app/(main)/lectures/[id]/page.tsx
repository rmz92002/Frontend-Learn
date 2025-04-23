"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
// Add these imports at the top with the other imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

// Mock data for lectures
const lecturesData = [
  {
    id: "1",
    title: "Introduction to JavaScript",
    description:
      "Learn the basics of JavaScript programming language including variables, data types, functions, and control structures. This lecture provides a solid foundation for beginners.",
    content:
      "JavaScript is a programming language that enables interactive web pages. It is an essential part of web applications, and nearly all web browsers have a dedicated JavaScript engine to execute it.",
    duration: 45,
    category: "Programming",
    author: "John Doe",
    date: "2023-04-15",
    image: "/placeholder.svg?height=400&width=800",
    likes: 124,
    comments: 18,
    courseId: "web-development",
    courseName: "Web Development Fundamentals",
    progress: 65, // Added progress
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description:
      "Explore advanced patterns and techniques in React including render props, higher-order components, and hooks. This lecture is designed for developers with React experience.",
    content:
      "React design patterns help you create more maintainable and scalable applications. This lecture covers compound components, controlled components, and state reducers.",
    duration: 60,
    category: "Web Development",
    author: "Jane Smith",
    date: "2023-05-20",
    image: "/placeholder.svg?height=400&width=800",
    likes: 89,
    comments: 12,
    courseId: "advanced-react",
    courseName: "Advanced React Development",
    progress: 30, // Added progress
  },
]

// Get related lectures based on category
const getRelatedLectures = (currentLecture: any) => {
  return lecturesData
    .filter((lecture) => lecture.id !== currentLecture.id && lecture.category === currentLecture.category)
    .slice(0, 3)
}

export default function LectureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lectureId = params.id as string

  // Add state for button interactions
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [shareAnimation, setShareAnimation] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
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
      text: "This lecture was incredibly helpful! I especially liked the practical examples that were provided.",
      date: "2 days ago",
      likes: 12,
    },
    {
      id: 2,
      author: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "MC",
      },
      text: "Great explanation of complex concepts. Would love to see more content like this in the future.",
      date: "1 week ago",
      likes: 8,
    },
    {
      id: 3,
      author: {
        name: "Alex Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "AR",
      },
      text: "I had a question about the implementation discussed at 12:45. Is there a way to optimize that approach for larger datasets?",
      date: "2 weeks ago",
      likes: 3,
    },
  ])

  // Find the lecture with the matching ID
  const lecture = lecturesData.find((l) => l.id === lectureId)

  useEffect(() => {
    if (lecture) {
      setLikeCount(lecture.likes)
    }
  }, [lecture])

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

  // Add this new function after handleLikeClick
  const handleCopyLink = () => {
    // Create a URL to share (in a real app, this would be the actual URL)
    const shareUrl = `${window.location.origin}/lectures/${lecture.id}`

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

  const handleLikeClick = () => {
    if (!isLiked) {
      setLikeCount(likeCount + 1)
    } else {
      setLikeCount(likeCount - 1)
    }
    setIsLiked(!isLiked)
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

  // If lecture not found, show error
  if (!lecture) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Lecture not found</h1>
        <p className="mb-8">The lecture you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/lectures")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lectures
        </Button>
      </div>
    )
  }

  const relatedLectures = getRelatedLectures(lecture)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <Link href="/lectures" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Lectures
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{lecture.title}</h1>
              <p className="text-gray-600 mb-6">{lecture.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{lecture.duration} minutes</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{lecture.author}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(lecture.date).toLocaleDateString()}</span>
                </div>
              </div>

              {lecture.courseId && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">This lecture is part of the course:</p>
                  <Link href={`/courses/${lecture.courseId}`} className="font-medium text-blue-600 hover:underline">
                    {lecture.courseName}
                  </Link>
                </div>
              )}

              <Button
                className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg shadow-md hover:shadow-lg transition-all"
                onClick={() => router.push(`/lectures/${lecture.id}/learn`)}
              >
                <Play className="w-5 h-5 mr-2" />
                Learn Now
              </Button>
            </div>

            <div className="md:w-1/3 flex flex-col">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold mb-4">About this Lecture</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Badge className="bg-blue-100 text-blue-800">{lecture.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{lecture.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="font-medium">{new Date(lecture.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                {/* Progress indicator */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-medium">{lecture.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${lecture.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className={`flex items-center w-full ${isSaved ? "bg-blue-50 border-blue-200" : ""}`}
                      onClick={handleSaveClick}
                    >
                      <motion.div animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                        <BookmarkPlus className={`mr-2 h-4 w-4 ${isSaved ? "fill-blue-500 text-blue-500" : ""}`} />
                      </motion.div>
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="flex-1"
                  >
                    <Button variant="outline" className="flex items-center w-full" onClick={handleShareClick}>
                      <motion.div animate={{ rotate: shareAnimation ? [0, -45, 0] : 0 }} transition={{ duration: 0.5 }}>
                        <Share2 className="mr-2 h-4 w-4" />
                      </motion.div>
                      Share
                    </Button>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className={`flex items-center w-full ${isLiked ? "bg-red-50 border-red-200" : ""}`}
                      onClick={handleLikeClick}
                    >
                      <motion.div animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                        <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      </motion.div>
                      Like ({likeCount})
                    </Button>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="flex items-center w-full"
                      onClick={() => setCommentsOpen(true)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Comment ({lecture.comments})
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Related Lectures</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedLectures.map((relatedLecture) => (
              <Link href={`/lectures/${relatedLecture.id}`} key={relatedLecture.id}>
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
                  <div className="relative">
                    <img
                      src={relatedLecture.image || "/placeholder.svg"}
                      alt={relatedLecture.title}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <Badge className="bg-blue-100 text-blue-800">{relatedLecture.category}</Badge>
                      <span className="text-xs text-gray-500">{relatedLecture.duration} min</span>
                    </div>

                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{relatedLecture.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{relatedLecture.description}</p>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{relatedLecture.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(relatedLecture.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
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
              <h3 className="text-xl font-bold">Share this lecture</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={closeSharePopup}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">Share "{lecture.title}" with your friends and colleagues</p>

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
                    {`${window.location.origin}/lectures/${lecture.id}`}
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
  )
}

