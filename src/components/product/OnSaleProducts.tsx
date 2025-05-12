"use client"

import { useState, useEffect } from "react"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Zap, Loader2 } from "lucide-react"
import ProductCard from "@/components/product/ProductCard"
import { type Product } from "@/lib/api/products"

interface OnSaleProductsProps {
  currentProductId?: string
  limit?: number
}

export default function OnSaleProducts({ currentProductId, limit = 4 }: OnSaleProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
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
        
        // Cast to Product type as FeaturedProductResponse has compatible properties
        setProducts(filteredProducts as unknown as Product[])
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
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {products.map((product, index) => (
          <ProductCard key={product.product_id} product={product} index={index} />
        ))}
      </div>
    </div>
  )
}