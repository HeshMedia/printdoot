"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { productsApi } from "@/lib/api/products"

interface Product {
  product_id: string
  name: string
  price: number
  description: string
  main_image_url: string
  category_name: string
  average_rating: number
  status: string
}

interface ProductSelectorProps {
  onAddProducts: (productIds: string[]) => Promise<void>
  isLoading: boolean
}

export function ProductSelector({ onAddProducts, isLoading }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [page, setPage] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const pageSize = 10

  const fetchProducts = async (skip = 0) => {
    setIsLoadingProducts(true)
    try {
      const data = await productsApi.getProducts(skip, pageSize)
      setProducts(data.products)
      setTotalProducts(data.total)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchProducts(page * pageSize)
  }, [page])

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleAddSelected = async () => {
    if (selectedProducts.length === 0) return
    await onAddProducts(selectedProducts)
    setSelectedProducts([])
  }

  const nextPage = () => {
    if ((page + 1) * pageSize < totalProducts) {
      setPage(page + 1)
    }
  }

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: "Select",
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProducts.includes(row.original.product_id)}
          onCheckedChange={() => toggleProductSelection(row.original.product_id)}
        />
      ),
    },
    {
      accessorKey: "main_image_url",
      header: "Image",
      cell: ({ row }) => (
        <div className="relative h-12 w-12">
          <Image
            src={row.original.main_image_url || "/placeholder.svg?height=48&width=48"}
            alt={row.original.name}
            fill
            className="object-cover rounded-xl"
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `₹${row.original.price.toFixed(2)}`,
    },
    {
      accessorKey: "category_name",
      header: "Category",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      case "discontinued":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Select Products to Add</h3>
          <p className="text-sm text-gray-500">Browse through your products and select the ones you want to feature</p>
        </div>

        {isLoadingProducts ? (
          <div className="text-center py-8 text-gray-500">Loading products...</div>
        ) : (
          <>
            <DataTable columns={columns} data={products} pageSize={pageSize} />

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} of {Math.ceil(totalProducts / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={(page + 1) * pageSize >= totalProducts}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">{selectedProducts.length} products selected</div>
                <Button
                  onClick={handleAddSelected}
                  disabled={selectedProducts.length === 0 || isLoading}
                  className="bg-[#60B5FF] hover:bg-[#4DA1E8]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Selected Products
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
