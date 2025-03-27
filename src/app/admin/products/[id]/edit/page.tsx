"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { productsApi, type Product } from "@/lib/api/admin/products"
import ProductForm from "@/components/admin/products/product-form"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getProduct(productId)
        setProduct(data)
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Failed to fetch product details")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="ml-2">Loading product...</p>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
  }

  if (!product) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        Product not found
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Product: {product.name}</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <ProductForm initialData={product} />
      </div>
    </div>
  )
}

