"use client"

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react"

import Link from "next/link"
import {
  Search,
  Clock,
  BookOpen,
  User,
  Calendar,
  X,
  ThumbsUp,
  MessageCircle,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  getLecturesInProgress,
  getSavedLectures,
  getCurrentUser,
  getRecentlyViewedLectures,
  getLectureById,
} from "@/lib/api"

import { useLectureNotifications } from "@/hooks/use-lecture-notifications"
import { useCurrentUser } from "@/hooks/use-current-user"

const pageSize = 12 as const

export default function LecturesPage() {
  /*───────────────────────────────────────────────────────────
   * 1.  USER
   *───────────────────────────────────────────────────────────*/
  const { data: userDataRaw } = useCurrentUser()
  const initialProfileId =
    userDataRaw && typeof userDataRaw === "object"
      ? (userDataRaw as any)?.profile?.id ?? null
      : null

  const [userId, setUserId] = useState<number | null>(initialProfileId)
  useEffect(() => {
    if (!initialProfileId)
      getCurrentUser().then((u) =>
        setUserId(u?.profile?.id ?? null)
      )
  }, [initialProfileId])

  /*───────────────────────────────────────────────────────────
   * 2.  STATE
   *───────────────────────────────────────────────────────────*/
  const [showSaved, setShowSaved] = useState(false)
  const [lectures, setLectures] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  /*───────────────────────────────────────────────────────────
   * 3.  RESET when filters change
   *───────────────────────────────────────────────────────────*/
  useEffect(() => {
    setLectures([])
    setPage(1)
    setHasMore(true)
  }, [showSaved, userId])

  /*───────────────────────────────────────────────────────────
   * 4.  FIRST PAGE
   *───────────────────────────────────────────────────────────*/
  useEffect(() => {
    // Only require a user when fetching “Saved” lectures
    setLoadingMore(true)
    ;(async () => {
      const data = showSaved
        ? await getSavedLectures(userId, 1, pageSize)
        : await getRecentlyViewedLectures(userId, 1, pageSize)
      setLectures(data)
      setHasMore(data.length === pageSize)
      setLoadingMore(false)
    })()
  }, [showSaved, userId])

  /*───────────────────────────────────────────────────────────
   * 5.  INFINITE SCROLL
   *───────────────────────────────────────────────────────────*/
  const fetchMoreLectures = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    const data = showSaved
      ? await getSavedLectures(userId, nextPage, pageSize)
      : await getRecentlyViewedLectures(userId, nextPage, pageSize)
    setLectures((prev) => [...prev, ...data])
    setPage(nextPage)
    setHasMore(data.length === pageSize)
    setLoadingMore(false)
  }, [loadingMore, hasMore, page, showSaved, userId])

  useEffect(() => {
    if (!loadMoreRef.current) return
    const obs = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && fetchMoreLectures(),
      { rootMargin: "200px" }
    )
    obs.observe(loadMoreRef.current)
    return () => obs.disconnect()
  }, [fetchMoreLectures])

  /*───────────────────────────────────────────────────────────
   * 6.  LIVE-NOTIFICATIONS
   *───────────────────────────────────────────────────────────*/
  const { lectures: lectureNotifications } = useLectureNotifications(
    userId
  )

  // Fake progress bump: +1% every 2 seconds for each creating lecture
  const [optimisticProgress, setOptimisticProgress] = useState<Record<number, number>>({})

  // still-creating =
  const creatingLectures = (lectureNotifications ?? []).filter(
    (l: any) =>
      (l.status && l.status !== "Ready") ||
      (!l.finished && (l.progress ?? 0) < 100)
  )
  // Whenever server pushes a new progress, sync up so we never lag behind
 // Whenever server pushes a new progress, sync up so we never lag behind
  useEffect(() => {
    setOptimisticProgress((prev) => {
      const next = { ...prev }
      ;(lectureNotifications ?? []).forEach((l) => {
        const real = l.progress ?? 0
        if (real > (next[l.lecture_id] ?? 0)) {
          next[l.lecture_id] = real
        }
      })
      return next
    })
  }, [lectureNotifications])
  // Every 2 seconds, bump each in-progress lecture up by 1% (max 99%)
  useEffect(() => {
    const id = setInterval(() => {
      setOptimisticProgress(prev => {
        const next = { ...prev }
        creatingLectures.forEach(l => {
          const current = next[l.lecture_id] ?? l.progress ?? 0
          if (current < 99) next[l.lecture_id] = current + 1
        })
        return next
      })
    }, 2000)
    return () => clearInterval(id)
  }, [creatingLectures])

  /*───────────────────────────────────────────────────────────
   * 7.  FILTER OUT duplicates (so loading + finished don’t clash)
   *───────────────────────────────────────────────────────────*/
  const displayLectures = lectures.filter(
    (l) =>
      !creatingLectures.some(
        (c) => c.lecture_id === l.lecture_id
      )
  )

  /*───────────────────────────────────────────────────────────
   * 8.  RENDER
   *───────────────────────────────────────────────────────────*/
  return (
    <div className="container mx-auto px-4 py-8">
      {/* header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Lectures</h1>
          <p className="text-gray-600">
            Browse and discover educational lectures
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setShowSaved(false)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              !showSaved
                ? "bg-green-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={() => setShowSaved(true)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              showSaved
                ? "bg-green-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200"
            }`}
           >
            Saved
          </button>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 8-a   IN-PROGRESS cards */}
        {creatingLectures.map((lecture: any) => (
          <Card
            key={lecture.lecture_id}
            className="h-full animate-pulse overflow-hidden rounded-2xl border-2 border-green-400 bg-green-50/80 shadow-md"
          >
            <CardContent className="flex h-full flex-col gap-6 p-6">
              <div className="flex justify-between">
                <Badge className="bg-green-200 text-green-800">
                  {lecture.category ?? "Creating"}
                </Badge>
                <span className="text-xs font-medium text-green-700">
                  {(optimisticProgress[lecture.lecture_id] ?? lecture.progress ?? 10)}%
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                  {lecture.title ?? "Lecture being created…"}
                </h3>
                <p className="line-clamp-2 min-h-10 text-sm text-green-700">
                  {lecture.description ??
                    "Your lecture is being generated. This may take a moment."}
                </p>
              </div>

              <div className="mt-auto">
                <div className="h-2 rounded-full bg-green-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-700"
                    style={{ width: `${(optimisticProgress[lecture.lecture_id] ?? lecture.progress ?? 10)}%` }}
                  />
                </div>
                <p className="mt-4 text-sm text-green-700">
                  Status:{" "}
                  <span className="font-medium">
                    {lecture.status ?? "creating"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* 8-b   SKELETONS on first load */}
        {(loadingMore)
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="h-full overflow-hidden rounded-2xl bg-white/70 shadow-md"
              >
                <CardContent className="flex h-full flex-col gap-6 p-6">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-4 w-8 rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-4 w-56 rounded" />
                  </div>
                  <div className="mt-auto space-y-4">
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-10 w-full rounded-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : /* 8-c   READY lectures */
            displayLectures.map((lecture: any, index) => (
              <Link
                key={index}
                href={`/lectures/${lecture.lecture_id}`}
              >
                <Card className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 shadow-md backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <CardContent className="flex h-full flex-col gap-6 p-6">
                    <div className="flex justify-between">
                      <Badge className="bg-green-100 text-green-800 group-hover:bg-green-200">
                        {lecture.category}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {lecture.progress}%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                        {lecture.title}
                      </h3>
                      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                        {lecture.description}
                      </p>
                    </div>

                    {/* progress bar */}
                    <div className="mt-auto">
                      <div className="h-2 rounded-full bg-muted/60">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            lecture.progress === 100
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                          style={{ width: `${lecture.progress}%` }}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 text-xs">
                          <ThumbsUp className="h-3 w-3" />
                          {lecture.likes}
                          <MessageCircle className="ml-2 h-3 w-3" />
                          {lecture.comments_count}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <time>
                            {new Date(
                              lecture.date ?? lecture.created_at
                            ).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            

        {/* 8-d   INFINITE SCROLL SENTINEL */}
        <div
          ref={loadMoreRef}
          className="col-span-full py-4 text-center text-gray-400"
        >
          {loadingMore && lectures.length > 0
            ? "Loading more lectures…"
            : !hasMore && lectures.length > 0
            ? "No more lectures."
            : null}
        </div>
      </div>
    </div>
  )
}
