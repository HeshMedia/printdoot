"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Zap } from "lucide-react"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { categoriesApi } from "@/lib/api/categories"
import { Category } from "@/lib/api/admin/categories"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PaginationControl } from "@/components/ui/pagination-control"
import ProductCard from "@/components/features/FeaturedProductCard"

export default function OnSalePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  
  // Pagination from URL
  const pageParam = searchParams.get("page")
  const [currentPage, setCurrentPage] = useState<number>(
    pageParam ? parseInt(pageParam) : 1
  )
  const productsPerPage = 12
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // Calculate skip based on current page
        const skip = (currentPage - 1) * productsPerPage
        
        // Use the API with proper pagination
        const [productsData, categoriesData] = await Promise.all([
          onsaleApi.get(skip, productsPerPage),
          categoriesApi.getCategories()
        ])
        
        setProducts(productsData.products || [])
        setTotalProducts(productsData.total || 0)
        setCategories(categoriesData.categories || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
    
    // Update URL with current page
    if (currentPage > 1) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", currentPage.toString())
      router.push(`/featured/onsale?${params.toString()}`, { scroll: false })
    } else if (pageParam && currentPage === 1) {
      // Remove page param if on page 1
      router.push(`/featured/onsale`, { scroll: false })
    }
  }, [currentPage, router, searchParams, pageParam])

  // Calculate total pages based on total products from API
  const totalPages = Math.ceil(totalProducts / productsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Custom product renderer for sale items (with sale price)
  const renderSalePrice = (product: FeaturedProductResponse) => (
    <div className="flex flex-col">
      <span className="font-bold text-red-500 text-xs">₹{product.price.toFixed(2)}</span>
      <span className="text-[10px] text-gray-400 line-through">
        ₹{(product.price * 1.2).toFixed(2)}
      </span>
    </div>
  )

  // Custom badge renderer for on sale products
  const renderBadge = (product: FeaturedProductResponse) => (
    <Badge className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-[10px]">
      <Zap className="h-2 w-2 mr-0.5" strokeWidth={3} /> SALE
    </Badge>
  )

  return (
    <section className="py-12 bg-gradient-to-b from-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-full max-w-lg text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >            
            <h2 className="text-2xl font-bold mb-2">On Sale Products</h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-red-500 rounded-full w-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Special discounts and limited-time offers
          </motion.p>
        </div>
          
        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Array(productsPerPage).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-medium mb-2">No sale products found</h3>
            <p className="text-muted-foreground mb-6">Check back later for new offers.</p>
            <Button onClick={() => router.push("/")} className="bg-red-500 hover:bg-red-600">
              Browse All Products
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.product_id}
                  product={product}
                  animationDelay={0.05 * (index % 4)}
                  badgeComponent={renderBadge(product)}
                  accentColor="red"
                  priceComponent={renderSalePrice(product)}
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