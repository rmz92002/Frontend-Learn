"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useCurrentUser } from "@/hooks/use-current-user"
import { 
    getLectureById, 
    likeLecture, 
    saveLecture, 
    getLectureComments, 
    createLectureComment, 
    getCommentReplies, 
    likeComment 
} from "@/lib/api"

// --- UI Components ---
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

// --- Icons ---
import {
  ArrowLeft, Clock, User, Calendar, BookmarkPlus, Share2,
  ThumbsUp, MessageSquare, Play, Copy, Mail, Twitter,
  Facebook, Linkedin, Check, X,
} from "lucide-react"

// --- Mock Data (for reference/fallback) ---
const lecturesData = [
  {
    id: "1",
    title: "Introduction to JavaScript",
    description: "Learn the basics of JavaScript programming language...",
    content: "JavaScript is a programming language...",
    duration: 45,
    category: "Programming",
    author: "John Doe",
    date: "2023-04-15",
    image: "/placeholder.svg?height=400&width=800",
    likes: 124,
    comments: 18,
    courseId: "web-development",
    courseName: "Web Development Fundamentals",
    progress: 65,
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Explore advanced patterns and techniques in React...",
    content: "React design patterns help you create more maintainable...",
    duration: 60,
    category: "Web Development",
    author: "Jane Smith",
    date: "2023-05-20",
    image: "/placeholder.svg?height=400&width=800",
    likes: 89,
    comments: 12,
    courseId: "advanced-react",
    courseName: "Advanced React Development",
    progress: 30,
  },
]

const getRelatedLectures = (currentLecture: any) => {
  return lecturesData
    .filter((lecture) => lecture.id !== currentLecture.id && lecture.category === currentLecture.category)
    .slice(0, 3)
}

