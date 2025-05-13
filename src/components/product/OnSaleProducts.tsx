"use client"

import { useState, useEffect } from "react"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Zap, Loader2 } from "lucide-react"
import FeaturedProductCard from "@/components/features/FeaturedProductCard"
import { Badge } from "@/components/ui/badge"

interface OnSaleProductsProps {
  currentProductId?: string
  limit?: number
}

export default function OnSaleProducts({ currentProductId, limit = 4 }: OnSaleProductsProps) {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOnSaleProducts() {
      try {
        setLoading(true)
        // Fetch products on sale
        const response = await onsaleApi.get()
        
        // Filter out current product if needed and limit results
        const filteredProducts = currentProductId 
          ? response.products.filter(p => p.product_id !== currentProductId).slice(0, limit)
          : response.products.slice(0, limit)
          // Set products directly since we're using FeaturedProductResponse
        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error fetching on-sale products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOnSaleProducts()
  }, [currentProductId, limit])

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
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Zap className="h-5 w-5 mr-2 text-yellow-500" /> On Sale
      </h2>      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {products.map((product, index) => (
          <FeaturedProductCard 
            key={product.product_id} 
            product={product}
            animationDelay={index * 0.05}
            accentColor="red"
            badgeComponent={
              <Badge className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-[10px]">
                <Zap className="h-2 w-2 mr-0.5" strokeWidth={3} /> SALE
              </Badge>
            }
            showDiscount={true}
            originalPrice={product.price * 1.25}
            discountPercent={20}
          />
        ))}
      </div>
    </div>
  )
}