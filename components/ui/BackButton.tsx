"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BackButton() {
  const router = useRouter()
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => router.back()}
      className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
      aria-label="Go back"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  )
}
