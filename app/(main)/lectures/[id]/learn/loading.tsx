import { Skeleton } from "@/components/ui/skeleton"

export default function LectureLearnLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="fixed top-16 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className="w-full h-2 bg-gray-100">
          <Skeleton className="h-full w-1/3" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="pt-20 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="my-6">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />

          <div className="mt-4 flex items-center">
            <Skeleton className="h-4 w-32 mr-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="prose max-w-none">
          <Skeleton className="h-8 w-1/3 mt-8 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />

          <Skeleton className="h-8 w-1/3 mt-8 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />

          <div className="mt-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  )
}

