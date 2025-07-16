import { useEffect, useRef, useState } from "react"

function getClientIdCookie(): string | null {
  if (typeof document === "undefined") return null;            // SSR safety
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("client_id="));
  return match ? match.split("=")[1] : null;
}

export function useLectureNotifications(userId: string | number | null) {
  const identifier = userId ?? getClientIdCookie();
  const [lectures, setLectures] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!identifier) return

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_WS_URL || "ws://localhost:8000"}/notifications/ws/${identifier}`)
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
  }, [identifier])

  // Optionally, provide a function to send a ping/request
  const ping = () => {
    wsRef.current?.send("ping")
  }

  return { lectures, ping }
}
