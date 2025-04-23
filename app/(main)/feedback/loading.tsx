import { Skeleton } from "@/components/ui/skeleton"

export default function FeedbackLoading() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-64 mb-6" />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Skeleton className="h-6 w-72 mb-6" />

        {/* Star Rating Skeleton */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Skeleton key={star} className="h-8 w-8 mx-1 rounded-full" />
          ))}
        </div>

        {/* Feedback Category Skeleton */}
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Comments Skeleton */}
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>

      <Skeleton className="h-10 w-full mt-6 rounded-full" />
    </div>
  )
}

