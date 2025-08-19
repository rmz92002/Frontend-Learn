"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Heart, MessageSquare } from "lucide-react"
import { TrendingLecture } from "@/lib/api"

interface SearchResultsProps {
  searchResults: TrendingLecture[]
  searchLoading: boolean
  searchError: string | null
  hasMoreSearch: boolean
  loadMoreSearchRef: React.RefObject<HTMLDivElement>
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function SearchResults({
  searchResults,
  searchLoading,
  searchError,
  hasMoreSearch,
  loadMoreSearchRef,
}: SearchResultsProps) {
  if (searchLoading && searchResults.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full overflow-hidden rounded-2xl bg-white/70 shadow-md animate-pulse">
            <CardContent className="flex h-full flex-col gap-6 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-40 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-56 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 mt-8">Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {searchResults.length > 0 ? (
          searchResults.map(item => (
            <Link href={`/lectures/${item.lecture_id}`} key={item.lecture_id}>
              <Card className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 backdrop-blur-sm shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full flex-col gap-6 p-6">
                  <div className="flex justify-between">
                    <Badge className="bg-green-100 text-green-800 group-hover:bg-green-200">{item.category}</Badge>
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
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No search results found</h3>
          </div>
        )}
        {searchResults.length > 0 && hasMoreSearch && (
          <div ref={loadMoreSearchRef} className="col-span-full text-center py-4 text-gray-400">
            {searchLoading ? "Loading more results…" : "Scroll for more results…"}
          </div>
        )}
      </div>
      {searchError && <div className="text-red-500 text-center">{searchError}</div>}
    </div>
  )
}
