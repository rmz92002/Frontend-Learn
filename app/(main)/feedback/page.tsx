"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function FeedbackPage() {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [category, setCategory] = useState("content")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
      setIsSubmitting(false)
      // Reset form
      setRating(null)
      setComment("")
    }, 1000)
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Share Your Feedback</h1>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Thank You for Your Feedback!</h2>
          <p className="text-gray-600 mb-4">Your input helps us improve the learning experience for everyone.</p>
          <Button onClick={() => setSubmitted(false)} className="rounded-full bg-black text-white hover:bg-gray-800">
            Submit Another Response
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium mb-4">How would you rate your experience?</h2>

            {/* Star Rating */}
            <div className="flex items-center justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="mx-1 focus:outline-none">
                  <Star
                    className={`h-8 w-8 ${
                      rating && star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Feedback Category */}
            <div className="mb-6">
              <Label className="text-base mb-2 block">What area are you providing feedback on?</Label>
              <RadioGroup value={category} onValueChange={setCategory} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="content" id="content" />
                  <Label htmlFor="content">Course Content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ui" id="ui" />
                  <Label htmlFor="ui">User Interface</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical">Technical Issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comment" className="text-base mb-2 block">
                Tell us more about your experience
              </Label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts, suggestions, or report issues..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-black text-white hover:bg-gray-800"
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      )}
    </div>
  )
}

