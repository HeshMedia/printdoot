"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, TrendingUp, Star } from "lucide-react"
import { motion } from "framer-motion"
import { trendingApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function TrendingSection() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await trendingApi.get(6, 0) // Fetch 6 products with no skip
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching trending products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Skip rendering if there are no products
  if (!isLoading && products.length === 0) {
    return null
  }

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
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
              Trending Now
            </h2>
            <div className="flex items-center justify-center w-full">
              <div className="h-1 w-16 bg-blue-500 rounded-full mx-2"></div>
              <div className="h-1 w-32 bg-blue-500 opacity-50 rounded-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover what everyone is buying right now
          </motion.p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-72"></div>
              ))
            : products.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/products/${product.product_id}`}>
                    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg border-blue-100">
                      <div className="relative h-48 w-full">
                        <Image
                          src={product.main_image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            <TrendingUp className="h-3 w-3 mr-1" /> Trending
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-600">₹{product.price.toFixed(2)}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                            <span className="text-sm">{product.average_rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
        </div>

        {/* Explore Button */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 flex items-center group"
            asChild
          >
            <Link href="/featured/trending">
              See All Trending Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}