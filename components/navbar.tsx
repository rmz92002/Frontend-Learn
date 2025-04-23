"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  BookOpen,
  Plus,
  Trophy,
  Menu,
  X,
  LogOut,
  LogIn,
  Bell,
  Check,
  Users,
  Compass,
  Settings,
  User,
  BookMarked,
  BarChart3,
} from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [friendRequests, setFriendRequests] = useState([
    { id: 1, name: "Jane Doe", avatar: "/placeholder.svg?height=32&width=32", mutualFriends: 2 },
    { id: 2, name: "Robert Brown", avatar: "/placeholder.svg?height=32&width=32", mutualFriends: 5 },
  ])
  const [animatingRequestIds, setAnimatingRequestIds] = useState<{ id: number; action: "accept" | "reject" }[]>([])

  const handleAcceptRequest = (requestId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setAnimatingRequestIds((prev) => [...prev, { id: requestId, action: "accept" }])

    // Remove the request after animation completes
    setTimeout(() => {
      setFriendRequests((prev) => prev.filter((request) => request.id !== requestId))
      setAnimatingRequestIds((prev) => prev.filter((item) => item.id !== requestId))
    }, 500) // Match this with animation duration
  }

  const handleRejectRequest = (requestId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setAnimatingRequestIds((prev) => [...prev, { id: requestId, action: "reject" }])

    // Remove the request after animation completes
    setTimeout(() => {
      setFriendRequests((prev) => prev.filter((request) => request.id !== requestId))
      setAnimatingRequestIds((prev) => prev.filter((item) => item.id !== requestId))
    }, 500) // Match this with animation duration
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="bg-black text-white p-1 rounded-md mr-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 6L7 12H17L12 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-2xl font-bold">
            Learn<span className="text-black">All</span>
          </span>
        </Link>

        {/* Main Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-2">
          {/* Primary Navigation Items */}
          <Link href="/">
            <Button variant="ghost" className="rounded-full flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>

          {/* Learn Dropdown */}
          <Link href="/courses">
            <Button variant="ghost" className="rounded-full flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </Button>
          </Link>

          {/* Create Button */}
          <Link href="/create">
            <Button variant="ghost" className="rounded-full flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </Link>

          {/* Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Community
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-56">
              <DropdownMenuGroup>
                <Link href="/friends">
                  <DropdownMenuItem className="rounded-lg">
                    <Users className="w-4 h-4 mr-2" />
                    Friends
                  </DropdownMenuItem>
                </Link>
                <Link href="/leaderboard">
                  <DropdownMenuItem className="rounded-lg">
                    <Trophy className="w-4 h-4 mr-2" />
                    Leaderboard
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-2">
          {/* Notifications - Only for logged in users */}
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative w-10 h-10 rounded-full p-0">
                  <Bell className="w-5 h-5" />
                  {friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {friendRequests.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl">
                <div className="p-3 border-b">
                  <h3 className="font-bold flex items-center">
                    Friend Requests
                    {friendRequests.length > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                        {friendRequests.length}
                      </span>
                    )}
                  </h3>
                </div>
                {friendRequests.length > 0 ? (
                  <div className="max-h-[300px] overflow-auto">
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
                            className="flex items-center justify-between p-3 hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <Avatar className="w-10 h-10 border-2 border-white rounded-full mr-3">
                                <AvatarImage src={request.avatar} />
                                <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.name}</p>
                                <p className="text-xs text-gray-500">{request.mutualFriends} mutual friends</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={(e) => handleRejectRequest(request.id, e)}
                                disabled={Boolean(isAnimating)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full bg-black text-white"
                                onClick={(e) => handleAcceptRequest(request.id, e)}
                                disabled={Boolean(isAnimating)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No notifications</p>
                  </div>
                )}
                <div className="p-3 border-t">
                  <Link href="/friends">
                    <Button variant="ghost" className="w-full rounded-full text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Friends
                    </Button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Profile or Login Button */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative w-10 h-10 rounded-full p-0">
                  <Avatar className="w-10 h-10 border-2 border-pastel-pink rounded-full">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Alex Johnson</p>
                    <p className="text-xs leading-none text-muted-foreground">alex.johnson@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/profile">
                    <DropdownMenuItem className="rounded-lg">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile/settings">
                    <DropdownMenuItem className="rounded-lg">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/courses">
                    <DropdownMenuItem className="rounded-lg">
                      <BookMarked className="w-4 h-4 mr-2" />
                      My Courses
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/leaderboard">
                    <DropdownMenuItem className="rounded-lg">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      My Progress
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 rounded-lg" onClick={() => setIsLoggedIn(false)}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col p-4 space-y-2 bg-white">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-full">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>

            {/* Learn Section */}
            <div className="px-3 py-1 text-xs font-semibold text-gray-500">LEARN</div>
            <Link href="/courses" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-full">
                <BookMarked className="w-4 h-4 mr-2" />
                My Courses
              </Button>
            </Link>
            <Link href="/search?tab=courses" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-full">
                <Compass className="w-4 h-4 mr-2" />
                Explore Courses
              </Button>
            </Link>
            <Link href="/create" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </Link>

            {/* Community Section */}
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 mt-2">COMMUNITY</div>
            <Link href="/friends" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-full">
                <Users className="w-4 h-4 mr-2" />
                Friends
              </Button>
            </Link>
            <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-full">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </Link>

            {/* Account Section - Only show if not logged in */}
            {!isLoggedIn && (
              <>
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 mt-2">ACCOUNT</div>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start rounded-full bg-black text-white hover:bg-gray-800">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

