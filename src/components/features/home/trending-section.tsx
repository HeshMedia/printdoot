"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { trendingApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/features/FeaturedProductCard"

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

  // Custom badge for trending products
  const renderTrendingBadge = () => (
    <Badge className="bg-blue-500 hover:bg-blue-600 px-1.5 py-0.5 text-xs">
      <TrendingUp className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> TRENDING
    </Badge>
  )

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
            <h2 className="text-2xl font-bold mb-2">Trending Now</h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-blue-500 rounded-full w-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover what everyone is buying right now
          </motion.p>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
              ))
            : products.map((product, index) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  animationDelay={0.05 * index}
                  badgeComponent={
                    <Badge className="bg-blue-500 hover:bg-blue-600 px-1.5 py-0.5 text-xs">
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> TRENDING
                    </Badge>
                  }
                  accentColor="blue"
                  priceComponent={
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-blue-500 text-sm">₹{product.price.toFixed(2)}</span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-1 py-0.5 rounded">
                        HOT
                      </span>
                    </div>
                  }
                />
              ))}
        </div>

        {/* Explore Button - More compact */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm flex items-center group"
            asChild
          >
            <Link href="/featured/trending">
              View All Trending Items
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}