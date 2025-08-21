"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const emailFromQuery = searchParams.get("email")
    if (emailFromQuery) {
      setEmail(emailFromQuery)
    }
  }, [searchParams])

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      )
      if (res.ok) {
        setMessage("A new confirmation email has been sent.")
      } else {
        setMessage("Failed to send confirmation email. Please try again.")
      }
    } catch (error) {
      console.error("Failed to resend confirmation email:", error)
      setMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Confirm Your Email
        </h1>
        <p className="text-gray-500 mt-2">
          Your email is not confirmed. Please resend the confirmation email.
        </p>
      </div>

      <form onSubmit={handleResendConfirmation} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className="pl-10 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-lg bg-primary hover:bg-emerald-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Resend Confirmation Email"}
        </Button>
      </form>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  )
}
