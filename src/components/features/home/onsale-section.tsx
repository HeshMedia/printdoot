"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Zap } from "lucide-react"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function OnsaleSection() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await onsaleApi.get()
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching on-sale products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">On Sale</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">On Sale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/products/${product.product_id}`} key={product.product_id}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-red-500 hover:bg-red-600">
                    <Zap className="h-3 w-3 mr-1" /> Sale
                  </Badge>
                </div>
                <div className="relative h-64 w-full">
                  <Image
                    src={product.main_image_url || "/placeholder.svg?height=256&width=256"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#60B5FF]">₹{product.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-500 line-through">₹{(product.price * 1.2).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

