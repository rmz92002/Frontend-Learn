"use client"

import React, { useState, useEffect, useRef } from "react"

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
import { motion } from "framer-motion"
// Add these imports at the top with the other imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "@tanstack/react-query"
import { getLectureById, likeLecture, saveLecture, getLectureComments, createLectureComment, getCommentReplies, likeComment } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentUser } from "@/hooks/use-current-user"

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
  // Replace userId state and getCurrentUser with useCurrentUser
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const userId = user?.profile?.id ?? null
  // Add sharePopupOpen state after the other state declarations
  const [sharePopupOpen, setSharePopupOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  // Add this to the state declarations after the other state variables
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState("")
  
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsPage, setCommentsPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [loadingMoreComments, setLoadingMoreComments] = useState(false)
  const commentsPageSize = 10
  const commentsContainerRef = useRef<HTMLDivElement>(null)

  // New state for replies loading and data
  const [repliesState, setRepliesState] = useState<{ [commentId: number]: { loading: boolean, replies: any[], visible: boolean } }>({})

  // Add state to track like loading for comments
  const [commentLikeLoading, setCommentLikeLoading] = useState<{ [commentId: number]: boolean }>({})

  // Find the lecture with the matching ID
  // const lecture = lecturesData.find((l) => l.id === lectureId)

  const { data : lectureData, isLoading } = useQuery({
    queryKey: ['GettingLecture', lectureId],
    queryFn: ({ signal }) => getLectureById(lectureId, signal),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  })

  // useEffect(() => {
  //   if (lecture) {
  //     setLikeCount(lecture.likes)
  //   }
  // }, [lecture])

  useEffect(() => {
    // Set initial like count from lectureData
    if (lectureData) {
      setIsSaved(lectureData.saved || false)
      setLikeCount(lectureData.likes || 0)
      setIsLiked(lectureData.liked || false)
    }
  }, [lectureData])

  // Fetch initial comments
  useEffect(() => {
    setCommentsLoading(true)
    setComments([])
    setCommentsPage(1)
    setHasMoreComments(true)
    getLectureComments(lectureId, 1, commentsPageSize, userId)
      .then((data) => {
        setComments(data)
        setHasMoreComments(data.length === commentsPageSize)
      })
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false))
  }, [lectureId, userId])

  // Load more comments when scrolling near bottom
  const handleCommentsScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (
      !loadingMoreComments &&
      hasMoreComments &&
      el.scrollHeight - el.scrollTop - el.clientHeight < 100
    ) {
      setLoadingMoreComments(true)
      const nextPage = commentsPage + 1
      try {
        const data = await getLectureComments(lectureId, nextPage, commentsPageSize, userId)
        setComments((prev) => [...prev, ...data])
        setCommentsPage(nextPage)
        setHasMoreComments(data.length === commentsPageSize)
      } catch {
        setHasMoreComments(false)
      } finally {
        setLoadingMoreComments(false)
      }
    }
  }

  // Handle button clicks with animations
  const handleSaveClick = async () => {
    if (!userId) {
      alert("You must be logged in to save a lecture.")
      return
    }
    try {
      const res = await saveLecture(lectureId, userId, !isSaved)
      setIsSaved(!isSaved)
    } catch (err) {
      alert("Failed to update saved status.")
    }
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
    const shareUrl = `${window.location.origin}/lectures/${lectureId}`

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

  const handleLikeClick = async () => {
    if (!userId) {
      alert("You must be logged in to like a lecture.")
      return
    }
    try {
      const res = await likeLecture(lectureId, userId, !isLiked)
      setIsLiked(res.liked)
      setLikeCount(res.likes)
    } catch (err) {
      alert("Failed to update like status.")
    }
  }

  // Add this function after the other handler functions
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !userId) return

    try {
      const newComment = await createLectureComment(lectureId, userId, commentText)
      setComments([newComment, ...comments])
      setCommentText("")
    } catch (err) {
      alert("Failed to post comment.")
    }
  }

  // New state for replying to comments
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")

  // New handler for submitting replies
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !userId || replyTo === null) return
    try {
      const newReply = await createLectureComment(lectureId, userId, replyText, replyTo)
      // Insert reply under the correct parent comment
      setComments((prev) => prev.map(comment =>
        comment.id === replyTo
          ? { ...comment, replies: comment.replies ? [newReply, ...comment.replies] : [newReply] }
          : comment
      ))
      setReplyText("")
      setReplyTo(null)
    } catch (err) {
      alert("Failed to post reply.")
    }
  }

  // Handler to toggle replies for a comment
  const handleToggleReplies = async (commentId: number) => {
    setRepliesState(prev => {
      const current = prev[commentId]
      // If already loaded and visible, just hide
      if (current && current.visible) {
        return { ...prev, [commentId]: { ...current, visible: false } }
      }
      // If already loaded but hidden, just show
      if (current && !current.visible) {
        return { ...prev, [commentId]: { ...current, visible: true } }
      }
      // Otherwise, set loading and visible
      return { ...prev, [commentId]: { loading: true, replies: [], visible: true } }
    })
    // Only fetch if not already loaded
    if (!repliesState[commentId]) {
      try {
        const data = await getCommentReplies(commentId, 1, 10)
        setRepliesState(prev => ({ ...prev, [commentId]: { loading: false, replies: data, visible: true } }))
      } catch {
        setRepliesState(prev => ({ ...prev, [commentId]: { loading: false, replies: [], visible: true } }))
      }
    }
  }

  // Handler for liking/unliking a comment
  const handleCommentLike = async (comment: any) => {
    if (!userId) {
      alert("You must be logged in to like a comment.")
      return
    }
    setCommentLikeLoading(prev => ({ ...prev, [comment.id]: true }))
    try {
      const res = await likeComment(comment.id, userId, !comment.liked)
      setComments(prev => prev.map(c =>
        c.id === comment.id
          ? { ...c, likes: res.likes, liked: res.liked }
          : c
      ))
    } catch (err) {
      alert("Failed to update like status.")
    } finally {
      setCommentLikeLoading(prev => ({ ...prev, [comment.id]: false }))
    }
  }

  // If lecture not found, show error
  if (isLoading) {
    return (
       <div className="bg-white rounded-xl shadow-sm p-8 mb-8 shadow-md border border-gray-200 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-5 w-3/4 mb-6" />
        <div className="flex flex-wrap gap-4 mb-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-16 w-full mb-6 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
      <div className="md:w-1/3 flex flex-col">
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-4 w-20 mb-2" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  </div>
    )
  }

  // const relatedLectures = getRelatedLectures(lecture)

  return (
    <div className="min-h-screen bg-gradient-to-b h-full ">
      <div className="container px-4 py-8 mx-auto">
        <Link href="/lectures" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Lectures
        </Link>
        {!lectureData? (
          <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Lecture not found</h1>
        <p className="mb-8">The lecture you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/lectures")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lectures
        </Button>
      </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8 shadow-md border border-gray-200 h-full">
          <div className="flex flex-col md:flex-row gap-8 ">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{lectureData.title}</h1>
              <p className="text-gray-600 mb-6">{lectureData.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{lectureData?.profile?.name ?? "Anonymous"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(lectureData?.date).toLocaleDateString()}</span>
                </div>
              </div>

              {lectureData?.course_id && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">This lecture is part of the course:</p>
                  <Link href={`/courses/${lectureData?.course_id}`} className="font-medium text-green-600 hover:underline">
                {lectureData?.course?.name}
                  </Link>
                </div>
              )}
            <div className="mt-auto h-full">
              <Button
                className="w-full rounded-full bg-gradient-to-r py-6 text-lg shadow-md hover:shadow-lg transition-all w-full rounded-full bg-green-500 text-white hover:bg-green-600"
                onClick={() => router.push(`/lectures/${lectureId}/learn`)}
              >
                Learn Now
              </Button>
              </div>
            
              
            </div>

            <div className="md:w-1/3 flex flex-col">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold mb-4">About this Lecture</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Badge className="bg-green-100 text-green-800">{lectureData?.category}</Badge>
                  </div>
                 
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="font-medium">{new Date(lectureData?.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                {/* Progress indicator */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-medium">{lectureData?.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${lectureData?.progress || 0}%` }}
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
                      className={`flex items-center w-full ${isSaved ? "bg-green-50 border-green-200" : ""}`}
                      onClick={handleSaveClick}
                    >
                      <motion.div animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                        <BookmarkPlus className={`mr-2 h-4 w-4 ${isSaved ? "fill-green-500 text-green-500" : ""}`} />
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
                      <motion.div animate={{ rotate: shareAnimation ? [0, -45,0] : 0 }} transition={{ duration: 0.5 }}>
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
                      Comment ({lectureData?.comment_count || 0})
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        

        {/* <div className="mb-8">
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
        </div> */}
      </div>
      {/* Share Popup */}
      {sharePopupOpen && (
        <div
          className="fixed inset-0 bg-green/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
              <p className="text-sm text-gray-500 mb-4">Share "{lectureData?.title}" with your friends and colleagues</p>

              <div className="grid grid-cols-4 gap-3 mb-6">
                <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                  <Mail className="h-6 w-6 mb-1 text-primary" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                  <Twitter className="h-6 w-6 mb-1 text-primary" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                  <Facebook className="h-6 w-6 mb-1 text-primary" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-3 h-auto">
                  <Linkedin className="h-6 w-6 mb-1 text-primary" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>

              <div className="relative">
                <div className="flex items-center border rounded-full overflow-hidden bg-gray-50">
                  <div className="flex-1 px-4 py-2 text-sm truncate">
                    {`${window.location.origin}/lectures/${lectureId}`}
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

            <Button className="w-full rounded-full bg-primary text-white hover:bg-gray-800" onClick={closeSharePopup}>
              Done
            </Button>
          </motion.div>
        </div>
      )}
      {/* Comments Section */}
      {commentsOpen && (
        <div
          className="fixed inset-0 bg-green/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                    className="rounded-full bg-primary text-white hover:bg-green-800"
                    disabled={!commentText.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              </form>
            </div>

            <div
              className="overflow-y-auto flex-1 p-6"
              ref={commentsContainerRef}
              onScroll={handleCommentsScroll}
            >
              {commentsLoading ? (
                <div className="text-center text-gray-400">Loading comments…</div>
              ) : (
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
                        <AvatarImage src={"/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback>{comment.profile_id}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {comment.profile_id ? `User ${comment.profile_id}` : "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button
                            className={`flex items-center gap-1 hover:text-gray-700 ${comment.liked ? 'text-green-600' : ''}`}
                            disabled={commentLikeLoading[comment.id]}
                            onClick={() => handleCommentLike(comment)}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${comment.liked ? 'fill-green-600 text-green-600' : ''}`} />
                            <span>{comment.likes ?? 0}</span>
                          </button>
                          <button className="hover:text-gray-700" onClick={() => setReplyTo(comment.id)}>Reply</button>
                          <button
                            className="hover:text-blue-700"
                            onClick={() => handleToggleReplies(comment.id)}
                          >
                            {repliesState[comment.id]?.visible ? "Hide Replies" : `Show ${comment.replies_count? comment.replies_count : 0} Replies`}
                          </button>
                        </div>
                        {/* Reply form */}
                        {replyTo === comment.id && (
                          <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
                            <Textarea
                              placeholder="Write a reply..."
                              className="flex-1 resize-none"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              rows={2}
                            />
                            <Button type="submit" className="rounded-full bg-primary text-white hover:bg-gray-800" disabled={!replyText.trim()}>
                              Reply
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => { setReplyTo(null); setReplyText("") }}>Cancel</Button>
                          </form>
                        )}
                        {/* Render replies if loaded and visible */}
                        {repliesState[comment.id]?.visible && (
                          <div className="ml-8 mt-4 space-y-4">
                            {repliesState[comment.id].loading ? (
                              <div className="text-gray-400">Loading replies…</div>
                            ) : (
                              repliesState[comment.id].replies.length > 0 ? (
                                repliesState[comment.id].replies.map((reply: any) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                      <AvatarImage src={"/placeholder.svg?height=40&width=40"} />
                                      <AvatarFallback>{reply.profile_id}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">User {reply.profile_id}</span>
                                        <span className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString()}</span>
                                      </div>
                                      <p className="text-gray-700 mb-2">{reply.content}</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-400">No replies yet.</div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {loadingMoreComments && (
                <div className="text-center text-gray-400 mt-4">Loading more comments…</div>
              )}
              {!hasMoreComments && comments.length > 0 && (
                <div className="text-center text-gray-400 mt-4">No more comments.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}