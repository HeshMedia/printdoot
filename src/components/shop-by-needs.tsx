"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { shopByNeedApi, type NeedResponse } from "@/lib/api/featured"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/features/FeaturedProductCard"
import { Product } from "@/lib/api/products"

export interface FeaturedProductResponse {
  product_id: string;
  created_at: string;
  id: number;
  name: string;
  price: number;
  description: string;
  main_image_url: string;
  category_name: string;
  average_rating: number;
}

export default function ShopByNeeds() {
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [page, setPage] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  // Show 6 products on the homepage to match other sections
  const limit = 6

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const data = await shopByNeedApi.getNeeds()
        setNeeds(data.needs)
        if (data.needs.length > 0) {
          setSelectedNeed(data.needs[0].need)
        }
      } catch (error) {
        console.error("Error fetching needs:", error)
      } finally {
        setIsLoadingNeeds(false)
      }
    }

    fetchNeeds()
  }, [])

  useEffect(() => {
    if (selectedNeed) {
      fetchProducts()
    }
  }, [selectedNeed, page])

  const fetchProducts = async () => {
    if (!selectedNeed) return

    setIsLoadingProducts(true)
    try {
      // Use the API with pagination parameters
      const url = `${process.env.NEXT_PUBLIC_API_URL}/shopbyneed/${encodeURIComponent(selectedNeed)}?limit=${limit}&skip=${page * limit}`
      const response = await fetch(url)
      
      if (!response.ok) throw new Error("Failed to fetch products")
      
      const data = await response.json()
      setProducts(data.products)
      setTotalProducts(data.total)
    } catch (error) {
      console.error(`Error fetching products for need ${selectedNeed}:`, error)
    } finally {
      setIsLoadingProducts(false)
    }
  }
  
  const handleNeedChange = (need: string) => {
    setSelectedNeed(need)
    setPage(0) // Reset to first page when changing need
  }

  // Skip rendering if there are no products
  if ((!isLoadingNeeds && needs.length === 0) || (!isLoadingProducts && products.length === 0 && needs.length > 0)) {
    return null
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-full max-w-lg text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Shop By Need</h2>
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1 bg-purple-500 rounded-full w-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-5 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find exactly what you need for any occasion
          </motion.p>
        </div>

        <Tabs 
          defaultValue={selectedNeed} 
          value={selectedNeed} 
          onValueChange={handleNeedChange}
          className="w-full"
        >
          <motion.div
            className="flex justify-center mb-6 overflow-x-auto max-w-full pb-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <TabsList className="bg-white shadow-sm border p-1 rounded-full flex flex-nowrap justify-start md:justify-center">
              {needs.map((need) => (
                <TabsTrigger
                  key={need.need}
                  value={need.need}
                  className="rounded-full px-3 py-1 text-xs whitespace-nowrap data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all"
                >
                  {need.need} ({need.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {isLoadingProducts
              ? Array(limit).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-44"></div>
                ))
              : products.map((product, index) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    animationDelay={0.05 * index}
                    badgeComponent={
                      <Badge className="bg-purple-500 hover:bg-purple-600 px-1.5 py-0.5 text-xs">
                        <Heart className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} /> {selectedNeed}
                      </Badge>
                    }
                    accentColor="purple"
                  />
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
              className="rounded-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 text-sm flex items-center group"
              asChild
            >
              <Link href={`/featured/shopbyneed?need=${encodeURIComponent(selectedNeed)}`}>
                Browse All {selectedNeed}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </Tabs>
      </div>
    </section>
  )
}