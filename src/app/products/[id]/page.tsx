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
import WhatsAppButton from "@/components/whatsappbutton"

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }
  const productId = id
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  {/* Use useEffect to add click outside listener */}
  {useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.getElementById('qtyDropdown');
      const inputElement = document.getElementById('qty');
      if (dropdown && !dropdown.contains(event.target as Node) && event.target !== inputElement) {
        dropdown.classList.add('hidden');
      }
    }
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [])}

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const p = await productsApi.getProduct(productId)
        setProduct(p)
        setActiveImage(p.main_image_url)

        if (p.category_name) {
          const { categories } = await categoriesApi.getCategories()
          setCategory(categories.find(c => c.name === p.category_name) || null)
        }

        setReviews(await reviewsApi.getReviews(productId))
      } catch (err) {
        console.error(err)
        setError("Failed to load product details.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId])

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading product details…</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error || "Product not found"}
        </div>
      </div>
    )
  }


  function getUnitPrice(qty: number): number {
    for (let i = 0; i < bulkPrices.length; i++) {
      const { min_quantity, max_quantity, price } = bulkPrices[i]
      if (qty >= min_quantity && qty <= max_quantity) {
        return price
      }
    }
    if (bulkPrices.length > 0 && qty > bulkPrices[bulkPrices.length - 1].max_quantity) {
      return bulkPrices[bulkPrices.length - 1].price
    }
    return product!.price
  }

  const hasCustomization =
    !!category && Object.keys(category.allowed_customizations || {}).length > 0

  const bulkPrices = product.bulk_prices as BulkPrice[]
  const unitPrice = getUnitPrice(quantity)
  const totalPrice = unitPrice * quantity

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="bg-white rounded-xl px-4 py-2 text-sm text-muted-foreground flex items-center gap-1 shadow-sm">
        <Link href="/">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products">Products</Link>
        {category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/categories?category=${category.id}`}>{category.name}</Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      {/* Main two-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* — Left: Images */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow overflow-hidden h-[400px] relative">
            <Image
              src={activeImage || product.main_image_url}
              alt={product.name}
              fill
              className="object-contain rounded-xl"
              sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[product.main_image_url, ...product.side_images_url].map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`
                  relative
                  w-20 h-20
                  rounded-xl overflow-hidden
                  border-2 ${activeImage === img ? "border-primary" : "border-transparent"}
                `}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover rounded-xl"
                />
              </button>
            ))}
          </div>
        </div>

        {/* — Right: Info Card */}
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {/* Quantity & Bulk Pricing */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <label htmlFor="qty" className="block text-sm font-medium mb-1">Quantity</label>
              <div className="relative">
                <input
                  id="qty"
                  type="text"
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setQuantity(0);
                    } else {
                      const numVal = parseInt(val);
                      if (!isNaN(numVal)) {
                        setQuantity(numVal);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (quantity === 0) setQuantity(1);
                  }}
                  className="w-20 pl-3 pr-8 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-left appearance-none"
                  onClick={() => {
                    const dropdown = document.getElementById('qtyDropdown');
                    dropdown?.classList.toggle('hidden');
                  }}
                />
                <div 
                  className="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer"
                  onClick={() => {
                    const dropdown = document.getElementById('qtyDropdown');
                    dropdown?.classList.toggle('hidden');
                  }}
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <div 
                  id="qtyDropdown"
                  className="hidden absolute z-10 mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${quantity === i + 1 ? 'bg-gray-100' : ''}`}
                      onClick={() => {
                        setQuantity(i + 1);
                        document.getElementById('qtyDropdown')?.classList.add('hidden');
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {bulkPrices.length > 0 && (
              <div className="relative">
                <button
                  type="button" 
                  onClick={() => {
                    const bulkPopover = document.getElementById('bulkPricePopover');
                    bulkPopover?.classList.toggle('hidden');
                    // Close when clicking outside
                    const clickHandler = (e: MouseEvent) => {
                      const target = e.target as Node | null;
                      if (!bulkPopover!.contains(target) && (target as HTMLElement)?.id !== 'bulkPriceButton') {
                        bulkPopover?.classList.add('hidden');
                        document.removeEventListener('mousedown', clickHandler);
                      }
                    };
                    document.addEventListener('mousedown', clickHandler);
                  }}
                  id="bulkPriceButton"
                  className="text-sm font-medium text-primary "
                >
                  View Bulk Pricing Discounts
                </button>
               
                <div 
                  id="bulkPricePopover"
                  className="hidden absolute rounded-xl z-10 mt-1 right-0 w-64 bg-white border border-gray-200  shadow-lg p-3"
                >
                  <h4 className="font-medium mb-2">Bulk Pricing</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {bulkPrices.map((bp, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{bp.min_quantity}–{bp.max_quantity} pcs: </span>
                        <span>₹{bp.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <WhatsAppButton/>
          {/* Price & Status */}
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold">₹{unitPrice.toFixed(2)}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                product.status === "in_stock"
                  ? "bg-green-100 text-green-800"
                  : product.status === "out_of_stock"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {product.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div className="text-lg font-medium">Total: ₹{totalPrice.toFixed(2)}</div>

          {/* Rating */}
          <div className="flex items-center gap-1">
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
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 rounded-xl">{product.description}</p>

          {/* Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="bg-gray-50 rounded-xl p-2">
              <strong>Dimensions:</strong>{" "}
              {`${product.dimensions.length} × ${product.dimensions.breadth} × ${product.dimensions.height} cm`}
            </div>
            <div className="bg-gray-50 rounded-xl p-2">
              <strong>Weight:</strong> {product.weight} g
            </div>
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-2">
              <strong>Material:</strong> {product.material}
            </div>
          </div>

          {/* Customize Button */}
          {product.status === "in_stock" && (
            <Button size="lg" className="w-full rounded-xl">
              <Link href={`/products/${product.product_id}/customize`} className="w-full">
                Customize Now
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="bg-white rounded-xl shadow">
        <TabsList className="border-b rounded-xl">
          <TabsTrigger value="description" className="rounded-xl">
            Description
          </TabsTrigger>
          {hasCustomization && (
            <TabsTrigger value="customization" className="rounded-xl">
              Customization
            </TabsTrigger>
          )}
          <TabsTrigger value="reviews" className="rounded-xl">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="p-6 rounded-xl">
          <p className="text-gray-700">{product.description}</p>
        </TabsContent>

        {hasCustomization && category && (
        <TabsContent value="customization" className="p-6 rounded-b-lg">
          <h3 className="text-lg font-medium mb-4">Available Options</h3>
          {Object.entries(category.allowed_customizations).map(([key, opts]) => (
            <div key={key} className="mb-4">
              <h5 className="block text-sm font-semibold text-gray-700 capitalize">{key}</h5>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(opts).map(([value, extraValue], i) => (
                  <div
                    key={i}
                    className="group relative px-3 py-1 rounded-full text-sm border transition-all duration-200 bg-gray-100 text-gray-700 border-gray-300 cursor-pointer"
                  >
                    {key.toLowerCase() === "color" ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: extraValue as string }}
                        />
                        <span>{value}</span>
                      </div>
                    ) : key.toLowerCase() === "size" ? (
                      <div className="flex flex-col items-center transition-all duration-200 group-hover:scale-110">
                        <span className="font-medium">{value}</span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {extraValue}
                        </span>
                      </div>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      )}

        <TabsContent value="reviews" className="p-6 rounded-xl">
          <ProductReviews productId={product.product_id} reviews={reviews} />
        </TabsContent>
      </Tabs>
    </div>
  )
}