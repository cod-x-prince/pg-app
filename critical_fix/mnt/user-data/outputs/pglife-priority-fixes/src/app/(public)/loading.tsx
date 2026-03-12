import Navbar from "@/components/layout/Navbar"

export default function PublicLoading() {
  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50">
        {/* Hero skeleton */}
        <div className="h-[500px] bg-gray-200 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
