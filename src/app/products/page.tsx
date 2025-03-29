"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { productsApi, type Product, type ProductsFilterParams, type ProductsResponse } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import ProductCard from "@/components/product-card"
import ProductsFilter from "@/components/products-filter"
import { Loader2 } from "lucide-react"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 12

  const categoryId = searchParams.get("category") ? Number.parseInt(searchParams.get("category")!) : undefined
  const minPrice = searchParams.get("min_price") ? Number.parseFloat(searchParams.get("min_price")!) : undefined
  const maxPrice = searchParams.get("max_price") ? Number.parseFloat(searchParams.get("max_price")!) : undefined
  const minRating = searchParams.get("min_rating") ? Number.parseFloat(searchParams.get("min_rating")!) : undefined
  const sortBy = searchParams.get("sort_by") || undefined

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
          setTotalPages(Math.ceil(response.total / itemsPerPage))
        } else {
          console.error("Invalid API response format:", response)
          setProducts([])
          setTotalPages(1)
        }

        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again.")
        setProducts([])
        setTotalPages(1)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, minPrice, maxPrice, minRating, sortBy, currentPage])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProductsFilter categories={categories} />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
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

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
