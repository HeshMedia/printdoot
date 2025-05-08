"use client"

import { useState, useEffect } from "react"
import { productsApi, type Product } from "@/lib/api/products"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Star } from "lucide-react"

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
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.product_id} href={`/products/${product.product_id}`}>
            <Card className="h-full transition-all duration-200 hover:shadow-lg overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={product.main_image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-base mb-1 truncate">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">₹{product.price.toFixed(2)}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">{product.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}