"use client"

import { useState } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/api/products"

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const animationDelay = 0.05 * (index % 8)

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.product_id}`}>
        <div className="overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          {/* Image with placeholder */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.main_image_url}
              alt={product.name}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500",
                isHovered ? "scale-110" : "scale-100"
              )}
            />
          </div>

          {/* Product info */}
          <div className="p-2">
            {/* Title */}
            <h3 className="mb-1 line-clamp-2 text-xs font-medium text-gray-800 sm:text-sm">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mb-1 text-xs font-semibold text-blue-600 sm:text-sm">
              ₹{product.price.toFixed(2)}
            </div>

            {/* Rating */}
            <div className="flex items-center">
              <Star 
                className="h-3 w-3 text-yellow-400" 
                fill={product.average_rating > 0 ? "currentColor" : "none"} 
                strokeWidth={1.5} 
              />
              <span className="ml-1 text-xs text-gray-500">
                {product.average_rating > 0 
                  ? `${product.average_rating.toFixed(1)} (${product.review_count})` 
                  : "No ratings"
                }
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
