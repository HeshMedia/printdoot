"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { shopByNeedApi, type NeedResponse } from "@/lib/api/featured"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface Product {
  product_id: string
  name: string
  main_image_url: string
  price: number
  category_name: string
}

export default function ShopByNeedSection() {
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

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
      const fetchProducts = async () => {
        setIsLoadingProducts(true)
        try {
          const data = await shopByNeedApi.getProducts(selectedNeed)
          setProducts(data.products)
        } catch (error) {
          console.error(`Error fetching products for need ${selectedNeed}:`, error)
        } finally {
          setIsLoadingProducts(false)
        }
      }

      fetchProducts()
    }
  }, [selectedNeed])

  if (isLoadingNeeds) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-10 bg-gray-200 rounded mb-8 max-w-2xl mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="animate-pulse"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <div className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (needs.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop By Needs</h2>
          <p className="text-muted-foreground">Find what you are looking for</p>
        </motion.div>

        <Tabs value={selectedNeed} onValueChange={setSelectedNeed} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <TabsList className="mb-8 w-full h-auto flex flex-wrap justify-center gap-2 bg-transparent">
              {needs.map((need: NeedResponse) => (
                <TabsTrigger
                  key={need.need}
                  value={need.need}
                  className="mb-2 data-[state=active]:bg-white/90 data-[state=active]:backdrop-blur-sm bg-transparent hover:bg-white/80"
                >
                  {need.need}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {needs.map((need: NeedResponse, index: number) => (
            <TabsContent key={need.need} value={need.need}>
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="animate-pulse"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * i }}
                    >
                      <div className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
                    </motion.div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found for this need.</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {products.map((product: Product, index: number) => (
                    <motion.div
                      key={product.product_id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <Link href={`/products/${product.product_id}`}>
                        <Card className="h-full transition-all duration-200 hover:shadow-lg border-0">
                          <div className="aspect-[3/4] relative overflow-hidden rounded-xl">
                            <Image
                              src={product.main_image_url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                          <CardContent className="p-4 text-center">
                            <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
                            <div className="flex justify-center items-center mt-2">
                              <span className="font-bold text-primary">₹{product.price.toFixed(2)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button className="group bg-white text-black hover:bg-gray-100">
            Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}