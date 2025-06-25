"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Clock, BookOpen, User, Calendar, X, ThumbsUp, MessageCircle } from "lucide-react"
import Link from "next/link"
import { getLecturesInProgress, getSavedLectures, getCurrentUser, getRecentlyViewedLectures } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { useLectureNotifications } from "@/hooks/use-lecture-notifications"
import { useCurrentUser } from "@/hooks/use-current-user"



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
// const allCategories = Array.from(new Set(lecturesData.map((lecture) => lecture.category)))

const pageSize = 12

export default function LecturesPage() {
  // Use the current user hook for consistency
  const { data: userDataRaw } = useCurrentUser()
  // Defensive: userDataRaw may be undefined or not have profile
  let userIdFromHook: string | number | null = null;
  if (userDataRaw && typeof userDataRaw === 'object' && userDataRaw !== null) {
    const maybeProfile = (userDataRaw as any).profile;
    if (maybeProfile && typeof maybeProfile === 'object' && 'id' in maybeProfile) {
      userIdFromHook = maybeProfile.id as string | number;
    }
  }
  const [userId, setUserId] = useState<number | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [lectures, setLectures] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch current user
  useEffect(() => {
    getCurrentUser().then(u => {
      if (u?.profile?.id) setUserId(u.profile.id)
    })
  }, [])

  // Reset lectures when toggling saved/created or user changes
  useEffect(() => {
    setLectures([])
    setPage(1)
    setHasMore(true)
  }, [showSaved, userId])

  // Initial load
  useEffect(() => {
    if (!userId) return
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

  // Fetch more lectures
  const fetchMoreLectures = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    const data = showSaved
      ? await getSavedLectures(userId!, nextPage, pageSize)
      : await getRecentlyViewedLectures(userId!, nextPage, pageSize)
    setLectures(prev => [...prev, ...data])
    setPage(nextPage)
    setHasMore(data.length === pageSize)
    setLoadingMore(false)
  }, [loadingMore, hasMore, page, showSaved, userId])

  // Set up IntersectionObserver on sentinel
  useEffect(() => {
    if (!loadMoreRef.current) return
    const obs = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchMoreLectures()
      },
      { rootMargin: "200px" }
    )
    obs.observe(loadMoreRef.current)
    return () => obs.disconnect()
  }, [fetchMoreLectures])

  // Use lecture notifications for in-progress lectures
  const { lectures: lectureNotifications } = useLectureNotifications(userIdFromHook ?? userId)

  // Find lectures that are being created (status not 'ready' or progress < 100)
  const creatingLectures = (lectureNotifications || []).filter(
    (l: any) => (l.status && l.status !== "ready") || (!l.finished && (l.progress ?? 0) < 100)
  )
  // Remove creating lectures from the main lectures list to avoid duplicates
  const filteredLectures = lectures.filter(
    (l: any) => !creatingLectures.some((c: any) => c.lecture_id === l.lecture_id)
  )

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lectures</h1>
            <p className="text-gray-600">Browse and discover educational lectures</p>
          </div>
          {/* Simple toggle for Created/Saved */}
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none ${!showSaved ? 'bg-blue-500 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setShowSaved(false)}
              type="button"
            >
              Recent
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none ${showSaved ? 'bg-blue-500 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setShowSaved(true)}
              type="button"
            >
              Saved
            </button>
          </div>
        </div>

        {/* Search and filters */}
        {/* <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search lectures..."
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
          </div> */}

          {/* Active filters */}
          {/* {(searchQuery || selectedCategories.length > 0) && (
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
        </div> */}

        {/* Lectures grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show creating lectures at the top */}
          {creatingLectures.map((lecture: any) => (
            <Card key={lecture.lecture_id} className="h-full overflow-hidden rounded-2xl border-2 border-blue-400 bg-blue-50/80 shadow-md animate-pulse">
              <CardContent className="flex h-full flex-col gap-6 p-6">
                <div className="flex justify-between">
                  <Badge className="bg-blue-200 text-blue-800">{lecture.category || 'Creating'}</Badge>
                  <span className="text-xs font-medium text-blue-700">{lecture.progress || 10}%</span>
                </div>
                <div className="space-y-2">
                  <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                    {lecture.title || 'Lecture being created...'}
                  </h3>
                  <p className="line-clamp-2 min-h-10 text-sm text-blue-700">
                    {lecture.description || 'Your lecture is being generated. This may take a moment.'}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="h-2 rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-blue-500"
                      style={{ width: `${lecture.progress || 10}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-blue-700 mt-4">
                    <span>Status: <span className="font-medium">{lecture.status || 'creating'}</span></span>
                    {lecture.lecture_id && (
                      <Link href={`/lectures/${lecture.lecture_id}/learn?new=true`} className="text-xs text-blue-600 underline hover:text-blue-800 mt-1">
                        Preview
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(loadingMore && lectures.length === 0) || userId === null ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-full overflow-hidden rounded-2xl bg-white/70 shadow-md">
                <CardContent className="flex h-full flex-col gap-6 p-6">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-4 w-8 rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-4 w-56 rounded" />
                  </div>
                  <div className="mt-auto">
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-10 w-full rounded-full mt-4" />
                    <div className="flex items-center justify-between mt-4">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredLectures.length > 0 ? (
            filteredLectures.map((lecture: any) => (
              <Link href={`/lectures/${lecture.lecture_id}`} key={lecture.lecture_id} passHref>
                <Card className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 backdrop-blur-sm shadow-md transition-shadow hover:shadow-lg">
                  <CardContent className="flex h-full flex-col gap-6 p-6">
                    <div className="flex justify-between">
                      <Badge className="bg-blue-100 text-blue-800 group-hover:bg-blue-200">
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
                    {/* Progress */}
                    <div className="mt-auto">
                      <div className="h-2 rounded-full bg-muted/60">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${(lecture.progress == 100)? 'bg-blue-500' : 'bg-gray-500'}`}
                          style={{ width: `${lecture.progress}%` }}
                        />
                      </div>
                     
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {lecture.likes}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <MessageCircle className="h-3 w-3" />
                            {lecture.comments_count}
                          </div>
                        </div>  
                        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <time>
                            {new Date(lecture.date).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No lectures found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
          {/* Sentinel for infinite scroll */}
          <div
            ref={loadMoreRef}
            className="col-span-full text-center py-4 text-gray-400"
          >
            {loadingMore && lectures.length > 0
              ? "Loading more lectures…"
              : !hasMore && lectures.length > 0
              ? "No more lectures."
              : null}
          </div>
        </div>
      </div>
    </div>
  )
}

