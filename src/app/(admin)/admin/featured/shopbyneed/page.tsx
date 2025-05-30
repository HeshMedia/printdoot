"use client"

import { useState, useEffect } from "react"
import { Eye, Heart, Loader2, Plus, Search, Star, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { shopByNeedApi, type FeaturedProductResponse, type NeedResponse } from "@/lib/api/featured"
import { SectionHeader } from "@/components/features/featured/section-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function ShopByNeedPage() {
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "count">("count")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
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

  const handleDeleteNeed = async (need: string) => {
    try {
      await fetch(`${BASE_URL}/admin/shopbyneed/${encodeURIComponent(need)}`, {
        method: "DELETE",
      })

      toast({
        title: "Success",
        description: `Deleted need category "${need}"`,
      })

      fetchNeeds()
      if (selectedNeed === need) {
        setSelectedNeed("")
        setProducts([])
      }
    } catch (error) {
      console.error("Error deleting need:", error)
      toast({
        title: "Error",
        description: "Failed to delete need category",
        variant: "destructive",
      })
    }
  }

  const handleRemoveProduct = async () => {
    if (!selectedNeed || !productToDelete) return

    setIsLoadingProducts(true)
    try {
      await shopByNeedApi.remove(selectedNeed, productToDelete)
      toast({
        title: "Success",
        description: `Product removed from "${selectedNeed}" section`,
      })
      setProducts((prev) => prev.filter((p) => p.product_id !== productToDelete))
      setConfirmDialogOpen(false)
      setProductToDelete(null)
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

  const sortedNeeds = [...needs].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.need.localeCompare(b.need)
        : b.need.localeCompare(a.need)
    } else {
      return sortOrder === "asc"
        ? a.count - b.count
        : b.count - a.count
    }
  })

  return (
    <div className="max-w-6xl mx-auto px-4">
      <SectionHeader
        title="Shop By Need"
        description="Manage product categories based on customer needs"
        icon={<Heart className="h-6 w-6 text-[#60B5FF]" />}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Need Categories</h2>

        <Button 
          className="bg-[#60B5FF] hover:bg-[#4DA1E8]"
          asChild
        >
          <Link href="/admin/featured/shopbyneed/add">
            <Plus className="h-4 w-4 mr-2" />
            Add New Need Category
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          {isLoadingNeeds ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
            </div>
          ) : needs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No need categories found. Create your first need category to get started.</p>
              <Button 
                className="bg-[#60B5FF] hover:bg-[#4DA1E8]"
                asChild
              >
                <Link href="/admin/featured/shopbyneed/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Need Category
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Sort by: {sortBy === "name" ? "Name" : "Count"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy("name")}>
                        Sort by Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("count")}>
                        Sort by Count
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? "▲ Ascending" : "▼ Descending"}
                  </Button>
                </div>

                <span className="text-sm text-gray-500">
                  {needs.length} categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedNeeds.map((need) => (
                  <div
                    key={need.need}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedNeed === need.need ? "border-[#60B5FF] bg-blue-50" : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedNeed(need.need)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{need.need}</h3>
                      <Badge variant="secondary">{need.count}</Badge>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedNeed(need.need)
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View Products
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{need.need}" Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the "{need.need}" category and all product associations.
                              The products themselves won't be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={(e: { stopPropagation: () => void }) => {
                                e.stopPropagation()
                                handleDeleteNeed(need.need)
                              }}
                            >
                              Delete Category
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedNeed && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Products in "{selectedNeed}"</CardTitle>
                <CardDescription>
                  Products currently assigned to this need category
                </CardDescription>
              </div>
              <Button
                className="bg-[#60B5FF] hover:bg-[#4DA1E8]"
                asChild
              >
                <Link href="/admin/featured/shopbyneed/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Products
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#60B5FF]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No products in the "{selectedNeed}" section yet. Add products using the button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div key={product.product_id} className="border rounded-lg overflow-hidden group">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.main_image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <Link
                        href={`/products/${product.product_id}`}
                        className="font-medium text-sm line-clamp-2 hover:text-[#60B5FF] transition-colors"
                        target="_blank"
                      >
                        {product.name}
                      </Link>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-semibold">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-red-500 hover:text-red-600"
                              onClick={() => setProductToDelete(product.product_id)}
                            >
                              <Trash className="h-3.5 w-3.5 mr-1" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this product from the "{selectedNeed}" section?
                                This won't delete the product itself.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => {
                                  setProductToDelete(null)
                                  setConfirmDialogOpen(false)
                                }}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleRemoveProduct}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

