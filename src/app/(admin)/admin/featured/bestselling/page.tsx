"use client"

import { useState, useEffect } from "react"
import { Star, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { bestsellingApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { SectionHeader } from "@/components/features/featured/section-header"
import { ProductSelector } from "@/components/features/featured/product-selector"
import { FeaturedProductList } from "@/components/features/featured/featured-product-list"
import { Card, CardContent } from "@/components/ui/card"

export default function BestsellingPage() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await bestsellingApi.get()
      setProducts(data.products)
    } catch (error) {
      console.error("Error fetching bestselling products:", error)
      toast({
        title: "Error",
        description: "Failed to load bestselling products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProducts = async (productIds: string[]) => {
    setIsAdding(true)
    try {
      await bestsellingApi.add(productIds)
      toast({
        title: "Success",
        description: "Products added to bestselling section",
      })
      fetchProducts()
    } catch (error) {
      console.error("Error adding bestselling products:", error)
      toast({
        title: "Error",
        description: "Failed to add products to bestselling section",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    setIsLoading(true)
    try {
      await bestsellingApi.remove(productId)
      toast({
        title: "Success",
        description: "Product removed from bestselling section",
      })
      setProducts((prev) => prev.filter((p) => p.product_id !== productId))
    } catch (error) {
      console.error("Error removing bestselling product:", error)
      toast({
        title: "Error",
        description: "Failed to remove product from bestselling section",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        title="Bestselling Products"
        description="Manage products that appear in the bestselling section of your store"
        icon={<Star className="h-6 w-6 text-[#60B5FF]" />}
      />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Current Bestselling Products</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
            </div>
          ) : (
            <FeaturedProductList products={products} onRemoveProduct={handleRemoveProduct} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Add Products to Bestselling</h2>
      <ProductSelector onAddProducts={handleAddProducts} isLoading={isAdding} />
    </div>
  )
}

