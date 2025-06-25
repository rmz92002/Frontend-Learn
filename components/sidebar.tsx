"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Zap,
  Users,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Plus,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation" // ADDED useRouter
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { motion } from "framer-motion"
import { getRecentlyViewedLectures } from "@/lib/api"
import { useCurrentUser } from "../hooks/use-current-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebarState()
  const pathname = usePathname()
  const router = useRouter() // ADDED
  const [hovered, setHovered] = useState(false)
  const [isDropdownOpen, setDropdownOpen] = useState(false) // ADDED: State for dropdown visibility

  const { data: userDataRaw, isLoading: userLoading } = useCurrentUser();
  const userData = (userDataRaw && typeof userDataRaw === 'object' && 'profile' in userDataRaw)
    ? (userDataRaw as { name?: string; email?: string; profile?: { id?: number | string; avatar_url?: string } })
    : undefined;
  const userId = userData?.profile?.id;
  
  const [recentLectures, setRecentLectures] = useState<any[]>([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  // Fetch recently viewed lectures
  React.useEffect(() => {
    if (!userLoading && userId !== undefined) {
      setLoadingRecent(true)
      getRecentlyViewedLectures(userId as number, 1, 12)
        .then(setRecentLectures)
        .finally(() => setLoadingRecent(false))
    }
  }, [userLoading, userId])

  // Animation variants for sidebar
  const sidebarVariants = {
    expanded: { width: 256, transition: { type: "tween", duration: 0.09 } },
    collapsed: { width: 64, transition: { type: "tween", duration: 0.04 } },
  } as const

  // CHANGED: Sidebar is open on hover OR if the profile dropdown is open
  const isOpen = hovered || isDropdownOpen;

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-100 shadow-sm z-50 flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16",
      )}
    >
      {/* Top section: Logo */}
      <div className={cn("p-4 flex items-center", isOpen ? "justify-between" : "justify-center")}>
        {isOpen ? (
          <div className="flex items-center">
            <div className="bg-black text-white p-2 rounded-md mr-2">
              <Zap className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className="text-xl font-bold">Learnzy</span>
          </div>
        ) : (
          <div className="bg-black text-white p-2 rounded-md">
            <Zap className="w-5 h-5 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* New Lecture Button */}
      <div className={cn("px-2 py-2")}>
        <Link href="/">
          <Button
            variant="outline"
            className={cn("justify-center rounded-full w-full")}
          >
            {isOpen ? "New Lecture" : <Plus className="w-5 h-5" />}
          </Button>
        </Link>
      </div>

      {/* Fixed navigation section */}
      <nav className={cn("px-2 py-2")}>
        <ul className={cn("space-y-1 flex flex-col items-start w-full")}>
          <li className="w-full">
            <Link
              href="/community"
              className={cn(
                "flex items-center w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                pathname === "/community" && "bg-gray-100 font-medium",
                !isOpen ? "justify-center" : "justify-start",
              )}
              title={!isOpen ? "Community" : ""}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="ml-3">Community</span>}
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/lectures"
              className={cn(
                "flex items-center w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                pathname === "/lectures" && "bg-gray-100 font-medium",
                !isOpen ? "justify-center" : "justify-start",
              )}
              title={!isOpen ? "Lectures" : ""}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="ml-3">Library</span>}
            </Link>
          </li>
          <li className="w-full">
            <Link
              href="/feedback"
              className={cn(
                "flex items-center w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                pathname === "/feedback" && "bg-gray-100 font-medium",
                !isOpen ? "justify-center" : "justify-start",
              )}
              title={!isOpen ? "Feedback" : ""}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="ml-3">Feedback</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Scrollable content section */}
      {isOpen && (
        <div className="flex-1 px-4 overflow-hidden flex flex-col">
          <div className="overflow-y-auto scrollbar-thin flex-1 border-t">
            <div className="border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Lectures</h3>
              <ul className="space-y-1">
                {loadingRecent ? (
                  <li className="text-gray-400 px-3 py-2">Loading…</li>
                ) : recentLectures.length > 0 ? (
                  recentLectures.map((lecture, index) => (
                    <li key={lecture.lecture_id || index}>
                      <Link
                        href={`/lectures/${lecture.lecture_id}`}
                        className="block px-3 py-2 text-sm text-gray-700 truncate rounded-md hover:bg-gray-100"
                        title={lecture.title}
                      >
                        {lecture.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 px-3 py-2">No recent lectures</li>
                )}
              </ul>
            </div>
            <div className="py-2 border-b border-gray-100">
              <Link href="/lectures" className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="mt-auto bg-white border-t border-gray-100 z-10 p-2">
        {isOpen ? (
          // CHANGED: Controlled DropdownMenu
          <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-white rounded-full shadow-sm">
                  <AvatarImage src={userData?.profile?.avatar_url || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback>{userData?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col text-left flex-1 min-w-0")}>
                  <span className="font-medium text-sm truncate">{userData?.name || "Loading..."}</span>
                  <span className="text-xs text-gray-500 truncate">{userData?.email || "Loading..."}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userData?.name || "Loading..."}</p>
                  <p className="text-xs text-gray-500 truncate">{userData?.email || "Loading..."}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* CHANGED: Used asChild for proper Link integration */}
              <DropdownMenuItem asChild>
                <Link href="/profile/settings" className="cursor-pointer flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="cursor-pointer flex items-center w-full">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* CHANGED: Used router for client-side navigation */}
              <DropdownMenuItem onClick={() => router.push("/login")} className="text-red-500 cursor-pointer flex items-center w-full">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex justify-center py-2">
            <Avatar className="h-10 w-10 border-2 border-white rounded-full shadow-sm">
              <AvatarImage src={userData?.profile?.avatar_url || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback>{userData?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </motion.aside>
  )
}