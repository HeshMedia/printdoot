"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { bestsellingApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Card, CardContent } from "@/components/ui/card"

export function BestsellingSection() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await bestsellingApi.get()
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching bestselling products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Bestselling Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
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
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Bestselling Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/products/${product.product_id}`} key={product.product_id}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg">
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
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#60B5FF]">₹{product.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                      <span className="text-sm">{product.average_rating.toFixed(1)}</span>
                    </div>
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

