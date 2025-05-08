"use client"

import { useState, useEffect } from "react"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Loader2, Star } from "lucide-react"

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
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Zap className="h-6 w-6 mr-2 text-yellow-500" /> On Sale
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.product_id} href={`/products/${product.product_id}`}>
            <Card className="h-full transition-all duration-200 hover:shadow-lg overflow-hidden border-yellow-200">
              <div className="relative h-48 w-full">
                <Image
                  src={product.main_image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {/* Sale badge */}
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  SALE
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-base mb-1 truncate">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">₹{product.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{(product.price * 1.2).toFixed(2)}
                    </span>
                  </div>
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