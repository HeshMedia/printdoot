"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
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
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching bestselling products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-20 items-start">

          {/* LEFT - Text + Button */}
          <div className="space-y-6">
            <motion.h2
              className="text-3xl lg:text-4xl font-extrabold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Our <br /> Best Sellers
            </motion.h2>

            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Top picks loved by <br /> our customers!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button className="rounded-md bg-btncolor text-black px-6 py-3 text-base hover:bg-btnhover">
                See more
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* RIGHT - Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-64"></div>
                ))
              : products.map((product, index) => (
                  <motion.div
                    key={product.product_id}
                    className="rounded-xl overflow-hidden bg-white shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Link href={`/products/${product.product_id}`}>
                      <div className="relative w-full aspect-square overflow-hidden">
                        <Image
                          src={product.main_image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-bold text-[#60B5FF]">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                            <span className="text-sm">{product.average_rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </section>
  )
}
