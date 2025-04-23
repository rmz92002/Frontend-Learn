"use client"

import { useState, useEffect } from "react"

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    // Initialize from localStorage
    const storedState = localStorage.getItem("sidebarCollapsed")
    if (storedState) {
      setCollapsed(storedState === "true")
    }

    // Listen for changes from other components
    const handleStorageChange = () => {
      const currentState = localStorage.getItem("sidebarCollapsed")
      setCollapsed(currentState === "true")
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-tab communication
    const handleCustomEvent = (e: Event) => {
      if (e instanceof CustomEvent && e.detail && e.detail.type === "sidebarStateChange") {
        setCollapsed(e.detail.collapsed)
      }
    }

    window.addEventListener("sidebarStateChange", handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("sidebarStateChange", handleCustomEvent as EventListener)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))

    // Dispatch custom event for same-tab communication
    window.dispatchEvent(
      new CustomEvent("sidebarStateChange", {
        detail: { type: "sidebarStateChange", collapsed: newState },
      }),
    )
  }

  return { collapsed, toggleSidebar }
}

