"use client"

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { User, Settings, HelpCircle, LogOut, Bell, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useLectureNotifications } from "@/hooks/use-lecture-notifications"

const inter = Inter({ subsets: ["latin"] })

interface UserData {
  email?: string
  name?: string
  profile?: {
    id?: string | number
    avatar_url?: string
  }
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isProfilePage = pathname === "/profile" || pathname?.startsWith("/profile/")
  const isLectureLearnPage = pathname.includes("/lectures") 
  const { collapsed } = useSidebarState()

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    console.log("Logging out...")
    // Redirect to login page
    window.location.href = "/login"
  }

  // Fix userData typing for destructuring
  const { data: userDataRaw, isLoading: userLoading } = useCurrentUser()
  const userData = (userDataRaw && typeof userDataRaw === 'object' && 'profile' in userDataRaw)
    ? userDataRaw as UserData
    : undefined
  const userId = userData?.profile?.id
  const { lectures: lectureNotifications } = useLectureNotifications(userId !== undefined ? userId : null)

  // Find a lecture in progress (status: 'creating', 'processing', etc.)
  const creatingLecture = lectureNotifications.find((l: any) =>
  (l.status && l.status !== "ready") || (!l.finished && (l.progress ?? 0) < 100)
)

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New course available",
      message: "A new course on Neural Networks has been added",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Assignment reminder",
      message: "Your Programming Basics assignment is due tomorrow",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      title: "Achievement unlocked",
      message: "You've completed 5 lectures in a row!",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      title: "Friend request",
      message: "Jane Smith wants to connect with you",
      time: "2 days ago",
      read: true,
    },
  ])

  const markAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const dismissNotification = (notificationId: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }
  const pendingCount = lectureNotifications.filter(
    (l: any) => (l.status && l.status !== "ready") || (!l.finished && (l.progress ?? 0) < 100),
  ).length
  const isLoading = true

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <Sidebar />
          <div
            className={cn(
              "transition-all duration-300 ease-in-out min-h-screen bg-blue-50/30 ml-16 ",
              // collapsed ? "ml-16" : "ml-64",
            )}
          >
            {/* Floating lecture creation progress notification (button + dropdown) */}
            {!isProfilePage && creatingLecture && !isLectureLearnPage &&  (
              <div className="fixed bottom-6 right-6 z-50">
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                    {/* --------------------------------------------------
                        Spinner button with dynamic ring
                    -------------------------------------------------- */}
                    <button
  className="bg-white text-black px-6 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all group loading-ring"
  /* blue while loading, green when finished */
  style={
    {
      // @ts-ignore – CSS custom prop
      '--ring-color': lectureNotifications[0]?.progress < 100 ? '#3b82f6' : '#22c55e',
    } as React.CSSProperties
  }
>
  <Bell className="h-5 w-5 z-10" />
  <span className="font-semibold z-10">{pendingCount}</span>
  <span className="text-sm z-10">
    lecture{pendingCount === 1 ? '' : 's'} creating
  </span>
</button>

                  </DropdownMenuTrigger>

                  
                  <DropdownMenuContent className="w-80 p-0 rounded-xl mr-2 mb-2" align="end" sideOffset={8} side="top">
                    <div className="p-3 border-b bg-blue-50/40">
                      {lectureNotifications.filter(l => (l.status && l.status !== "ready") || (!l.finished && (l.progress ?? 0) < 100)).length > 0 ? (
                        lectureNotifications.filter(l => (l.status && l.status !== "ready") || (!l.finished && (l.progress ?? 0) < 100)).map((creatingLecture: any) => (
                          <div key={creatingLecture.lecture_id} className="mb-4 last:mb-0">
                            <div className="flex gap-2 flex-col">
                              <span className="font-semibold text-blue-700">Lecture creation in progress</span>
                              <span className="text-xs text-gray-500">(ID: {creatingLecture.lecture_id})</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden mt-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${creatingLecture.progress || 10}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Status: <span className="font-medium text-blue-700">{creatingLecture.status || 'creating'}</span>
                              {creatingLecture.progress ? ` (${creatingLecture.progress}%)` : ''}
                            </div>
                            {creatingLecture.lecture_id && (
                              <Link
                                href={`/lectures/${creatingLecture.lecture_id}/learn?new=true`}
                                className="text-xs text-blue-600 underline hover:text-blue-800 mt-1"
                                
                              >
                                Preview lecture
                              </Link>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-start w-full">
                          <span className="font-semibold text-gray-500">No lecture creating right now</span>
                          <span className="text-xs text-gray-400 mt-1">Start a new lecture to see progress here.</span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {/* Profile picture in top right with dropdown - hidden on profile pages */}
            {!isProfilePage && (
              <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                {/* Notification Bell */}
                <DropdownMenu>
                  {/* <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none relative">
                      <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:ring-2 hover:ring-gray-200 transition-all">
                        <Bell className="h-5 w-5 text-gray-700" />
                        {notifications.filter((n) => !n.read).length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            {notifications.filter((n) => !n.read).length}
                          </span>
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger> */}
                  <DropdownMenuContent className="w-80 p-0 rounded-xl mr-2 mt-1" align="end">
                    <div className="p-3 border-b flex items-center justify-between">
                      <h3 className="font-bold flex items-center">
                        Notifications
                        {notifications.filter((n) => !n.read).length > 0 && (
                          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            {notifications.filter((n) => !n.read).length}
                          </span>
                        )}
                      </h3>
                      {notifications.some((n) => !n.read) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-800 h-auto py-1 px-2"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>

                    {notifications.length > 0 ? (
                      <div className="max-h-[400px] overflow-auto">
                        <AnimatePresence>
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50/30" : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-full shrink-0 ${!notification.read ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                                >
                                  <Bell className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h3
                                      className={`font-medium text-sm ${!notification.read ? "text-blue-900" : "text-gray-900"}`}
                                    >
                                      {notification.title}
                                    </h3>
                                    <div className="flex items-center gap-1 ml-2 shrink-0">
                                      {!notification.read && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 rounded-full"
                                          onClick={() => markAsRead(notification.id)}
                                        >
                                          <Check className="h-3 w-3" />
                                          <span className="sr-only">Mark as read</span>
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-gray-600"
                                        onClick={() => dismissNotification(notification.id)}
                                      >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Dismiss</span>
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                  <span className="text-xs text-gray-500 mt-1 block">{notification.time}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full mb-4">
                          <Bell className="h-6 w-6 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                        <p className="text-gray-500 mt-1">You're all caught up!</p>
                      </div>
                    )}

                    <div className="p-3 border-t">
                      <Link href="/notifications">
                        <Button variant="ghost" className="w-full rounded-full text-sm">
                          View all notifications
                        </Button>
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                
              </div>
            )}
            <main >{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

