"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Clock, BookOpen, User, Calendar, X } from "lucide-react"
import Link from "next/link"
import { getLecturesInProgress} from "@/lib/api"
import { useQuery } from "@tanstack/react-query"



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

export default function LecturesPage() {
  const { data : lecturesData, isLoading, isError } = useQuery({
      queryKey: ['currentUser'],
      queryFn: ({ signal }) => getLecturesInProgress(1, 1, 10, signal),
      staleTime: 60 * 60 * 1000, // Cache for 1 hour
    })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])


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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lectures</h1>
          <p className="text-gray-600">Browse and discover educational lectures</p>
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
          {lecturesData ? (
            lecturesData.map((lecture) => (
              <Link href={`/lectures/${lecture.lecture_id}`} passHref>
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
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {lecture.description}
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="h-2 rounded-full bg-muted/60">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              colorMap[lecture.color as ColorKey] ?? "bg-blue-500"
                            }`}
                            style={{ width: `${lecture.progress}%` }}
                          />
                        </div>

                        <Button size="lg" className="w-full rounded-full bg-blue-500 text-white hover:bg-blue-600">
                          Start learning
                        </Button>

                        <div className="mt-auto flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <time>
                            {new Date(lecture.date).toLocaleDateString()}
                          </time>
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
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

