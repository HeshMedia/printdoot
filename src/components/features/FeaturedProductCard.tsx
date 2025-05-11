"use client"

import { FC, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, ShoppingCart, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { FeaturedProductResponse } from "@/lib/api/featured"
import { Badge } from "@/components/ui/badge"

type AccentColorType = "yellow" | "purple" | "blue" | "green" | "red" | "pink";

interface ProductCardProps {
  product: FeaturedProductResponse;
  animationDelay?: number;
  badgeComponent?: ReactNode;
  needLabel?: string;
  accentColor?: AccentColorType;
  priceComponent?: ReactNode;
  showDiscount?: boolean;
  originalPrice?: number;
  discountPercent?: number;
}

const ProductCard: FC<ProductCardProps> = ({ 
  product, 
  animationDelay = 0,
  badgeComponent,
  needLabel,
  accentColor = "purple",
  priceComponent,
  showDiscount = false,
  originalPrice,
  discountPercent
}) => {
  // Map accent colors to their Tailwind classes
  const accentClasses = {
    yellow: {
      button: "bg-yellow-500 hover:bg-yellow-600",
      text: "text-yellow-500",
      hover: "group-hover:text-yellow-500",
      rating: "text-yellow-400 fill-yellow-400",
    },
    purple: {
      button: "bg-purple-500 hover:bg-purple-600",
      text: "text-purple-500",
      hover: "group-hover:text-purple-500",
      rating: "text-purple-400 fill-purple-400",
    },
    blue: {
      button: "bg-blue-500 hover:bg-blue-600",
      text: "text-blue-500",
      hover: "group-hover:text-blue-500",
      rating: "text-blue-400 fill-blue-400",
    },
    green: {
      button: "bg-green-500 hover:bg-green-600",
      text: "text-green-500",
      hover: "group-hover:text-green-500",
      rating: "text-green-400 fill-green-400",
    },
    red: {
      button: "bg-red-500 hover:bg-red-600",
      text: "text-red-500", 
      hover: "group-hover:text-red-500",
      rating: "text-red-400 fill-red-400",
    },
    pink: {
      button: "bg-pink-500 hover:bg-pink-600",
      text: "text-pink-500",
      hover: "group-hover:text-pink-500",
      rating: "text-pink-400 fill-pink-400",
    },
  };

  // Function to calculate and round discount percentage to nearest 5%
  const calculateDiscount = (currentPrice: number, originalPrice: number): number => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    // Calculate exact discount percentage
    const discountPercent = ((originalPrice - currentPrice) / originalPrice) * 100;
    // Round to nearest 5%
    return Math.round(discountPercent / 5) * 5;
  };

  const classes = accentClasses[accentColor];
  
  // Calculate discount if showDiscount is true but no discountPercent is provided
  // Ensure calculatedDiscountPercent is always a number (default to 0)
  const calculatedDiscountPercent: number = 
    showDiscount && originalPrice 
      ? discountPercent ?? calculateDiscount(product.price, originalPrice)
      : 0;

  // Generate default sale badge if needed
  const defaultSaleBadge = showDiscount && calculatedDiscountPercent > 0 ? (
    <Badge className={`${classes.button} px-1.5 py-0.5 text-xs text-white`}>
      <Zap className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> 
      {calculatedDiscountPercent}% OFF
    </Badge>
  ) : null;

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 group relative h-full"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: animationDelay }}
    >
      <Link href={`/products/${product.product_id}`} className="block h-full">
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={product.main_image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badge (could be "Best Seller", "On Sale", "Need Type", etc.) */}
          {(badgeComponent || (showDiscount && defaultSaleBadge)) && (
            <div className="absolute top-1.5 right-1.5 z-10">
              {badgeComponent || defaultSaleBadge}
            </div>
          )}
          
          {/* Quick action overlay */}
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
              className={`${classes.button} rounded-full p-1.5 transform transition-transform hover:scale-110 active:scale-95 z-10`}
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
          <h3 className={`font-medium text-xs sm:text-sm line-clamp-1 transition-colors ${classes.hover}`}>
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between gap-1.5 mt-1">
            {/* Custom price component or discount price display or default price display */}
            {priceComponent ? (
              priceComponent
            ) : showDiscount && originalPrice && calculatedDiscountPercent > 0 ? (
              <div className="flex flex-col">
                <span className={`font-bold ${classes.text} text-sm`}>
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-500 line-through">
                  ₹{originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className={`font-bold ${classes.text} text-sm`}>
                ₹{product.price.toFixed(2)}
              </span>
            )}
            
            {/* Show discount badge on right side (if not in the badge position) */}
            {showDiscount && calculatedDiscountPercent > 0 && !badgeComponent && (
              <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-1 py-0.5 rounded">
                {calculatedDiscountPercent}% OFF
              </span>
            )}
            
            {/* Show rating if available and not showing discount */}
            {(!showDiscount || calculatedDiscountPercent <= 0) && product.average_rating > 0 && (
              <div className="flex items-center ml-auto">
                <Star className={`h-2.5 w-2.5 ${classes.rating}`} />
                <span className="text-[10px] text-gray-500 ml-0.5">
                  {product.average_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;