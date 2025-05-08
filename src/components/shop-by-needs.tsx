"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Eye, ShoppingCart, Star } from "lucide-react"
import { motion } from "framer-motion"
import { shopByNeedApi, type NeedResponse } from "@/lib/api/featured"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface Product {
  product_id: string
  name: string
  main_image_url: string
  price: number
  category_name: string
  average_rating: number
  description: string
}

export default function ShopByNeedSection() {
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [page, setPage] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  // Adjusting to show more products in a row
  const limit = 8

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage * limit < totalProducts) {
      setPage(newPage)
    }
  }
  
  const handleNeedChange = (need: string) => {
    setSelectedNeed(need)
    setPage(0) // Reset to first page when changing need
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / limit)

  if (isLoadingNeeds) {
    return (
      <section className="py-12 bg-gradient-to-b from-white to-[#f0f7ff]">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-7 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-full max-w-lg mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-64 w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (needs.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-b from-white to-[#f0f7ff]">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Shop By Need</h2>
            <p className="text-gray-600">No shopping categories available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-[#f0f7ff]">
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
            <div className="flex items-center justify-center w-full">
              <div className="h-1 w-16 bg-[#8A4FFF] rounded-full mx-2"></div>
              <div className="h-1 w-32 bg-[#8A4FFF] opacity-50 rounded-full"></div>
            </div>
          </motion.div>
          <motion.p
            className="text-gray-600 max-w-md text-center mb-6 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find exactly what you need for any occasion
          </motion.p>
        </div>

        <Tabs defaultValue={selectedNeed} value={selectedNeed} onValueChange={handleNeedChange} className="w-full">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <TabsList className="bg-white/80 backdrop-blur-sm shadow-sm border p-1 rounded-full flex flex-wrap justify-center">
              {needs.map((need) => (
                <TabsTrigger
                  key={need.need}
                  value={need.need}
                  className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-[#8A4FFF] data-[state=active]:text-white transition-all"
                >
                  {need.need} ({need.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {needs.map((need) => (
            <TabsContent key={need.need} value={need.need} className="mt-0">
              {selectedNeed === need.need && (
                <>
                  {/* Top section with total count and back button */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {isLoadingProducts ? "Loading..." : `${totalProducts} Products`}
                    </h3>
                  </div>

                  {isLoadingProducts ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-40 sm:h-48 md:h-52"></div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6">
                        {products.length === 0 ? (
                          <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">No products found for this need.</p>
                          </div>
                        ) : (
                          products.map((product, index) => (
                            <motion.div
                              key={product.product_id}
                              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 group relative hover:shadow-md transition-shadow"
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
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  
                                  {/* Category tag */}
                                  <div className="absolute top-2 left-2 z-10">
                                    <span className="bg-white/80 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded-full">
                                      {product.category_name}
                                    </span>
                                  </div>
                                  
                                  {/* Quick action overlay */}
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <motion.button 
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="bg-white rounded-full p-1.5"
                                      aria-label="Quick view"
                                    >
                                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-800" />
                                    </motion.button>
                                    <motion.button 
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="bg-[#8A4FFF] rounded-full p-1.5"
                                      aria-label="Add to cart"
                                    >
                                      <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                                    </motion.button>
                                  </div>
                                </div>
                                
                                <div className="p-2 sm:p-3">
                                  <h3 className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-[#8A4FFF] transition-colors">
                                    {product.name}
                                  </h3>
                                  
                                  {/* Star rating */}
                                  <div className="flex items-center mt-1 mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                                          star <= Math.round(product.average_rating)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
                                      ({product.average_rating.toFixed(1)})
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <span className="font-bold text-[#8A4FFF] text-xs sm:text-sm">
                                      ₹{product.price.toFixed(2)}
                                    </span>
                                    <Button 
                                      size="sm" 
                                      className="h-6 sm:h-7 px-2 sm:px-3 bg-[#8A4FFF] hover:bg-[#7A3FEF] text-white rounded-full text-[10px] sm:text-xs"
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </>
                  )}

                  {/* Pagination controls */}
                  {totalProducts > limit && (
                    <div className="flex justify-center items-center mt-8 gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(0)}
                        disabled={page === 0}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <ChevronLeft className="h-4 w-4 -ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center mx-2">
                        <span className="text-sm font-medium">
                          Page {page + 1} of {totalPages}
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={(page + 1) * limit >= totalProducts}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={(page + 1) * limit >= totalProducts}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <ChevronRight className="h-4 w-4 -ml-2" />
                      </Button>
                    </div>
                  )}

                  {products.length > 0 && (
                    <motion.div
                      className="flex justify-center mt-8"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Button 
                        className="rounded-full bg-[#8A4FFF] hover:bg-[#7A3FEF] text-white px-6 py-2 text-sm flex items-center group"
                        asChild
                      >
                        <Link href={`/featured/shopbyneed`}>
                          View All {need.need} Products
                          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}