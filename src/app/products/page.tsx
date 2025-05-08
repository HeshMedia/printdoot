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
import { FilterX, SlidersHorizontal, Loader2 } from "lucide-react"

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

  const itemsPerPage = 12

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
        setCategories(data.categories)
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const filterParams: ProductsFilterParams = {
          category_id: categoryId,
          min_price: minPrice,
          max_price: maxPrice,
          min_rating: minRating,
          sort_by: sortBy,
          skip: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage,
        }

        let response: ProductsResponse

        if (Object.values(filterParams).some((value) => value !== undefined)) {
          response = await productsApi.filterProducts(filterParams)
        } else {
          response = await productsApi.getProducts((currentPage - 1) * itemsPerPage, itemsPerPage)
        }

        if (response?.products && Array.isArray(response.products)) {
          setProducts(response.products)
          setTotalProducts(response.total || 0)
          const pages = Math.max(1, Math.ceil((response.total || 0) / itemsPerPage))
          console.log(`Total products: ${response.total}, Pages: ${pages}`)
          setTotalPages(pages)
        } else {
          console.error("Invalid API response format:", response)
          setProducts([])
          setTotalPages(1)
          setTotalProducts(0)
        }

        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again.")
        setProducts([])
        setTotalPages(1)
        setTotalProducts(0)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, minPrice, maxPrice, minRating, sortBy, currentPage])

  const handlePageChange = (page: number) => {
    console.log(`Changing to page ${page}`)
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
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
              <span>Clear</span>
            </Button>
          )}
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="block lg:hidden">
                <SlidersHorizontal size={16} className="mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] sm:max-w-md overflow-y-auto">
              <div className="py-6 pr-6">
                <ProductsFilter categories={categories} closeSheet={() => setIsFilterOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block lg:col-span-1">
          <ProductsFilter categories={categories} />
        </div>

        <div className="lg:col-span-3">
          {loading && currentPage === 1 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No products found</h2>
              <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
              
              {loading && currentPage > 1 && (
                <div className="flex justify-center mt-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {!loading && products.length > 0 && (
                <div className="mt-8">
                  <PaginationControl 
                    currentPage={currentPage}
                    totalPages={Math.max(1, totalPages)}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Showing {products.length} of {totalProducts} products
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
