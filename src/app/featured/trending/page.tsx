import { Suspense } from "react"
import TrendingPageContent from "@/components/featured-page-content/trending"

export default function TrendingPage() {
  return (
    <Suspense fallback={<TrendingPageSkeleton />}>
      <TrendingPageContent />
    </Suspense>
  )
}

function TrendingPageSkeleton() {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-lg text-center mb-3">            
            <h2 className="h-8 w-48 bg-gray-200 rounded mx-auto mb-2"></h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-gray-200 rounded-full w-full"></div>
            </div>
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-5"></div>
        </div>
          
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
          ))}
        </div>
      </div>
    </section>
  )
}