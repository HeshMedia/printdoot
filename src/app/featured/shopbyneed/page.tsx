import { Suspense } from "react"
import ShopByNeedPageContent from "@/components/featured-page-content/shopbyneed"

export default function ShopByNeedPage() {
  return (
    <Suspense fallback={<ShopByNeedPageSkeleton />}>
      <ShopByNeedPageContent />
    </Suspense>
  )
}

function ShopByNeedPageSkeleton() {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-purple-50">
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

        {/* Need tabs skeleton */}
        <div className="mb-6 overflow-x-auto max-w-full pb-2">
          <div className="flex flex-nowrap gap-2 justify-center">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
          ))}
        </div>
      </div>
    </section>
  )
}