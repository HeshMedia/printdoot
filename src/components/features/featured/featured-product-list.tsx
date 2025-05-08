"use client"

import { useState } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { FeaturedProductResponse } from "@/lib/api/featured"
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

interface FeaturedProductListProps {
  products: FeaturedProductResponse[]
  onRemoveProduct: (productId: string) => Promise<void>
  isLoading: boolean
  emptyMessage?: string
}

export function FeaturedProductList({
  products,
  onRemoveProduct,
  isLoading,
  emptyMessage = "No products in this featured section yet.",
}: FeaturedProductListProps) {
  const [productToRemove, setProductToRemove] = useState<string | null>(null)

  const handleRemove = async () => {
    if (productToRemove) {
      await onRemoveProduct(productToRemove)
      setProductToRemove(null)
    }
  }

  const columns: ColumnDef<FeaturedProductResponse>[] = [
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
      accessorKey: "average_rating",
      header: "Rating",
      cell: ({ row }) => row.original.average_rating.toFixed(1),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProductToRemove(row.original.product_id)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Featured Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{row.original.name}" from this featured section? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToRemove(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove} className="bg-red-500 hover:bg-red-600">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ]

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={products} />
}

