"use client"

import { useState, useEffect } from "react"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Loader2, Star, Eye, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
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
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {products.map((product, index) => (
          <motion.div
            key={product.product_id}
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 group relative h-full"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <Link href={`/products/${product.product_id}`}>
              <div className="relative w-full aspect-square">
                <Image
                  src={product.main_image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Sale badge */}
                <div className="absolute top-1 right-1 z-10">
                  <Badge className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-[10px]">
                    <Zap className="h-2 w-2 mr-0.5" strokeWidth={3} /> SALE
                  </Badge>
                </div>
                
                {/* Quick action overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-full p-1"
                    aria-label="Quick view"
                  >
                    <Eye className="h-2.5 w-2.5 text-gray-800" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-500 rounded-full p-1"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-2.5 w-2.5 text-white" />
                  </motion.button>
                </div>
              </div>
              
              <div className="p-1.5">
                <h3 className="font-medium text-xs line-clamp-1 group-hover:text-red-500 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-red-500 text-xs">₹{product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 line-through">
                      ₹{(product.price * 1.2).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] text-gray-500 ml-0.5">{product.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}