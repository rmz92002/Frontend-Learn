import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import BackButton from "@/components/ui/BackButton"

const inter = Inter({ subsets: ["latin"] })

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <BackButton />
              <main className="mt-4 bg-white rounded-2xl shadow-xl p-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
