export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="aspect-video w-full bg-gray-200"></div>

            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="h-6 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 p-6">
              <div className="flex gap-4 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded"></div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="h-7 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-video w-full bg-gray-200"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-5 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-5 w-full bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

