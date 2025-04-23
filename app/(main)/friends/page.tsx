"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Users, Check, X, UserCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for friends
  const friends = [
    {
      id: 1,
      name: "Michael Kopfler",
      avatar: "/placeholder.svg?height=100&width=100",
      status: "online",
      mutualFriends: 8,
    },
    { id: 2, name: "Emma Wilson", avatar: "/placeholder.svg?height=100&width=100", status: "online", mutualFriends: 5 },
    {
      id: 3,
      name: "Alice Koller",
      avatar: "/placeholder.svg?height=100&width=100",
      status: "offline",
      mutualFriends: 3,
    },
    {
      id: 4,
      name: "Kameron Porter",
      avatar: "/placeholder.svg?height=100&width=100",
      status: "offline",
      mutualFriends: 12,
    },
  ]

  // Mock data for friend requests
  const [friendRequests, setFriendRequests] = useState([
    { id: 1, name: "Jane Doe", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 2 },
    { id: 2, name: "Robert Brown", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 5 },
  ])
  const [animatingRequestIds, setAnimatingRequestIds] = useState<{ id: number; action: "accept" | "reject" }[]>([])

  // Mock data for suggested friends
  const suggestedFriends = [
    { id: 1, name: "Sarah Johnson", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 4 },
    { id: 2, name: "David Chen", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 7 },
    { id: 3, name: "Lisa Wang", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 3 },
    { id: 4, name: "James Wilson", avatar: "/placeholder.svg?height=100&width=100", mutualFriends: 2 },
  ]

  // Mock search results
  const searchResults = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      mutualFriends: 4,
      isFriend: false,
    },
    {
      id: 2,
      name: "Michael Kopfler",
      avatar: "/placeholder.svg?height=100&width=100",
      mutualFriends: 8,
      isFriend: true,
    },
    {
      id: 3,
      name: "Samuel Jackson",
      avatar: "/placeholder.svg?height=100&width=100",
      mutualFriends: 0,
      isFriend: false,
    },
    {
      id: 4,
      name: "Sara Williams",
      avatar: "/placeholder.svg?height=100&width=100",
      mutualFriends: 1,
      isFriend: false,
    },
  ].filter((person) => searchQuery && person.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAcceptRequest = (requestId: number) => {
    setAnimatingRequestIds((prev) => [...prev, { id: requestId, action: "accept" }])

    // Remove the request after animation completes
    setTimeout(() => {
      setFriendRequests((prev) => prev.filter((request) => request.id !== requestId))
      setAnimatingRequestIds((prev) => prev.filter((item) => item.id !== requestId))
    }, 500) // Match this with animation duration
  }

  const handleRejectRequest = (requestId: number) => {
    setAnimatingRequestIds((prev) => [...prev, { id: requestId, action: "reject" }])

    // Remove the request after animation completes
    setTimeout(() => {
      setFriendRequests((prev) => prev.filter((request) => request.id !== requestId))
      setAnimatingRequestIds((prev) => prev.filter((item) => item.id !== requestId))
    }, 500) // Match this with animation duration
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <div className="rounded-bubble bg-black text-white p-8 relative overflow-hidden animate-float">
          {/* Decorative dots */}
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-dot-green opacity-30"></div>
          <div className="absolute bottom-4 left-8 w-2 h-2 rounded-full bg-dot-pink opacity-30"></div>
          <div className="absolute top-1/2 right-8 w-2 h-2 rounded-full bg-white opacity-30"></div>

          <h1 className="text-3xl font-bold flex items-center gap-3">
            Friends
            <Users className="w-8 h-8" />
          </h1>
        </div>

        <div className="mt-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for people by name..."
              className="pl-12 pr-4 py-6 rounded-full text-lg shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery ? (
            <Card className="rounded-bubble p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Search Results</h2>

              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                      <div className="flex items-center">
                        <Avatar className="w-12 h-12 border-2 border-white rounded-full mr-4">
                          <AvatarImage src={person.avatar} />
                          <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-bold">{person.name}</h3>
                            {person.isFriend && (
                              <Badge className="ml-2 bg-pastel-green text-black">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Friend
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {person.mutualFriends > 0 ? `${person.mutualFriends} mutual friends` : "No mutual friends"}
                          </p>
                        </div>
                      </div>

                      {!person.isFriend && (
                        <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
              )}
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="flex p-1 overflow-x-auto bg-white rounded-full border border-gray-100 shadow-sm mb-6">
                <TabsTrigger value="all" className="rounded-full px-4 py-2">
                  All Friends
                </TabsTrigger>
                <TabsTrigger value="requests" className="rounded-full px-4 py-2">
                  Friend Requests
                  {friendRequests.length > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white">{friendRequests.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="rounded-full px-4 py-2">
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <Card className="rounded-bubble p-6">
                  <h2 className="text-xl font-bold mb-4">Your Friends ({friends.length})</h2>

                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            <Avatar className="w-12 h-12 border-2 border-white rounded-full">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.status === "online" ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                          </div>
                          <div className="ml-4">
                            <h3 className="font-bold">{friend.name}</h3>
                            <p className="text-sm text-gray-500">{friend.mutualFriends} mutual friends</p>
                          </div>
                        </div>

                        <Button variant="outline" className="rounded-full">
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="mt-0">
                <Card className="rounded-bubble p-6">
                  <h2 className="text-xl font-bold mb-4">Friend Requests ({friendRequests.length})</h2>

                  {friendRequests.length > 0 ? (
                    <AnimatePresence>
                      {friendRequests.map((request) => {
                        const isAnimating = animatingRequestIds.find((item) => item.id === request.id)
                        const animationAction = isAnimating?.action

                        return (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 1, x: 0 }}
                            animate={
                              animationAction === "accept"
                                ? { opacity: 0, x: 100, backgroundColor: "rgba(34, 197, 94, 0.2)" }
                                : animationAction === "reject"
                                  ? { opacity: 0, x: -100, backgroundColor: "rgba(239, 68, 68, 0.2)" }
                                  : { opacity: 1, x: 0 }
                            }
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-pastel-yellow/10"
                          >
                            <div className="flex items-center">
                              <Avatar className="w-12 h-12 border-2 border-white rounded-full mr-4">
                                <AvatarImage src={request.avatar} />
                                <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-bold">{request.name}</h3>
                                <p className="text-sm text-gray-500">{request.mutualFriends} mutual friends</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={Boolean(isAnimating)}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                              <Button
                                className="rounded-full bg-black text-white hover:bg-gray-800"
                                onClick={() => handleAcceptRequest(request.id)}
                                disabled={Boolean(isAnimating)}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No pending friend requests</p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-0">
                <Card className="rounded-bubble p-6">
                  <h2 className="text-xl font-bold mb-4">People You May Know</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestedFriends.map((person) => (
                      <div key={person.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div className="flex items-center">
                          <Avatar className="w-12 h-12 border-2 border-white rounded-full mr-4">
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold">{person.name}</h3>
                            <p className="text-sm text-gray-500">{person.mutualFriends} mutual friends</p>
                          </div>
                        </div>

                        <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

