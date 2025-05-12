"use client"

import { useState, useEffect } from "react"
import { productsApi, type Product } from "@/lib/api/products"
import { Loader2 } from "lucide-react"
import ProductCard from "@/components/product/ProductCard"

interface RelatedProductsProps {
  productId: string
  categoryName: string | null
  limit?: number
}

export default function RelatedProducts({ productId, categoryName, limit = 4 }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!categoryName) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        // Fetch all products since the API doesn't support filtering by category_name
        const response = await productsApi.getProducts(0, limit + 5)

        // Filter out the current product and limit the results
        const filteredProducts = response.products
          .filter(product => product.product_id !== productId)
          .filter(product => product.category_name === categoryName)
          .slice(0, limit)
        
        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error fetching related products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [productId, categoryName, limit])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {products.map((product, index) => (
          <ProductCard key={product.product_id} product={product} index={index} />
        ))}
      </div>
    </div>
  )
}