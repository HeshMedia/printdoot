"use client"

import { useState, useEffect } from "react"
import { Zap, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { onsaleApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { SectionHeader } from "@/components/features/featured/section-header"
import { ProductSelector } from "@/components/features/featured/product-selector"
import { FeaturedProductList } from "@/components/features/featured/featured-product-list"
import { Card, CardContent } from "@/components/ui/card"

export default function OnsalePage() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await onsaleApi.get()
      setProducts(data.products)
    } catch (error) {
      console.error("Error fetching on-sale products:", error)
      toast({
        title: "Error",
        description: "Failed to load on-sale products",
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
      await onsaleApi.add(productIds)
      toast({
        title: "Success",
        description: "Products added to on-sale section",
      })
      fetchProducts()
    } catch (error) {
      console.error("Error adding on-sale products:", error)
      toast({
        title: "Error",
        description: "Failed to add products to on-sale section",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    setIsLoading(true)
    try {
      await onsaleApi.remove(productId)
      toast({
        title: "Success",
        description: "Product removed from on-sale section",
      })
      setProducts((prev) => prev.filter((p) => p.product_id !== productId))
    } catch (error) {
      console.error("Error removing on-sale product:", error)
      toast({
        title: "Error",
        description: "Failed to remove product from on-sale section",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        title="On-Sale Products"
        description="Manage products that appear in the on-sale section of your store"
        icon={<Zap className="h-6 w-6 text-[#60B5FF]" />}
      />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Current On-Sale Products</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
            </div>
          ) : (
            <FeaturedProductList products={products} onRemoveProduct={handleRemoveProduct} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Add Products to On-Sale</h2>
      <ProductSelector onAddProducts={handleAddProducts} isLoading={isAdding} />
    </div>
  )
}

