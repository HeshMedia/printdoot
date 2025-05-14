"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Loader2, Plus, Search, Star, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { shopByNeedApi, type FeaturedProductResponse } from "@/lib/api/featured"
import { SectionHeader } from "@/components/features/featured/section-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function AddShopByNeedPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [allProducts, setAllProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [newNeedName, setNewNeedName] = useState("")

  // Fetch all available products for selection
  const fetchAllProducts = async () => {
    setIsLoadingAllProducts(true)
    try {
      const response = await fetch(`${BASE_URL}/products?limit=100`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setAllProducts(data.products)
    } catch (error) {
      console.error("Error fetching all products:", error)
      toast({
        title: "Error",
        description: "Failed to load available products",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAllProducts(false)
    }
  }

  // Load products on page mount
  useEffect(() => {
    fetchAllProducts()
  }, [])

  // Toggle product selection for assignment
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  // Filter products based on search query
  const filteredAllProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Create a new need with selected products
  const handleCreateNeed = async () => {
    if (!newNeedName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the need category",
        variant: "destructive",
      })
      return
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      // 1. Create the new need category
      await fetch(`${BASE_URL}/admin/shopbyneed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ need: newNeedName.trim() }),
      })

      // 2. Assign products to the new need
      await shopByNeedApi.add(newNeedName.trim(), selectedProducts)
      
      toast({
        title: "Success",
        description: `Created new need category "${newNeedName}" with ${selectedProducts.length} products`,
      })
      
      // 3. Redirect to the main shop by need page
      router.push("/admin/featured/shopbyneed")
    } catch (error) {
      console.error("Error creating new need:", error)
      toast({
        title: "Error",
        description: `Failed to create new need category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <SectionHeader
        title="Add Shop By Need Category"
        description="Create a new need category and assign products"
        icon={<Heart className="h-6 w-6 text-[#60B5FF]" />}
      />

      {/* New Need Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New Need Category Details</CardTitle>
          <CardDescription>
            Enter information for the new need category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="needName" className="block text-sm font-medium mb-1">
                Need Category Name
              </label>
              <Input
                id="needName"
                placeholder="e.g., Back to School, Office Essentials, Study Material"
                value={newNeedName}
                onChange={(e) => setNewNeedName(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="pt-2">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <span className="font-medium">Selected Products:</span>
                <Badge variant="outline" className="ml-2">
                  {selectedProducts.length} products
                </Badge>
              </div>
              
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border mt-2">
                  {selectedProducts.map((id) => {
                    const product = allProducts.find((p) => p.product_id === id)
                    return (
                      <Badge key={id} variant="secondary" className="flex gap-1 items-center">
                        {product?.name || id}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => toggleProductSelection(id)}
                        />
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/featured/shopbyneed")}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNeed}
                disabled={isCreating || !newNeedName.trim() || selectedProducts.length === 0}
                className="bg-[#60B5FF] hover:bg-[#4DA1E8]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Need Category
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Selection */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Select Products</CardTitle>
              <CardDescription>
                Choose products to include in this need category
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products by name, ID, or category..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoadingAllProducts ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
              </div>
            ) : allProducts.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAllProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                          No products match your search criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAllProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.product_id)

                        return (
                          <TableRow
                            key={product.product_id}
                            className={`${isSelected ? "bg-blue-50" : ""}`}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleProductSelection(product.product_id)}
                                className="h-4 w-4 rounded border-gray-300 text-[#60B5FF] focus:ring-[#60B5FF]"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="relative h-12 w-12 rounded overflow-hidden">
                                <Image
                                  src={product.main_image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium line-clamp-1">{product.name}</div>
                            </TableCell>
                            <TableCell>{product.category_name}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                {product.product_id}
                              </code>
                            </TableCell>
                            <TableCell>₹{product.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-1">{product.average_rating.toFixed(1)}</span>
                                <Star
                                  className={`h-3.5 w-3.5 ${
                                    product.average_rating > 0
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}