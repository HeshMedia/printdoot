"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/features/FeaturedProductCard" // Adjust import path as needed

export function OnsaleSection() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await onsaleApi.get(0, 6) // Use proper pagination
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching on-sale products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Function to calculate and round discount percentage to nearest 5%
  const calculateDiscount = (currentPrice: number, originalPrice: number) => {
    // Calculate exact discount percentage
    const discountPercent = ((originalPrice - currentPrice) / originalPrice) * 100;
    
    // Round to nearest 5%
    const roundedDiscount = Math.round(discountPercent / 5) * 5;
    
    return roundedDiscount;
  }

  // Skip rendering if there are no products
  if (!isLoading && products.length === 0) {
    return null
  }

  // Custom sale badge component
  const renderSaleBadge = () => (
    <Badge className="bg-red-500 hover:bg-red-600 px-1.5 py-0.5 text-xs">
      <Zap className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> SALE
    </Badge>
  )

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-full max-w-lg text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">On Sale</h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-red-500 rounded-full w-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Limited time offers with amazing discounts
          </motion.p>
        </div>

        {/* Product Grid - Reduced size */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
              ))
            : products.map((product, index) => {
                // Calculate discount percentage
                const originalPrice = product.price * 1.2;
                const discountPercent = calculateDiscount(product.price, originalPrice);
                
                // Custom price component with sale price and original price
                const priceComponent = (
                  <div className="flex flex-col">
                    <span className="font-bold text-red-500 text-xs">₹{product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-500 line-through">₹{originalPrice.toFixed(2)}</span>
                  </div>
                );
                
                // Custom badge with discount percentage
                const badgeComponent = (
                  <Badge className="bg-red-500 hover:bg-red-600 px-1.5 py-0.5 text-xs">
                    <Zap className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> {discountPercent}% OFF
                  </Badge>
                );
                
                return (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    animationDelay={0.05 * index}
                    badgeComponent={badgeComponent}
                    priceComponent={priceComponent}
                    accentColor="red"
                  />
                );
              })}
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
            className="rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-2 text-sm flex items-center group"
            asChild
          >
            <Link href="/featured/onsale">
              View All Sale Items
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}