"use client"

import { FC } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Eye, ShoppingCart, Star, StarIcon, StarsIcon, StarHalf } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: {
    product_id: string;
    name: string;
    price: number;
    main_image_url: string;
    average_rating?: number;
    [key: string]: any;
  };
  needLabel?: string;
  animationDelay?: number;
}

const ProductCard: FC<ProductCardProps> = ({ 
  product, 
  needLabel, 
  animationDelay = 0 
}) => {
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 group relative h-full"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: animationDelay }}
    >
      <Link href={`/products/${product.product_id}`} className="block h-full">
        {/* Image container - Added overflow-hidden to fix hover issue */}
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={product.main_image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Need badge */}
          {needLabel && (
            <div className="absolute top-1.5 right-1.5 z-10">
              <Badge className="bg-purple-500 hover:bg-purple-600 px-1.5 py-0.5 text-xs">
                <Heart className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> {needLabel}
              </Badge>
            </div>
          )}
          
          {/* Quick action overlay - Fixed with proper event handling */}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2">
            <button
              type="button"
              className="bg-white rounded-full p-1.5 transform transition-transform hover:scale-110 active:scale-95 z-10"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick view logic
              }}
            >
              <Eye className="h-3 w-3 text-gray-800" />
            </button>
            <button
              type="button"
              className="bg-purple-500 rounded-full p-1.5 transform transition-transform hover:scale-110 active:scale-95 z-10"
              aria-label="Add to cart"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to cart logic
              }}
            >
              <ShoppingCart className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-2">
          <h3 className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-purple-500 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-bold text-purple-500 text-sm">₹{product.price.toFixed(2)}</span>
            <span className="ml-auto text-xs font-medium text-purple-600 bg-purple-100 px-1 py-0.5 rounded">
                {product.average_rating ? (
                   <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] text-gray-500 ml-0.5">{product.average_rating.toFixed(1)}</span>
                   </div>
                      
                    
                ) : (
                    "No rating"
                )}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;