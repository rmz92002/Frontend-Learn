export default function MessagesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="divide-y">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

