export default function BookmarksLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

