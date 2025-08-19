import type React from "react"
import BackButton from "@/components/ui/BackButton"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <BackButton />
        <main className="mt-4 bg-white rounded-2xl shadow-xl p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
