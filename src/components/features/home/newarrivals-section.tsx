"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShoppingBag, Clock, Eye, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import { newarrivalsApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function NewArrivalsSection() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await newarrivalsApi.get(6, 0) // Fetch 6 products with no skip
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching new arrivals:", error)
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
    <section className="py-12 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-full max-w-lg text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >            
            <h2 className="text-2xl font-bold mb-2">New Arrivals</h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-green-600 rounded-full w-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The latest additions to our collection
          </motion.p>
        </div>        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
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
                    <div className="relative w-full aspect-square">
                      <Image
                        src={product.main_image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* New tag */}
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <Badge className="bg-green-600 hover:bg-green-700 px-1.5 py-0.5 text-xs">
                          <Clock className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> NEW
                        </Badge>
                      </div>
                      
                      {/* Quick action overlay */}
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
                          className="bg-green-600 rounded-full p-1.5"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="h-3 w-3 text-white" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="p-2 sm:p-3">
                      <h3 className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-bold text-green-600 text-sm">₹{product.price.toFixed(2)}</span>
                        <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-1 py-0.5 rounded">
                          JUST IN
                        </span>
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
            className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm flex items-center group"
            asChild
          >
            <Link href="/featured/newarrivals">
              View All New Arrivals
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}