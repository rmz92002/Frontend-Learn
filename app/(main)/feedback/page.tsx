"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createFeedback } from "@/lib/api"

export default function FeedbackPage() {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [category, setCategory] = useState("content")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createFeedback({
        rating: rating!,
        content: comment,
        title: category,
      })
      setSubmitted(true)
      // Reset form
      setRating(null)
      setComment("")
      setCategory("content")
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  
  return (
  <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-white to-gray-50">
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-16 flex flex-col justify-center min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Share Your Feedback</h1>
        <p className="mt-3 text-gray-600 max-w-md mx-auto">Help us make the learning experience smoother, faster, and more delightful.</p>
      </header>

      {submitted ? (
        <div className="bg-green-50/80 border border-green-200 rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Thank you for your feedback!</h2>
          <p className="text-gray-600 mb-6">Your input helps us improve the learning experience for everyone.</p>
          <Button onClick={() => setSubmitted(false)} className="rounded-full bg-black text-white hover:bg-gray-900 h-12 px-6">
            Submit Another Response
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-5 text-center">How would you rate your experience?</h2>

            {/* Star Rating */}
            <div className="flex items-center justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="mx-1 focus:outline-none transition-transform duration-150 hover:scale-110"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-9 w-9 sm:h-10 sm:w-10 ${
                      rating && star <= rating ? 'fill-yellow-400 text-yellow-400 drop-shadow' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Feedback Category */}
            <div className="mb-6">
              <Label className="text-base mb-3 block text-gray-800 text-center">What area are you providing feedback on?</Label>
              <RadioGroup value={category} onValueChange={setCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-gray-50 transition">
                  <RadioGroupItem value="content" id="content" />
                  <Label htmlFor="content" className="cursor-pointer">Course Content</Label>
                </div>
                <div className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-gray-50 transition">
                  <RadioGroupItem value="ui" id="ui" />
                  <Label htmlFor="ui" className="cursor-pointer">User Interface</Label>
                </div>
                <div className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-gray-50 transition">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical" className="cursor-pointer">Technical Issues</Label>
                </div>
                <div className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-gray-50 transition">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comment" className="text-base mb-2 block">Tell us more about your experience</Label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts, suggestions, or report issues..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="resize-none rounded-xl focus-visible:ring-2 focus-visible:ring-black/20"
              />
              {!rating && (
                <p className="mt-3 text-sm text-amber-600">Choose a star rating to enable submission.</p>
              )}
            </div>
          </section>

          <Button
            type="submit"
            className="w-full rounded-full h-12 text-base font-semibold shadow-md"
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
          </Button>
        </form>
      )}

      <footer className="mt-10 text-center text-sm text-gray-500">We read every response. 💚</footer>
    </div>
  </div>
)
}
