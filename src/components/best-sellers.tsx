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
        // Take only 6 products
        setProducts(data.products.slice(0, 6))
      } catch (error) {
        console.error("Error fetching bestselling products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-full max-w-lg text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Bestselling Products</h2>
            <div className="flex items-center justify-center w-full">
              <div className="h-1 w-16 bg-[#60B5FF] rounded-full mx-2"></div>
              <div className="h-1 w-32 bg-[#60B5FF] opacity-50 rounded-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our most popular products loved by customers
          </motion.p>
        </div>

        {/* Product Grid - Reduced size with more compact spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-44"></div>
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
                      <h3 className="font-medium text-sm line-clamp-1 group-hover:text-[#60B5FF] transition-colors">{product.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-[#60B5FF] text-sm">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400 mr-0.5" />
                          <span className="text-xs">{product.average_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
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
            className="rounded-full bg-[#60B5FF] hover:bg-[#4da8f7] text-white px-6 py-2 text-sm flex items-center group"
            asChild
          >
            <Link href="/featured/bestselling">
              Explore All Bestsellers
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
