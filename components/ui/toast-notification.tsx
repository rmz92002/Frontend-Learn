"use client"

import { useEffect } from "react"
import { X, Check } from "lucide-react"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose?: () => void
  isVisible: boolean
}

export function Toast({ message, type = "success", duration = 3000, onClose, isVisible }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose, isVisible])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-white" />
      case "error":
        return <X className="w-5 h-5 text-white" />
      default:
        return null
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center space-x-3 p-4 rounded-bubble shadow-lg ${getBgColor()}`}>
        <div className="bg-white/20 rounded-full p-1">{getIcon()}</div>
        <p className="text-white font-medium">{message}</p>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

