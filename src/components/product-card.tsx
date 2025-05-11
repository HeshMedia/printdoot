import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/api/products"
import { Eye, ShoppingCart, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 group relative h-full"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.05 * (index % 6) }}
    >
      <Link href={`/products/${product.product_id}`}>
        <div className="relative w-full aspect-square">
          <Image
            src={product.main_image_url || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            priority={index < 6}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Status badge */}
          <div className="absolute top-1 right-1 z-10">
            <Badge 
              className={`px-1 py-0.5 text-[10px] ${
                product.status === "in_stock"
                  ? "bg-green-500 hover:bg-green-600"
                  : product.status === "out_of_stock"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {product.status === "in_stock"
                ? "IN STOCK"
                : product.status === "out_of_stock"
                  ? "SOLD OUT"
                  : "DISC"}
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
              className="bg-blue-500 rounded-full p-1"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-2.5 w-2.5 text-white" />
            </motion.button>
          </div>
        </div>
        
        <div className="p-1.5 sm:p-2">
          <h3 className="font-medium text-xs line-clamp-1 group-hover:text-blue-500 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-0.5">
            <span className="font-bold text-blue-500 text-xs">₹{product.price.toFixed(2)}</span>
            <div className="flex items-center">
              <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] text-gray-500 ml-0.5">{product.average_rating.toFixed(1)}</span>
            </div>
          </div>
          
          {product.category_name && (
            <div className="mt-1">
              <span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-1 py-0.5 rounded truncate inline-block max-w-full">
                {product.category_name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

