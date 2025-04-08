"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { shopByNeedApi, type NeedResponse } from "@/lib/api/featured"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

export function ShopByNeedSection() {
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [products, setProducts] = useState<any[]>([])
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop By Need</h2>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-8 max-w-2xl mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (needs.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop By Need</h2>

        <Tabs value={selectedNeed} onValueChange={setSelectedNeed} className="w-full">
          <TabsList className="mb-8 w-full h-auto flex flex-wrap justify-center">
            {needs.map((need) => (
              <TabsTrigger key={need.need} value={need.need} className="mb-2 mr-2">
                {need.need}
              </TabsTrigger>
            ))}
          </TabsList>

          {needs.map((need) => (
            <TabsContent key={need.need} value={need.need}>
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found for this need.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Link href={`/products/${product.product_id}`} key={product.product_id}>
                      <Card className="h-full transition-all duration-200 hover:shadow-lg">
                        <div className="relative h-64 w-full">
                          <Image
                            src={product.main_image_url || "/placeholder.svg?height=256&width=256"}
                            alt={product.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#60B5FF]">₹{product.price.toFixed(2)}</span>
                            <span className="text-sm text-gray-500">{product.category_name}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

