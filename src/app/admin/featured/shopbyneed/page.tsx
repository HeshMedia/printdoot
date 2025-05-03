"use client"

import { useState, useEffect } from "react"
import { Heart, Loader2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { shopByNeedApi, type FeaturedProductResponse, type NeedResponse } from "@/lib/api/featured"
import { SectionHeader } from "@/components/features/featured/section-header"
import { ProductSelector } from "@/components/features/featured/product-selector"
import { FeaturedProductList } from "@/components/features/featured/featured-product-list"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function ShopByNeedPage() {
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newNeed, setNewNeed] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchNeeds = async () => {
    setIsLoadingNeeds(true)
    try {
      const data = await shopByNeedApi.getNeeds()
      setNeeds(data.needs)
      if (data.needs.length > 0 && !selectedNeed) {
        setSelectedNeed(data.needs[0].need)
      }
    } catch (error) {
      console.error("Error fetching needs:", error)
      toast({
        title: "Error",
        description: "Failed to load shop by need categories",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNeeds(false)
    }
  }

  const fetchProducts = async (need: string) => {
    if (!need) return

    setIsLoadingProducts(true)
    try {
      const data = await shopByNeedApi.getProducts(need)
      setProducts(data.products)
    } catch (error) {
      console.error(`Error fetching products for need ${need}:`, error)
      toast({
        title: "Error",
        description: `Failed to load products for "${need}"`,
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchNeeds()
  }, [])

  useEffect(() => {
    if (selectedNeed) {
      fetchProducts(selectedNeed)
    }
  }, [selectedNeed])

  const handleAddNeed = async () => {
    if (!newNeed.trim()) return

    try {
      // Note: You need to implement an API endpoint to add a new need
      await fetch(`${BASE_URL}/shopbyneed/needs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ need: newNeed.trim() }),
      })

      toast({
        title: "Success",
        description: `Added new need category "${newNeed}"`,
      })

      setNewNeed("")
      setIsDialogOpen(false)
      fetchNeeds()
    } catch (error) {
      console.error("Error adding new need:", error)
      toast({
        title: "Error",
        description: "Failed to add new need category",
        variant: "destructive",
      })
    }
  }

  const handleAddProducts = async (productIds: string[]) => {
    if (!selectedNeed) return

    setIsAdding(true)
    try {
      await shopByNeedApi.add(selectedNeed, productIds)
      toast({
        title: "Success",
        description: `Products added to "${selectedNeed}" section`,
      })
      fetchProducts(selectedNeed)
    } catch (error) {
      console.error("Error adding products to need:", error)
      toast({
        title: "Error",
        description: `Failed to add products to "${selectedNeed}" section`,
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    if (!selectedNeed) return

    setIsLoadingProducts(true)
    try {
      await shopByNeedApi.remove(selectedNeed, productId)
      toast({
        title: "Success",
        description: `Product removed from "${selectedNeed}" section`,
      })
      setProducts((prev) => prev.filter((p) => p.product_id !== productId))
    } catch (error) {
      console.error("Error removing product from need:", error)
      toast({
        title: "Error",
        description: `Failed to remove product from "${selectedNeed}" section`,
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        title="Shop By Need"
        description="Manage product categories based on customer needs"
        icon={<Heart className="h-6 w-6 text-[#60B5FF]" />}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Need Categories</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#60B5FF] hover:bg-[#4DA1E8]">
              <Plus className="h-4 w-4 mr-2" />
              Add New Need
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Need Category</DialogTitle>
              <DialogDescription>
                Create a new need category to group products for specific customer needs.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter need category name..."
                value={newNeed}
                onChange={(e) => setNewNeed(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNeed} disabled={!newNeed.trim()} className="bg-[#60B5FF] hover:bg-[#4DA1E8]">
                Add Need
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingNeeds ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
        </div>
      ) : needs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No need categories found. Add your first need category to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={selectedNeed} onValueChange={setSelectedNeed} className="w-full">
          <TabsList className="mb-6 w-full h-auto flex flex-wrap">
            {needs.map((need) => (
              <TabsTrigger key={need.need} value={need.need} className="mb-2 mr-2">
                {need.need} ({need.count})
              </TabsTrigger>
            ))}
          </TabsList>

          {needs.map((need) => (
            <TabsContent key={need.need} value={need.need}>
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Products for "{need.need}"</h2>

                  {isLoadingProducts ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
                    </div>
                  ) : (
                    <FeaturedProductList
                      products={products}
                      onRemoveProduct={handleRemoveProduct}
                      isLoading={isLoadingProducts}
                      emptyMessage={`No products in the "${need.need}" section yet.`}
                    />
                  )}
                </CardContent>
              </Card>

              <h2 className="text-xl font-semibold mb-4">Add Products to "{need.need}"</h2>
              <ProductSelector onAddProducts={handleAddProducts} isLoading={isAdding} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

