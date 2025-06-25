"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Clock, BookOpen, Calendar, X, Heart, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTrendingLectures, getPopularLectures, TrendingLecture, searchLecturesSemantic } from "@/lib/api"

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

// All available categories from the data
const allCategories = [
  "Data Science",
  "Web Development",
  "Marketing",
  "AI",
  "Finance",
  "Technology",
  "Personal Development",
]

function Iframe({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.srcdoc = html
  }, [html])
  return <iframe ref={ref} className=" absolute top-0 left-0
                h-[700px] w-[1280px]          /* match your lecture page’s real size */
                origin-top-left
                scale-[0.30]                  /* ← tweak this until everything fits */
                pointer-events-none           /* disable clicks in the mini-view   */" 
                loading="lazy"/>
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [trending, setTrending] = useState<TrendingLecture[] | null>(null)
  const [popular, setPopular] = useState<TrendingLecture[]>([])
  const [popularPage, setPopularPage] = useState(1)
  const [hasMorePopular, setHasMorePopular] = useState(true)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [searchResults, setSearchResults] = useState<TrendingLecture[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchPage, setSearchPage] = useState(1)
  const [hasMoreSearch, setHasMoreSearch] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreSearchRef = useRef<HTMLDivElement>(null)

  // Track last searched query for active filters
  const [lastSearchedQuery, setLastSearchedQuery] = useState("")

  // Fetch trending (single fetch)
  useEffect(() => {
    setLoadingTrending(true)
    getTrendingLectures()
      .then(setTrending)
      .finally(() => setLoadingTrending(false))
  }, [])

  // Initial load for popular
  useEffect(() => {
    setLoadingPopular(true)
    getPopularLectures(1, 12)
      .then(data => {
        setPopular(data)
        setHasMorePopular(data.length === 12)
        setPopularPage(1)
      })
      .finally(() => setLoadingPopular(false))
  }, [])

  // Fetch more popular lectures
  const fetchMorePopular = useCallback(async () => {
    if (loadingPopular || !hasMorePopular) return
    setLoadingPopular(true)
    const nextPage = popularPage + 1
    const data = await getPopularLectures(nextPage, 12)
    setPopular(prev => [...prev, ...data])
    setPopularPage(nextPage)
    setHasMorePopular(data.length === 12)
    setLoadingPopular(false)
  }, [loadingPopular, hasMorePopular, popularPage])

  // Set up IntersectionObserver for infinite scroll (popular)
  useEffect(() => {
    if (!loadMoreRef.current || loadingPopular || !hasMorePopular) return
    const obs = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchMorePopular()
      },
      { rootMargin: "200px" }
    )
    obs.observe(loadMoreRef.current)
    return () => obs.disconnect()
  }, [fetchMorePopular, loadingPopular, hasMorePopular])

  // Filter popular by search and categories
  const filteredPopular = popular.filter(item => {
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(item.category)
    return matchesCategory
  })

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

  // Search handler (reset page and results)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      setSearchError(null)
      setSearchPage(1)
      setHasMoreSearch(true)
      setLastSearchedQuery("")
      return
    }
    setSearchLoading(true)
    setSearchError(null)
    setSearchPage(1)
    setLastSearchedQuery(searchQuery)
    try {
      const results = await searchLecturesSemantic(searchQuery, 12, 1)
      setSearchResults(results)
      setHasMoreSearch(results.length === 12)
    } catch (e: any) {
      setSearchError(e.message || "Search failed")
      setSearchResults([])
      setHasMoreSearch(false)
    } finally {
      setSearchLoading(false)
    }
  }

  // Fetch more search results (pagination)
  const fetchMoreSearch = useCallback(async () => {
    if (searchLoading || !hasMoreSearch || !searchQuery.trim()) return
    setSearchLoading(true)
    const nextPage = searchPage + 1
    try {
      const results = await searchLecturesSemantic(searchQuery, 12, nextPage)
      setSearchResults(prev => prev ? [...prev, ...results] : results)
      setSearchPage(nextPage)
      setHasMoreSearch(results.length === 12)
    } catch (e: any) {
      setSearchError(e.message || "Search failed")
      setHasMoreSearch(false)
    } finally {
      setSearchLoading(false)
    }
  }, [searchLoading, hasMoreSearch, searchQuery, searchPage])

  // IntersectionObserver for search infinite scroll
  useEffect(() => {
    if (!loadMoreSearchRef.current || !searchResults || !hasMoreSearch) return
    const obs = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchMoreSearch()
      },
      { rootMargin: "200px" }
    )
    obs.observe(loadMoreSearchRef.current)
    return () => obs.disconnect()
  }, [fetchMoreSearch, searchResults, hasMoreSearch])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Filters and Search Bar */}
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-gray-600">Discover courses and lectures shared by our community</p>
        </div>

        {/* Search and filters - moved to top */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative mb-4 flex items-center gap-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search community content..."
              className="pl-10 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            />
            <Button
              className="ml-2"
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              variant="default"
            >
              {searchLoading ? "Searching..." : "Search"}
            </Button>
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
          {(lastSearchedQuery || selectedCategories.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Active Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {lastSearchedQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {lastSearchedQuery}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearchQuery(""); setLastSearchedQuery(""); setSearchResults(null); }} />
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
      </div>

      {searchResults ? (
        // Search Results Section
        <div>
          <h2 className="text-2xl font-semibold mb-4 mt-8">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <Link href={`/lectures/${item.lecture_id}`} key={item.lecture_id}  >
                <Card
                  key={item.lecture_id}
                  className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 backdrop-blur-sm shadow-md transition-shadow hover:shadow-lg"
                >
                  <CardContent className="flex h-full flex-col gap-6 p-6">
                    <div className="flex justify-between">
                      <Badge className="bg-blue-100 text-blue-800 group-hover:bg-blue-200">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{item.title}</h3>
                      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {item.likes}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <MessageSquare className="h-3 w-3" />
                            {item.comments_count}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <time>{formatDate(item.date)}</time>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))
            ) : searchLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-full overflow-hidden rounded-2xl bg-white/70 shadow-md animate-pulse">
                  <CardContent className="flex h-full flex-col gap-6 p-6">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-5 w-40 bg-gray-100 rounded mb-2" />
                    <div className="h-4 w-56 bg-gray-100 rounded mb-2" />
                    <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No search results found</h3>
              </div>
            )}
            {/* Sentinel for infinite scroll on search */}
            {searchResults.length > 0 && hasMoreSearch && (
              <div ref={loadMoreSearchRef} className="col-span-full text-center py-4 text-gray-400">
                {searchLoading ? "Loading more results…" : "Scroll for more results…"}
              </div>
            )}
          </div>
          {searchError && (
            <div className="text-red-500 text-center">{searchError}</div>
          )}
        </div>
      ) : (
        <>
          {/* Trending Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 mt-8">Trending</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {loadingTrending
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="h-full overflow-hidden rounded-2xl bg-white/70 shadow-md animate-pulse">
                      <CardContent className="flex h-full flex-col gap-6 p-6">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-5 w-40 bg-gray-100 rounded mb-2" />
                        <div className="h-4 w-56 bg-gray-100 rounded mb-2" />
                        <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                      </CardContent>
                    </Card>
                  ))
                : trending && trending.length > 0
                ? trending.map((item) => (
                  <Link href={`/lectures/${item.lecture_id}`} key={item.lecture_id}>
      <Card className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 backdrop-blur-sm shadow-md transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-6 p-6">

          {/* --- tiny label row --- */}
          <div className="flex justify-between">
            <Badge className="bg-blue-100 text-blue-800 group-hover:bg-blue-200">
              {item.category}
            </Badge>
          </div>

          {/* --- HTML preview --- */}
          <div className="relative w-full overflow-hidden rounded-lg border bg-white shadow-sm">
            {/* Maintain a 16-by-9 aspect ratio (tailwind aspect-square plugin not required) */}
            <div className="relative h-60 w-full overflow-hidden rounded-lg border bg-white shadow-sm">
  {/* 2️⃣ render the lecture full-size and scale it down */}
            <Iframe
              html={item.html_content}
            
              
              
            />
          </div>
          </div>

          {/* --- details below preview --- */}
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
              {item.title}
            </h3>
            <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>

          {/* --- meta row --- */}
          <div className="mt-auto">
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {item.likes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {item.comments_count}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <time>{formatDate(item.date)}</time>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
                  ))
                : (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No trending lectures found</h3>
                  </div>
                )}
            </div>
          </div>
          {/* Most Popular Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Most Popular</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.length === 0 && loadingPopular
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-full overflow-hidden rounded-2xl bg-white/70 shadow-md animate-pulse">
                      <CardContent className="flex h-full flex-col gap-6 p-6">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-5 w-40 bg-gray-100 rounded mb-2" />
                        <div className="h-4 w-56 bg-gray-100 rounded mb-2" />
                        <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                      </CardContent>
                    </Card>
                  ))
                : filteredPopular.length > 0
                ? filteredPopular.map((item) => (
                  <Link href={`/lectures/${item.lecture_id}`} key={item.lecture_id}  >
                    <Card
                      key={item.lecture_id}
                      className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 backdrop-blur-sm shadow-md transition-shadow hover:shadow-lg"
                    >
                      <CardContent className="flex h-full flex-col gap-6 p-6">
                        <div className="flex justify-between">
                          <Badge className="bg-blue-100 text-blue-800 group-hover:bg-blue-200">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{item.title}</h3>
                          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {item.likes}
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <MessageSquare className="h-3 w-3" />
                                {item.comments_count}
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <time>{formatDate(item.date)}</time>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  ))
                : (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No popular lectures found</h3>
                  </div>
                )}
              {/* Sentinel for infinite scroll */}
              <div
                ref={loadMoreRef}
                className="col-span-full text-center py-4 text-gray-400"
              >
                {loadingPopular && popular.length > 0
                  ? "Loading more lectures…"
                  : !hasMorePopular && popular.length > 0
                  ? "No more lectures."
                  : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

