"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { productsApi, type Product, type ProductsFilterParams, type ProductsResponse } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import ProductCard from "@/components/product-card"
import ProductsFilter from "@/components/products-filter"
import { PaginationControl } from "@/components/ui/pagination-control"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { FilterX, SlidersHorizontal, Loader2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const itemsPerPage = 24

  const categoryId = searchParams.get("category") ? Number.parseInt(searchParams.get("category")!) : undefined
  const minPrice = searchParams.get("min_price") ? Number.parseFloat(searchParams.get("min_price")!) : undefined
  const maxPrice = searchParams.get("max_price") ? Number.parseFloat(searchParams.get("max_price")!) : undefined
  const minRating = searchParams.get("min_rating") ? Number.parseFloat(searchParams.get("min_rating")!) : undefined
  const sortBy = searchParams.get("sort_by") || undefined

  const hasActiveFilters = categoryId !== undefined || minPrice !== undefined || 
                          maxPrice !== undefined || minRating !== undefined || 
                          sortBy !== undefined

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getCategories()
        setCategories(data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Prepare filter params
        const filterParams: ProductsFilterParams = {
          category_id: categoryId,
          min_price: minPrice,
          max_price: maxPrice,
          min_rating: minRating,
          sort_by: sortBy,
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage
        }
        
        const data: ProductsResponse = await productsApi.filterProducts(filterParams)
        
        setProducts(data.products)
        setTotalProducts(data.total)
        setTotalPages(Math.ceil(data.total / itemsPerPage))
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [categoryId, minPrice, maxPrice, minRating, sortBy, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Get active category name for display
  const activeCategoryName = categoryId && categories.length > 0
    ? categories.find(cat => cat.id === categoryId)?.name
    : undefined;

  // Get formatted filter description
  const getFilterDescription = () => {
    if (activeCategoryName) {
      return `${activeCategoryName} Products`;
    }
    
    if (minRating) {
      return `${minRating}+ Star Products`;
    }
    
    return "All Products";
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-full max-w-lg text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >            
            <h2 className="text-2xl font-bold mb-2">{getFilterDescription()}</h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-blue-500 rounded-full w-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {minPrice || maxPrice 
              ? `Price Range: ₹${minPrice || 0} - ₹${maxPrice || '1000+'}` 
              : 'Discover our quality products for your needs'}
          </motion.p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <SlidersHorizontal size={16} className="mr-1" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                      {(categoryId ? 1 : 0) + 
                       ((minPrice || maxPrice) ? 1 : 0) + 
                       (minRating ? 1 : 0) + 
                       (sortBy ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] sm:max-w-md overflow-y-auto p-0">
                <ProductsFilter categories={categories} closeSheet={() => setIsFilterOpen(false)} />
              </SheetContent>
            </Sheet>
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.location.href = "/products";
                }}
                className="flex items-center gap-1"
              >
                <FilterX size={16} />
                <span>Clear All</span>
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {loading && currentPage === 1 ? (
            Array(12).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-32 sm:h-36"></div>
            ))
          ) : error ? (
            <div className="col-span-full bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h2 className="text-xl font-medium mb-2">No products found</h2>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria.</p>
              <Button 
                onClick={() => {
                  window.location.href = "/products";
                }}
              >
                View All Products
              </Button>
            </div>
          ) : (
            products.map((product, index) => (
              <ProductCard key={product.product_id} product={product} index={index} />
            ))
          )}
        </div>
        
        {/* Loading indicator for pagination */}
        {loading && currentPage > 1 && (
          <div className="flex justify-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && totalPages > 1 && (
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
        
        
      </div>
    </section>
  )
}