// ============================================================================
// --- Lecture Detail Page Component ---
// ============================================================================
export default function LectureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lectureId = params.id as string
  const commentsContainerRef = useRef<HTMLDivElement>(null)

  // --- State Management ---
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)

  const [sharePopupOpen, setSharePopupOpen] = useState(false)
  const [shareAnimation, setShareAnimation] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentsPage, setCommentsPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [loadingMoreComments, setLoadingMoreComments] = useState(false)
  
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [repliesState, setRepliesState] = useState<{ [commentId: number]: { loading: boolean; replies: any[]; visible: boolean } }>({})
  const [commentLikeLoading, setCommentLikeLoading] = useState<{ [commentId: number]: boolean }>({})
  const commentsPageSize = 10

  // --- Data Fetching ---
  const { data: user } = useCurrentUser()
  const userId = user?.profile?.id ?? null

  const { data: lectureData, isLoading } = useQuery({
    queryKey: ['GettingLecture', lectureId],
    queryFn: ({ signal }) => getLectureById(lectureId, signal),
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  // --- Effects ---
  useEffect(() => {
    if (lectureData) {
      console.log(lectureData)
      setIsSaved(lectureData.saved || false)
      setLikeCount(lectureData.likes || 0)
      setIsLiked(lectureData.liked || false)
      setCommentCount(lectureData.comments_count)
    }
  }, [lectureData])

  useEffect(() => {
    setCommentsLoading(true)
    setComments([])
    setCommentsPage(1)
    setHasMoreComments(true)
    getLectureComments(lectureId, 1, commentsPageSize, userId)
      .then((data) => {
        setComments(data)
        setHasMoreComments(data.length === commentsPageSize)
        if (lectureData) {
          const rc = (lectureData as any).comment_count
          const hasValidCount = rc !== undefined && rc !== null && Number.isFinite(Number(rc))
          if (!hasValidCount) {
            setCommentCount(data.length)
          }
        }
      })
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false))
  }, [lectureId, userId])

  // --- Handlers ---
  const handleSaveClick = async () => {
    if (!userId) return alert("You must be logged in to save a lecture.")
    try {
      await saveLecture(lectureId, userId, !isSaved)
      setIsSaved(!isSaved)
    } catch (err) {
      alert("Failed to update saved status.")
    }
  }

  const handleLikeClick = async () => {
    if (!userId) return alert("You must be logged in to like a lecture.")
    try {
      const res = await likeLecture(lectureId, userId, !isLiked)
      setIsLiked(res.liked)
      setLikeCount(res.likes)
    } catch (err) {
      alert("Failed to update like status.")
    }
  }

  const handleShareClick = () => {
    setShareAnimation(true)
    setTimeout(() => setShareAnimation(false), 500)
    setSharePopupOpen(true)
  }

  const handleShareToEmail = () => {
    const subject = encodeURIComponent(`Check out this lecture: ${lectureData?.title}`)
    const body = encodeURIComponent(`I thought you might be interested in this lecture: "${lectureData?.title}"\n\n${lectureData?.description}\n\nRead more here: ${window.location.origin}/lectures/${lectureId}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleShareToTwitter = () => {
    const text = encodeURIComponent(`Check out this lecture: ${lectureData?.title}`)
    const url = encodeURIComponent(`${window.location.origin}/lectures/${lectureId}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
  }

  const handleShareToFacebook = () => {
    const url = encodeURIComponent(`${window.location.origin}/lectures/${lectureId}`)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
  }

  const handleShareToLinkedIn = () => {
    const url = encodeURIComponent(`${window.location.origin}/lectures/${lectureId}`)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`)
  }

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/lectures/${lectureId}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }).catch((err) => console.error("Failed to copy: ", err))
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !userId) return
    try {
      const newComment = await createLectureComment(lectureId, userId, commentText)
      setComments([newComment, ...comments])
      setCommentText("")
      setCommentCount((prev) => prev + 1)
    } catch (err) {
      alert("Failed to post comment.")
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !userId || replyTo === null) return
    try {
      const newReply = await createLectureComment(lectureId, userId, replyText, replyTo)
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

  const handleToggleReplies = async (commentId: number) => {
    setRepliesState(prev => {
      const current = prev[commentId]
      if (current?.visible) return { ...prev, [commentId]: { ...current, visible: false } }
      if (current && !current.visible) return { ...prev, [commentId]: { ...current, visible: true } }
      return { ...prev, [commentId]: { loading: true, replies: [], visible: true } }
    })
    
    if (!repliesState[commentId]) {
      try {
        const data = await getCommentReplies(commentId, 1, 10)
        setRepliesState(prev => ({ ...prev, [commentId]: { loading: false, replies: data, visible: true } }))
      } catch {
        setRepliesState(prev => ({ ...prev, [commentId]: { loading: false, replies: [], visible: true } }))
      }
    }
  }

  const handleCommentLike = async (comment: any) => {
    if (!userId) return alert("You must be logged in to like a comment.")
    setCommentLikeLoading(prev => ({ ...prev, [comment.id]: true }))
    try {
      const res = await likeComment(comment.id, userId, !comment.liked)
      setComments(prev => prev.map(c =>
        c.id === comment.id ? { ...c, likes: res.likes, liked: res.liked } : c
      ))
    } catch (err) {
      alert("Failed to update like status.")
    } finally {
      setCommentLikeLoading(prev => ({ ...prev, [comment.id]: false }))
    }
  }

  const handleCommentsScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (!loadingMoreComments && hasMoreComments && el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
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

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8 animate-pulse">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 py-8 w-full">
        <Link href="/lectures" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Lectures
        </Link>
        
        {!lectureData ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Lecture not found</h1>
            <p className="mb-8">The lecture you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/lectures")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lectures
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8 w-full min-h-full">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* --- Left Column: Lecture Details --- */}
              <div className="flex-1 flex flex-col">
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
                
                <div className="mt-auto">
                  <Button
                    className="w-full rounded-full bg-green-500 text-white hover:bg-green-600 py-6 text-lg shadow-md hover:shadow-lg transition-all"
                    onClick={() => router.push(`/lectures/${lectureId}/learn`)}
                  >
                    Learn Now
                  </Button>
                </div>
              </div>

              {/* --- Right Column: About & Actions --- */}
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
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Your Progress</span>
                      <span className="text-sm font-medium">{lectureData?.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${lectureData?.progress || 0}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className={`w-full ${isSaved ? "bg-green-50 border-green-200" : ""}`} onClick={handleSaveClick}>
                        <motion.div animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                          <BookmarkPlus className={`mr-2 h-4 w-4 ${isSaved ? "fill-green-500 text-green-500" : ""}`} />
                        </motion.div>
                        {isSaved ? "Saved" : "Save"}
                      </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="w-full" onClick={handleShareClick}>
                        <motion.div animate={{ rotate: shareAnimation ? [0, -45, 0] : 0 }} transition={{ duration: 0.5 }}>
                          <Share2 className="mr-2 h-4 w-4" />
                        </motion.div>
                        Share
                      </Button>
                    </motion.div>
                    
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className={`w-full ${isLiked ? "bg-red-50 border-red-200" : ""}`} onClick={handleLikeClick}>
                        <motion.div animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                          <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </motion.div>
                        Like ({likeCount})
                      </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="w-full" onClick={() => setCommentsOpen(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Comment ({commentCount})
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Share Popup Modal --- */}
      {sharePopupOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSharePopupOpen(false)}>
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
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setSharePopupOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">Share "{lectureData?.title || 'this lecture'}" with your friends.</p>
            
            <div className="grid grid-cols-4 gap-3 mb-6">
              <Button variant="outline" className="flex flex-col items-center p-3 h-auto" onClick={handleShareToEmail}><Mail className="h-6 w-6 mb-1 text-primary" /><span className="text-xs">Email</span></Button>
              <Button variant="outline" className="flex flex-col items-center p-3 h-auto" onClick={handleShareToTwitter}><Twitter className="h-6 w-6 mb-1 text-primary" /><span className="text-xs">Twitter</span></Button>
              <Button variant="outline" className="flex flex-col items-center p-3 h-auto" onClick={handleShareToFacebook}><Facebook className="h-6 w-6 mb-1 text-primary" /><span className="text-xs">Facebook</span></Button>
              <Button variant="outline" className="flex flex-col items-center p-3 h-auto" onClick={handleShareToLinkedIn}><Linkedin className="h-6 w-6 mb-1 text-primary" /><span className="text-xs">LinkedIn</span></Button>
            </div>

            <div className="flex items-center border rounded-full overflow-hidden bg-gray-50">
              <div className="flex-1 px-4 py-2 text-sm truncate">{`${window.location.origin}/lectures/${lectureId}`}</div>
              <Button variant="ghost" className={`rounded-full h-full px-4 ${linkCopied ? "bg-green-100 text-green-700" : ""}`} onClick={handleCopyLink}>
                {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {linkCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- Comments Modal --- */}
      {commentsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCommentsOpen(false)}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-xl max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Comments ({commentCount})</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setCommentsOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            
            {/* --- New Comment Form --- */}
            <div className="p-6 border-b">
              <form onSubmit={handleCommentSubmit} className="flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10"><AvatarImage src={user?.image || "/placeholder.svg"} /><AvatarFallback>ME</AvatarFallback></Avatar>
                  <Textarea placeholder="Add a comment..." className="flex-1 resize-none" value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3}/>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="rounded-full bg-primary text-white hover:bg-green-800" disabled={!commentText.trim()}>Post Comment</Button>
                </div>
              </form>
            </div>

            {/* --- Comments List --- */}
            <div className="overflow-y-auto flex-1 p-6" ref={commentsContainerRef} onScroll={handleCommentsScroll}>
              {commentsLoading ? (
                <div className="text-center text-gray-400">Loading comments…</div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <motion.div key={`comment-${comment.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0"><AvatarImage src={comment.profile_image || "/placeholder.svg"} /><AvatarFallback>{comment.profile_name?.substring(0, 2) ?? 'U'}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.profile_name ?? "Anonymous"}</span>
                          <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        
                        {/* --- Comment Actions --- */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className={`flex items-center gap-1 hover:text-gray-700 ${comment.liked ? 'text-green-600' : ''}`} disabled={commentLikeLoading[comment.id]} onClick={() => handleCommentLike(comment)}>
                            <ThumbsUp className={`h-3.5 w-3.5 ${comment.liked ? 'fill-green-600' : ''}`} />
                            <span>{comment.likes ?? 0}</span>
                          </button>
                          <button className="hover:text-gray-700" onClick={() => setReplyTo(comment.id)}>Reply</button>
                          {comment.replies_count > 0 && (
                            <button className="hover:text-blue-700" onClick={() => handleToggleReplies(comment.id)}>
                              {repliesState[comment.id]?.visible ? "Hide Replies" : `Show ${comment.replies_count} Replies`}
                            </button>
                          )}
                        </div>
                        
                        {/* --- Reply Form --- */}
                        {replyTo === comment.id && (
                          <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
                            <Textarea placeholder="Write a reply..." className="flex-1 resize-none" value={replyText} onChange={e => setReplyText(e.target.value)} rows={2}/>
                            <Button type="submit" className="rounded-full" disabled={!replyText.trim()}>Reply</Button>
                            <Button type="button" variant="ghost" onClick={() => { setReplyTo(null); setReplyText("") }}>Cancel</Button>
                          </form>
                        )}
                        
                        {/* --- Replies List --- */}
                        {repliesState[comment.id]?.visible && (
                          <div className="ml-8 mt-4 space-y-4">
                            {repliesState[comment.id].loading ? (<div className="text-gray-400">Loading replies…</div>) 
                            : (repliesState[comment.id].replies.map((reply: any) => (
                                <div key={`reply-${reply.id}`} className="flex gap-3">
                                  <Avatar className="h-8 w-8 flex-shrink-0"><AvatarImage src={reply.profile_image || "/placeholder.svg"}/><AvatarFallback>{reply.profile_name?.substring(0,2) ?? 'U'}</AvatarFallback></Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{reply.profile_name ?? "Anonymous"}</span>
                                      <span className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-700 mb-2">{reply.content}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {loadingMoreComments && <div className="text-center text-gray-400">Loading more...</div>}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
