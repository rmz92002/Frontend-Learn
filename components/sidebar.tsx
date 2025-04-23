"use client"

import Link from "next/link"
import {
  Zap,
  Users,
  BookOpen,
  BookText,
  HelpCircle,
  ChevronRight,
  Code,
  Calculator,
  Microscope,
  ChevronLeft,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useSidebarState } from "@/hooks/use-sidebar-state"

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebarState()
  const pathname = usePathname()

  const recentLectures = [
    "Fork of Personalized learning website",
    "2D World Map Design",
    "Neural Networks Introduction",
    "3D lesson layout",
    "Main Map Layout Design",
    "Entertaining lecture example",
    "JavaScript Fundamentals",
    "React Hooks Deep Dive",
    "CSS Grid Mastery",
    "Data Structures & Algorithms",
    "Machine Learning Basics",
    "UX Design Principles",
  ]

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-100 shadow-sm z-50 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <>
            <div className="flex items-center">
              <div className="bg-black text-white p-2 rounded-md mr-2">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">LearnLeap</span>
            </div>
          </>
        )}
        {collapsed && (
          <div className="bg-black text-white p-2 rounded-md">
            <Zap className="w-5 h-5" />
          </div>
        )}
        {collapsed ? // When collapsed, don't show the toggle button in the header
        null : (
          // When expanded, show the toggle button in the header
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className={cn("px-4 py-2", collapsed ? "px-2" : "")}>
        <Link href="/">
          <Button
            variant="outline"
            className={cn("justify-center rounded-full", collapsed ? "w-10 h-10 p-0" : "w-full")}
          >
            {collapsed ? <Plus className="w-5 h-5" /> : "New Lecture"}
          </Button>
        </Link>
      </div>

      {/* Fixed navigation section */}
      <nav className={cn("px-4 py-2", collapsed ? "px-2" : "")}>
        <ul className="space-y-1">
          <li>
            <Link
              href="/community"
              className={cn(
                "flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                pathname === "/community" && "bg-gray-100 font-medium",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "Community" : ""}
            >
              <Users className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Community</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/lectures"
              className={cn(
                "flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                pathname === "/lectures" && "bg-gray-100 font-medium",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "Lectures" : ""}
            >
              <BookOpen className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Lectures</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/courses"
              className={cn(
                "flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                pathname === "/courses" && "bg-gray-100 font-medium",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "Courses" : ""}
            >
              <BookText className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Courses</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/feedback"
              className={cn(
                "flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                pathname === "/feedback" && "bg-gray-100 font-medium",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "Feedback" : ""}
            >
              <HelpCircle className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Feedback</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Scrollable content section */}
      {!collapsed && (
        <div className="flex-1 px-4 overflow-hidden flex flex-col">
          <div className="overflow-y-auto scrollbar-thin flex-1">
            <div className="pt-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Courses</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/courses/learning-ali"
                    className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Code className="w-5 h-5 mr-3" />
                    LearnLeap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/math-learning"
                    className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Calculator className="w-5 h-5 mr-3" />
                    Math Learning
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/doctor-marketplace"
                    className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Microscope className="w-5 h-5 mr-3" />
                    Doctor Marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/web-development"
                    className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Code className="w-5 h-5 mr-3" />
                    Web Development
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/data-science"
                    className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Calculator className="w-5 h-5 mr-3" />
                    Data Science
                  </Link>
                </li>
              </ul>
              <Link href="/courses" className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Lectures</h3>
              <ul className="space-y-1">
                {recentLectures.map((lecture, index) => (
                  <li key={index}>
                    <Link
                      href={`/lectures/${lecture.toLowerCase().replace(/\s+/g, "-")}`}
                      className="block px-3 py-2 text-sm text-gray-700 truncate rounded-md hover:bg-gray-100"
                      title={lecture}
                    >
                      {lecture}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="py-2 border-b border-gray-100">
            <Link href="/lectures" className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          </div>

          {/* Fixed "View All" link for Recent Lectures */}
          
        </div>
      )}

      {/* Toggle button at bottom when collapsed */}
      {collapsed && (
        <div className="absolute bottom-4 left-0 w-full flex justify-center">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors bg-white border border-gray-100 shadow-sm"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}

