"use client"

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { User, Settings, HelpCircle, LogOut, Bell, Check, X, Zap } from "lucide-react"
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
import { useCurrentUser } from "@/hooks/use-current-user"
import { useLectureNotifications } from "@/hooks/use-lecture-notifications"
import { Skeleton } from "@/components/ui/skeleton"

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

  const { data: userDataRaw, isLoading: userLoading } = useCurrentUser()
  const userData = (userDataRaw && typeof userDataRaw === 'object' && 'profile' in userDataRaw)
    ? userDataRaw as UserData
    : undefined
  const userId = userData?.profile?.id
  const { lectures: lectureNotifications } = useLectureNotifications(userId !== undefined ? userId : null)

  const creatingLecture = lectureNotifications.find((l: any) =>
    (l.status && l.status !== "ready") || (!l.finished && (l.progress ?? 0) < 100)
  )



  const pendingCount = lectureNotifications.filter(
    (l: any) => (l.status && l.status !== "ready") || (!l.finished && (l.progress ?? 0) < 100),
  ).length

  

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          {/* Sidebar is always rendered */}
          <Sidebar />
          {userLoading ? (
            // Basic skeleton loader while user data is being fetched
            <div />
          ) : (
            // --- RENDER FOR LOGGED-IN USERS ---
            <>
              {/* Floating lecture creation progress notification */}
              {!isProfilePage && creatingLecture && !isLectureLearnPage && (
                <div className="fixed bottom-6 right-6 z-50">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="bg-white text-black px-6 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all group loading-ring"
                        style={
                          {
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
              
            </>
          )}

          <div
            className={cn(
              "transition-all duration-300 ease-in-out min-h-screen bg-blue-50/30 dark:bg-background",
              // Adjust margin based on sidebar collapse state
              collapsed ? "ml-64" : "ml-16"
            )}
          >
            {/* Add padding to the top for logged-out users to prevent content from overlapping with buttons */}
            <main >{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}