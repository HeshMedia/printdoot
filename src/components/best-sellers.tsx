"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Star, Eye, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { bestsellingApi, type FeaturedProductResponse } from "@/lib/api/featured"

export default function BestSellers() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await bestsellingApi.get()
        // Take only 4 products
        setProducts(data.products.slice(0, 4))
      } catch (error) {
        console.error("Error fetching bestselling products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-6 sm:py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <motion.div
            className="w-full max-w-lg text-center mb-2 sm:mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Bestselling Products</h2>
            <div className="flex items-center justify-center w-full">
              <div className="h-1 w-12 sm:w-16 bg-[#60B5FF] rounded-full mx-2"></div>
              <div className="h-1 w-24 sm:w-32 bg-[#60B5FF] opacity-50 rounded-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-3 sm:mb-5 text-xs sm:text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our most popular products loved by customers
          </motion.p>
        </div>

        {/* Product Grid - Optimized for 4 products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4">
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-36 sm:h-44"></div>
              ))
            : products.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 group relative"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <Link href={`/products/${product.product_id}`}>
                    <div className="relative w-full aspect-square overflow-hidden">
                      <Image
                        src={product.main_image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Quick action overlay - Smaller buttons */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white rounded-full p-1.5"
                          aria-label="Quick view"
                        >
                          <Eye className="h-3 w-3 text-gray-800" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-[#60B5FF] rounded-full p-1.5"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="h-3 w-3 text-white" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <h3 className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-[#60B5FF] transition-colors">{product.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-[#60B5FF] text-xs sm:text-sm">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 stroke-yellow-400 mr-0.5" />
                          <span className="text-[10px] sm:text-xs">{product.average_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {/* Explore Button - Fixed position to always be visible */}
        <motion.div
          className="flex justify-center mt-3 sm:mt-6 sticky bottom-4 sm:relative sm:bottom-0 z-10"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            className="rounded-full bg-[#60B5FF] hover:bg-[#4da8f7] text-white px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center group shadow-md sm:shadow-none"
            asChild
          >
            <Link href="/featured/bestselling">
              Explore All Bestsellers
              <ArrowRight className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
