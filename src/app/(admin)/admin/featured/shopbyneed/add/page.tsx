"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Loader2, Plus, Search, Star, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { shopByNeedApi, type FeaturedProductResponse, type NeedResponse } from "@/lib/api/featured"
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
  const [existingNeeds, setExistingNeeds] = useState<NeedResponse[]>([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(false)
  const [isExistingNeed, setIsExistingNeed] = useState(false)
  // Fetch all existing needs
  const fetchExistingNeeds = async () => {
    setIsLoadingNeeds(true)
    try {
      const data = await shopByNeedApi.getNeeds()
      setExistingNeeds(data.needs)
    } catch (error) {
      console.error("Error fetching existing needs:", error)
      toast({
        title: "Error",
        description: "Failed to load existing need categories",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNeeds(false)
    }
  }

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
  useEffect(() => {
    // Check for URL parameters
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const needParam = searchParams.get("need");
      
      if (needParam) {
        setNewNeedName(needParam);
        setIsExistingNeed(true);
        
        // Set the page title
        document.title = `Add Products to ${needParam} - Printdoot Admin`;
      }
    }
  }, []);

  // Load products and needs on page mount
  useEffect(() => {
    fetchAllProducts()
    fetchExistingNeeds()
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
  // Handle adding products to a need (new or existing)
  const handleCreateNeed = async () => {
    if (!newNeedName.trim()) {
      toast({
        title: "Error",
        description: "Please enter or select a need category name",
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
      // If creating a new need, create it first before adding products
      if (!isExistingNeed) {
        await fetch(`${BASE_URL}/admin/shopbyneed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ need: newNeedName.trim() }),
        })
      }

      // Assign products to the need (works for both new and existing)
      await shopByNeedApi.add(newNeedName.trim(), selectedProducts)
      
      toast({
        title: "Success",
        description: isExistingNeed 
          ? `Added ${selectedProducts.length} products to "${newNeedName}"`
          : `Created new need category "${newNeedName}" with ${selectedProducts.length} products`,
      })
      
      // Redirect to the main shop by need page
      router.push("/admin/featured/shopbyneed")
    } catch (error) {
      console.error(`Error ${isExistingNeed ? 'updating' : 'creating'} need:`, error)
      toast({
        title: "Error",
        description: isExistingNeed
          ? `Failed to add products to need category: ${error instanceof Error ? error.message : 'Unknown error'}`
          : `Failed to create need category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4">      <SectionHeader
        title={isExistingNeed ? `Add Products to "${newNeedName}"` : "Add Shop By Need Category"}
        description={isExistingNeed ? "Add more products to the selected need category" : "Create a new need category and assign products"}
        icon={<Heart className="h-6 w-6 text-[#60B5FF]" />}
      />

      {/* New Need Details */}      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Need Category Details</CardTitle>
          <CardDescription>
            Select an existing need category or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">            <div className="flex items-center space-x-3 mb-4">
              <Button 
                variant={!isExistingNeed ? "default" : "outline"} 
                size="sm"
                className={`font-medium transition-all ${
                  !isExistingNeed 
                    ? "bg-[#60B5FF] hover:bg-[#4DA1E8] shadow-sm" 
                    : "hover:border-[#60B5FF]"
                }`}
                onClick={() => setIsExistingNeed(false)}
              >
                {!isExistingNeed && <span className="mr-1">✓</span>} Create New
              </Button>
              <Button 
                variant={isExistingNeed ? "default" : "outline"} 
                size="sm"
                className={`font-medium transition-all ${
                  isExistingNeed 
                    ? "bg-[#60B5FF] hover:bg-[#4DA1E8] shadow-sm" 
                    : "hover:border-[#60B5FF]"
                }`}
                onClick={() => setIsExistingNeed(true)}
              >
                {isExistingNeed && <span className="mr-1">✓</span>} Select Existing
              </Button>
            </div>

            {isExistingNeed ? (
              <div>
                <label htmlFor="existingNeed" className="block text-sm font-medium mb-1">
                  Select Existing Need Category
                </label>                {isLoadingNeeds ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading need categories...</span>
                  </div>
                ) : existingNeeds.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {existingNeeds.map((need) => {
                      const isSelected = newNeedName === need.need;
                      return (
                        <div
                          key={need.need}
                          onClick={() => setNewNeedName(need.need)}
                          className={`border rounded-lg p-2 cursor-pointer transition-all ${
                            isSelected 
                              ? "border-[#60B5FF] bg-blue-50 ring-2 ring-[#60B5FF] ring-opacity-50" 
                              : "hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`${isSelected ? "font-bold" : "font-medium"} text-sm`}>
                              {need.need}
                            </span>
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                              {need.count}
                            </Badge>
                          </div>
                          {isSelected && (
                            <div className="mt-1 text-xs text-blue-600">
                              ✓ Selected
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No existing need categories found</div>
                )}
              </div>
            ) : (
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
            )}
            
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
              </Button>              <Button
                onClick={handleCreateNeed}
                disabled={isCreating || !newNeedName.trim() || selectedProducts.length === 0}
                className="bg-[#60B5FF] hover:bg-[#4DA1E8]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isExistingNeed ? "Adding products..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {isExistingNeed ? "Add Products to Need" : "Create Need Category"}
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