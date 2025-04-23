import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative py-12 overflow-hidden rounded-bubble bg-black text-white animate-float">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-20 h-20 rounded-full bg-dot-green opacity-20 -top-5 -left-5"></div>
        <div className="absolute w-16 h-16 rounded-full bg-dot-purple opacity-20 top-20 right-10"></div>
        <div className="absolute w-12 h-12 rounded-full bg-dot-pink opacity-20 bottom-10 left-1/4"></div>
        <div className="absolute w-8 h-8 rounded-full bg-white opacity-10 bottom-20 right-1/4"></div>
      </div>

      <div className="relative z-10 px-6 mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          Learn Anything with <span className="text-pastel-pink">AI-Powered</span> Personalization
        </h1>
        <p className="mt-6 text-lg text-gray-300">
          Customize your learning experience with AI-generated content tailored to your skill level
        </p>
        <div className="flex flex-col gap-4 mt-8 sm:flex-row sm:justify-center">
          <Link href="/courses">
            <Button className="rounded-full bg-white text-black hover:bg-gray-100">Explore Courses</Button>
          </Link>
          <Link href="/create">
            <Button
              variant="outline"
              className="rounded-full bg-black border-gray-600 text-white hover:bg-gray-800 hover:text-white"
            >
              Create Content
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

