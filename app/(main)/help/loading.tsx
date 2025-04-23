export default function HelpLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 flex items-start">
            <div className="h-12 w-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-7 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="bg-white rounded-lg shadow divide-y">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-blue-50 rounded-lg p-6">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

