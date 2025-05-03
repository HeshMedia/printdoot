"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { productsApi, type Product, type BulkPrice } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { reviewsApi, type Review } from "@/lib/api/reviews"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Loader2, ChevronRight } from "lucide-react"
import Link from "next/link"
import ProductReviews from "@/components/product-reviews"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)

        const productData = await productsApi.getProduct(productId)
        setProduct(productData)
        setActiveImage(productData.main_image_url)

        const { categories } = await categoriesApi.getCategories()
        const matchedCategory = categories.find((c) => c.name === productData.category_name)
        setCategory(matchedCategory || null)

        const reviewsData = await reviewsApi.getReviews(productId)
        setReviews(reviewsData)

        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch product data:", err)
        setError("Failed to load product details. Please try again.")
        setLoading(false)
      }
    }

    fetchProductData()
  }, [productId])

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading product details...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error || "Product not found"}</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/categories?category=${category?.id}`} className="hover:text-foreground">
          {product.category_name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="relative h-[400px] rounded-xl overflow-hidden mb-4">
            <Image
              src={activeImage || product.main_image_url || "/placeholder.svg?height=400&width=400"}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[product.main_image_url, ...product.side_images_url].map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(image)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 ${
                  activeImage === image ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.average_rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : i < product.average_rating
                    ? "text-yellow-400 fill-yellow-400 opacity-50"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              ({product.average_rating.toFixed(1)}) · {reviews.length} reviews
            </span>
          </div>

          <div className="text-2xl font-bold mb-2">₹{product.price.toFixed(2)}</div>

          <div className="mb-4">
            <span
              className={`inline-block text-sm px-3 py-1 rounded-full ${
                product.status === "in_stock"
                  ? "bg-green-100 text-green-800"
                  : product.status === "out_of_stock"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {product.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>

          <p className="text-muted-foreground mb-4">{product.description}</p>
          
            <div className="text-sm text-muted-foreground mb-2">
              <strong>Dimensions:</strong>{" "}
              {product.dimensions
                ? `${product.dimensions.length} x ${product.dimensions.breadth} x ${product.dimensions.height} cm`
                : "Not specified"}
            </div>


          {product.bulk_prices?.length > 0 && (
            <div className="text-sm text-muted-foreground mb-6">
              <strong>Bulk Prices:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {product.bulk_prices.map((bp: BulkPrice, index: number)=> (
                  <li key={index}>
                    {bp.quantity} units: ₹{bp.price.toFixed(2)} 
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.status === "in_stock" && (
            <Button size="lg" className="w-full bg-btncolor text-black hover:bg-btnhover">
              <Link href={`/products/${product.product_id}/customize`} className="w-full">
                Customize Now
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="description">
        <TabsList className="w-full border-b">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="customization">Customization Options</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="py-4">
          <p>{product.description}</p>
        </TabsContent>

        <TabsContent value="customization" className="py-4">
          {category ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Available Customization Options</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Personalization Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.user_customization_options.map((option, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>

                {Object.keys(category.allowed_customizations).length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Customization Options</h4>
                    <div className="space-y-4">
                      {Object.entries(category.allowed_customizations).map(([key, values]) => (
                        <div key={key}>
                          <h5 className="text-sm font-medium">{key}</h5>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {values.map((value, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No customization options available for this product.</p>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="py-4">
          <ProductReviews productId={product.product_id} reviews={reviews} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
