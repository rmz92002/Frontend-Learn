"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Heart, MessageSquare } from "lucide-react"
import { TrendingLecture } from "@/lib/api"

interface MainContentProps {
  trending: TrendingLecture[] | null
  loadingTrending: boolean
  popular: TrendingLecture[]
  loadingPopular: boolean
  filteredPopular: TrendingLecture[]
  hasMorePopular: boolean
  loadMoreRef: React.RefObject<HTMLDivElement>
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function MainContent({
  trending,
  loadingTrending,
  popular,
  loadingPopular,
  filteredPopular,
  hasMorePopular,
  loadMoreRef,
}: MainContentProps) {
  return (
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
            ? trending.map(item => (
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
            ? filteredPopular.map(item => (
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
            : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No popular lectures found</h3>
              </div>
            )}
          <div ref={loadMoreRef} className="col-span-full text-center py-4 text-gray-400">
            {loadingPopular && popular.length > 0
              ? "Loading more lectures…"
              : !hasMorePopular && popular.length > 0
              ? "No more lectures."
              : null}
          </div>
        </div>
      </div>
    </>
  )
}
