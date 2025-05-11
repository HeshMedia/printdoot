"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { shopByNeedApi, type NeedResponse } from "@/lib/api/featured"
import { Button } from "@/components/ui/button"
import { PaginationControl } from "@/components/ui/pagination-control"
import { motion } from "framer-motion"
import ProductCard from "@/components/features/ShopByNeedProductCard"

export default function ShopByNeedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [products, setProducts] = useState<any[]>([])
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const needParam = searchParams.get("need") || undefined
  const pageParam = searchParams.get("page")
  
  // Use the page from URL or default to 1
  const [currentPage, setCurrentPage] = useState<number>(
    pageParam ? parseInt(pageParam) : 1
  )
  const productsPerPage = 12
  
  // Fetch needs on initial load
  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        setIsLoading(true)
        const needsData = await shopByNeedApi.getNeeds()
        setNeeds(needsData.needs || [])
        
        // Set initial need from URL parameter or use first need from the list
        const initialNeed = needParam || (needsData.needs?.[0]?.need || "")
        setSelectedNeed(initialNeed)
      } catch (error) {
        console.error("Error fetching needs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNeeds()
  }, [needParam])

  // Fetch products when need or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedNeed) return
      
      setIsLoading(true)
      try {
        // Calculate skip based on current page and limit
        const skip = (currentPage - 1) * productsPerPage
        
        // Use the updated API with skip and limit parameters
        const productsData = await shopByNeedApi.getProducts(
          selectedNeed,
          skip,
          productsPerPage
        )
        
        setProducts(productsData.products || [])
        setTotalProducts(productsData.total || 0)
      } catch (error) {
        console.error(`Error fetching products for need ${selectedNeed}:`, error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
    
    // Update URL with current filters
    if (selectedNeed) {
      const params = new URLSearchParams()
      params.set("need", selectedNeed)
      if (currentPage > 1) {
        params.set("page", currentPage.toString())
      }
      router.push(`/featured/shopbyneed?${params.toString()}`, { scroll: false })
    }
  }, [selectedNeed, currentPage, router])
  
  const totalPages = Math.ceil(totalProducts / productsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNeedClick = (need: string) => {
    if (need !== selectedNeed) {
      setSelectedNeed(need)
      // Reset to first page when changing need
      setCurrentPage(1)
    }
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-full max-w-lg text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >            
            <h2 className="text-2xl font-bold mb-2">Shop By Need</h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-purple-500 rounded-full w-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find exactly what you need for any occasion
          </motion.p>
        </div>

        {/* Need tabs */}
        <div className="mb-6 overflow-x-auto max-w-full pb-2">
          <div className="flex flex-nowrap gap-2 justify-center">
            {needs.map(need => (
              <Button
                key={need.need}
                variant={selectedNeed === need.need ? "default" : "outline"}
                className={selectedNeed === need.need 
                  ? "bg-purple-500 hover:bg-purple-600" 
                  : "text-purple-700 border-purple-200 hover:border-purple-300"}
                size="sm"
                onClick={() => handleNeedClick(need.need)}
              >
                {need.need} ({need.count})
              </Button>
            ))}
          </div>
        </div>
        
        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array(productsPerPage).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-medium mb-2">No products found for "{selectedNeed}"</h3>
            <p className="text-muted-foreground mb-6">Try selecting a different need.</p>
            <div className="flex gap-2 justify-center">
              {needs.filter(need => need.need !== selectedNeed).slice(0, 3).map(need => (
                <Button 
                  key={need.need}
                  onClick={() => handleNeedClick(need.need)} 
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Try {need.need}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
              {products.map((product, index) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  needLabel={selectedNeed}
                  animationDelay={0.05 * (index % 6)}
                />
              ))}
            </div>
              
            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <PaginationControl 
                  currentPage={currentPage}
                  totalPages={Math.max(1, totalPages)}
                  onPageChange={handlePageChange}
                />
                <div className="text-center text-sm text-gray-500 mt-4">
                  Showing {products.length} of {totalProducts} products
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}