"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { newarrivalsApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { SectionHeader } from "@/components/features/featured/section-header"
import { ProductSelector } from "@/components/features/featured/product-selector"
import { FeaturedProductList } from "@/components/features/featured/featured-product-list"
import { Card, CardContent } from "@/components/ui/card"
import { config } from "@/lib/config";

const BASE_URL = `${config.apiUrl}/admin`;
const PUBLIC_BASE_URL = `${config.apiUrl}`;

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await newarrivalsApi.get()
      setProducts(data.products)
    } catch (error) {
      console.error("Error fetching new arrivals products:", error)
      toast({
        title: "Error",
        description: "Failed to load new arrivals products",
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
      await newarrivalsApi.add(productIds)
      toast({
        title: "Success",
        description: "Products added to new arrivals section",
      })
      fetchProducts()
    } catch (error) {
      console.error("Error adding new arrivals products:", error)
      toast({
        title: "Error",
        description: "Failed to add products to new arrivals section",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    setIsLoading(true)
    try {
      await newarrivalsApi.remove(productId)
      toast({
        title: "Success",
        description: "Product removed from new arrivals section",
      })
      setProducts((prev) => prev.filter((p) => p.product_id !== productId))
    } catch (error) {
      console.error("Error removing new arrivals product:", error)
      toast({
        title: "Error",
        description: "Failed to remove product from new arrivals section",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        title="New Arrivals"
        description="Manage products that appear in the new arrivals section of your store"
        icon={<ShoppingCart className="h-6 w-6 text-[#60B5FF]" />}
      />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Current New Arrivals</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
            </div>
          ) : (
            <FeaturedProductList products={products} onRemoveProduct={handleRemoveProduct} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Add Products to New Arrivals</h2>
      <ProductSelector onAddProducts={handleAddProducts} isLoading={isAdding} />
    </div>
  )
}

