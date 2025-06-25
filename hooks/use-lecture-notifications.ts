import { useEffect, useRef, useState } from "react"

export function useLectureNotifications(userId: string | number | null) {
  const [lectures, setLectures] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!userId) return

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_WS_URL || "ws://localhost:8000"}/notifications/ws/${userId}`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.lectures) setLectures(data.lectures)
      } catch (e) {
        // handle error
        console.error("WebSocket message error:", e)
      }
    }

    ws.onopen = () => {
      // Optionally, send a ping or initial message
      ws.send("ping")
    }

    ws.onerror = (e) => {
      // Optionally handle error
      console.error("WebSocket error:", e)
    }

    return () => {
      ws.close()
    }
  }, [userId])

  // Optionally, provide a function to send a ping/request
  const ping = () => {
    wsRef.current?.send("ping")
  }

  return { lectures, ping }
}
