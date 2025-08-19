"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { getTrendingLectures, getPopularLectures, TrendingLecture, searchLecturesSemantic } from "@/lib/api"
import SearchResults from "./search-results"
import MainContent from "./main-content"

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
      .finally(() => {
        
        setLoadingTrending(false)})
    
  }, [])
  console.log(trending)

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
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
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
        <SearchResults
          searchResults={searchResults}
          searchLoading={searchLoading}
          searchError={searchError}
          hasMoreSearch={hasMoreSearch}
          loadMoreSearchRef={loadMoreSearchRef as React.RefObject<HTMLDivElement>}
        />
      ) : (
        <MainContent
          trending={trending}
          loadingTrending={loadingTrending}
          popular={popular}
          loadingPopular={loadingPopular}
          filteredPopular={filteredPopular}
          hasMorePopular={hasMorePopular}
          loadMoreRef={loadMoreRef as React.RefObject<HTMLDivElement>}
        />
      )}
    </div>
  )
}
