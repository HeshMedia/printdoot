"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { productsApi, type Product, type BulkPrice } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { reviewsApi, type Review } from "@/lib/api/reviews"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import ProductReviews from "@/components/product-reviews"
import WhatsAppButton from "@/components/whatsappbutton"
import RelatedProducts from "@/components/product/RelatedProducts"
import OnSaleProducts from "@/components/product/OnSaleProducts"
import Link from "next/link"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Heart,
  Info,
  Loader2,
  Package,
  Search,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  ZoomIn,
  Check,
} from "lucide-react"

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }
  const productId = id
  const router = useRouter()
  const { toast } = useToast()
  
  // Core state
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({})
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const imageRef = useRef<HTMLDivElement>(null)
  
  // Calculate the total price based on quantity
  const getUnitPrice = useCallback((qty: number): number => {
    if (!product) return 0
    
    const bulkPrices = product.bulk_prices || []
    for (let i = 0; i < bulkPrices.length; i++) {
      const { min_quantity, max_quantity, price } = bulkPrices[i]
      if (qty >= min_quantity && qty <= max_quantity) {
        return price
      }
    }
    
    if (bulkPrices.length > 0 && qty > bulkPrices[bulkPrices.length - 1].max_quantity) {
      return bulkPrices[bulkPrices.length - 1].price
    }
    
    return product.price
  }, [product])
  
  // Calculate shipping estimate based on product weight/dimensions
  const getShippingEstimate = useCallback((): string => {
    if (!product) return "Unknown"
    
    // This is a simplified calculation - in a real app, this would be 
    // more complex based on destination, carrier rules, etc.
    const weight = product.weight
    if (weight < 500) return "1-2 business days"
    else if (weight < 2000) return "2-3 business days"
    else return "3-5 business days"
  }, [product])
  
  // Fetch product data
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
  
  // Handle image zooming
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    
    setZoomPosition({ x, y })
  }
  
  // Handle custom quantity input validation
  const handleQuantityChange = (value: string) => {
    const numVal = parseInt(value)
    if (!isNaN(numVal) && numVal > 0) {
      setQuantity(numVal)
    } else if (value === '') {
      setQuantity(0)
    }
  }
  
  // Handle adding to cart with selected options
  const handleAddToCart = () => {
    if (!product) return
    
    // Validation - ensure all required customizations are selected
    const hasCustomization = !!category && Object.keys(category.allowed_customizations || {}).length > 0
    
    if (hasCustomization) {
      const requiredOptions = Object.keys(category.allowed_customizations)
      const missingOptions = requiredOptions.filter(opt => !selectedCustomizations[opt])
      
      if (missingOptions.length > 0) {
        toast({
          title: "Please select all options",
          description: `Please select: ${missingOptions.join(', ')}`,
          variant: "destructive",
        })
        return
      }
    }
    
    toast({
      title: "Product added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
      action: (
        <Button variant="outline" size="sm" onClick={() => router.push('/cart')}>
          View Cart
        </Button>
      ),
    })
    
    // In a real app, this would dispatch to your cart state management
    // e.g., dispatch(addToCart({ product, quantity, customizations: selectedCustomizations }))
  }
  
  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted 
        ? `${product?.name} has been removed from your wishlist` 
        : `${product?.name} has been added to your wishlist`,
    })
    
    // In a real app, dispatch wishlist action here
  }
  
  // Image carousel navigation
  const nextImage = () => {
    if (!product) return
    const images = [product.main_image_url, ...product.side_images_url]
    const nextIndex = (activeImageIndex + 1) % images.length
    setActiveImageIndex(nextIndex)
    setActiveImage(images[nextIndex])
  }
  
  const prevImage = () => {
    if (!product) return
    const images = [product.main_image_url, ...product.side_images_url]
    const prevIndex = (activeImageIndex - 1 + images.length) % images.length
    setActiveImageIndex(prevIndex)
    setActiveImage(images[prevIndex])
  }
  
  // Share product functionality
  const handleShareProduct = async () => {
    if (navigator.share && window) {
      try {
        await navigator.share({
          title: product?.name || 'Check out this product',
          text: product?.description || 'I found this awesome product',
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
        
        // Fallback - copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href)
          toast({
            title: "Link copied to clipboard",
            description: "You can now paste the link to share this product",
          })
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied to clipboard",
          description: "You can now paste the link to share this product",
        })
      }
    }
  }
  
  // Calculate basic data
  const hasCustomization = !!category && Object.keys(category.allowed_customizations || {}).length > 0
  const unitPrice = getUnitPrice(quantity)
  const totalPrice = unitPrice * quantity
  const shippingEstimate = getShippingEstimate()
  
  if (loading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading product details…</h2>
        <p className="text-muted-foreground mt-2">Just a moment while we fetch the latest information</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
          <p className="mb-4">{error || "We couldn't find the product you're looking for."}</p>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center text-sm">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
          <li>
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Products
            </Link>
          </li>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
              <li>
                <Link 
                  href={`/categories?category=${category.id}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
          <li className="font-medium text-foreground" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* — Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main image with zoom */}
          <div 
            ref={imageRef}
            className="bg-white rounded-xl shadow overflow-hidden aspect-square relative group"
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleImageMouseMove}
          >
            <Image
              src={activeImage || product.main_image_url}
              alt={product.name}
              fill
              priority
              className="object-contain p-4 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"
            />
            
            {/* Zoom overlay */}
            {showZoom && (
              <div className="absolute inset-0 bg-black/5 pointer-events-none">
                <ZoomIn className="absolute top-4 right-4 text-muted-foreground" />
              </div>
            )}
            
            {/* Image lightbox indicator */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[95vh] sm:h-[95vh]">
                <SheetHeader>
                  <SheetTitle>{product.name}</SheetTitle>
                  <SheetDescription>Image Gallery</SheetDescription>
                </SheetHeader>
                <div className="h-full flex justify-center items-center p-4">
                  <div className="relative h-full w-full">
                    <Image
                      src={activeImage || product.main_image_url}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Image navigation buttons */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-90 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-90 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {[product.main_image_url, ...product.side_images_url].map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveImage(img)
                  setActiveImageIndex(idx)
                }}
                className={`
                  relative flex-shrink-0
                  w-20 h-20
                  rounded-md overflow-hidden
                  border-2 transition-all
                  snap-start
                  ${activeImage === img ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"}
                `}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* — Right: Product Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            {/* Title & Price Section */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center">
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
                    <span className="ml-2 text-sm text-muted-foreground">
                      {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                  
                  <span className="text-muted-foreground">•</span>
                  
                  <Badge 
                    className="bg-green-500 hover:bg-green-600"
                    variant={
                      product.status === "in_stock" 
                        ? "default" 
                        : product.status === "out_of_stock" 
                        ? "destructive" 
                        : "outline"
                    }
                  >
                    {product.status === "in_stock" 
                      ? "In Stock" 
                      : product.status === "out_of_stock" 
                      ? "Out of Stock" 
                      : "Discontinued"}
                  </Badge>
                </div>
              </div>
              
              <div className="md:text-right">
                <div className="text-3xl font-bold text-primary">
                  ₹{unitPrice.toFixed(2)}
                </div>
                {quantity > 1 && (
                  <div className="text-sm text-muted-foreground">
                    ₹{product.price.toFixed(2)} per unit • {Math.round((1 - (unitPrice / product.price)) * 100)}% bulk discount
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
            
            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Dimensions</div>
                <div className="font-medium">
                  {product.dimensions.length} × {product.dimensions.breadth} × {product.dimensions.height} cm
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Weight</div>
                <div className="font-medium">{product.weight} g</div>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Material</div>
                <div className="font-medium">{product.material}</div>
              </div>
              
              <div className="bg-muted p-3 rounded-lg col-span-2 sm:col-span-3">
                <div className="text-xs text-muted-foreground">Shipping</div>
                <div className="font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Estimated delivery: {shippingEstimate}
                </div>
              </div>
            </div>
          </div>

          {/* Customization/Purchase Options */}
          <Card>
            <CardContent className="pt-6 space-y-5">
              {/* Quantity Selector */}
              <div className="flex flex-col">
                <label htmlFor="quantity" className="text-sm font-medium mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    min="1"
                    className="w-16 mx-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Bulk pricing tooltip */}
                  {product.bulk_prices.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="link" size="sm" className="ml-2 text-primary">
                            <Info className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Bulk discounts</span>
                            <span className="sm:hidden">Bulk</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="py-4">
                            <table className="w-full text-sm">
                              <thead className="border-b">
                                <tr>
                                  <th className="pb-2 text-left font-medium">Quantity</th>
                                  <th className="pb-2 text-right font-medium">Price/Unit</th>
                                  <th className="pb-2 text-right font-medium">Discount</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="py-2">1 - {product.bulk_prices[0]?.min_quantity - 1 || 'N/A'}</td>
                                  <td className="py-2 text-right">₹{product.price.toFixed(2)}</td>
                                  <td className="py-2 text-right">-</td>
                                </tr>
                                {product.bulk_prices.map((bp, index) => (
                                  <tr key={index} className={index < product.bulk_prices.length - 1 ? "border-b" : ""}>
                                    <td className="py-2">{bp.min_quantity} - {bp.max_quantity}</td>
                                    <td className="py-2 text-right">₹{bp.price.toFixed(2)}</td>
                                    <td className="py-2 text-right text-green-600">
                                      {Math.round((1 - (bp.price / product.price)) * 100)}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              
              {/* Customization Options */}
              {hasCustomization && (
                <div className="space-y-4">
                  <h3 className="font-medium">Customization Options</h3>
                  
                  {Object.entries(category.allowed_customizations).map(([optionName, values]) => (
                    <div key={optionName}>
                      <label className="block text-sm font-medium mb-2">
                        {optionName.charAt(0).toUpperCase() + optionName.slice(1)}
                      </label>
                      
                      {/* Different UI for different option types */}
                      {optionName.toLowerCase() === "color" ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(values).map(([value, colorCode], i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedCustomizations({
                                ...selectedCustomizations,
                                [optionName]: value
                              })}
                              className={`
                                w-8 h-8 rounded-full border-2
                                ${selectedCustomizations[optionName] === value 
                                  ? "border-primary ring-2 ring-primary/30" 
                                  : "border-gray-200"
                                }
                                transition-all
                              `}
                              style={{ backgroundColor: colorCode as string }}
                              title={value}
                            >
                              {selectedCustomizations[optionName] === value && (
                                <Check className="w-4 h-4 mx-auto text-white drop-shadow" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Select
                          value={selectedCustomizations[optionName] || ""}
                          onValueChange={(value) => setSelectedCustomizations({
                            ...selectedCustomizations, 
                            [optionName]: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${optionName}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(values).map(([value, extraInfo], i) => (
                              <SelectItem key={i} value={value}>
                                <span className="flex items-center justify-between w-full">
                                  <span>{value}</span>
                                  {extraInfo && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {extraInfo as string}
                                    </span>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Total Price */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 pt-2">
                <Button 
                  size="lg"
                  className="sm:col-span-5"
                  disabled={product.status !== "in_stock"}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                
          
                <Button 
                  size="lg"
                  variant="outline"
                  className="sm:col-span-1"
                  onClick={handleShareProduct}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* WhatsApp Link */}
          <WhatsAppButton />
        </div>
      </div>

      {/* Detailed Product Information Tabs */}
      <Tabs defaultValue="description" className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="border-b rounded-t-xl p-0 h-auto w-full flex-nowrap min-w-max">
            <TabsTrigger value="description" className="rounded-tl-xl py-2 px-3 sm:py-3 sm:px-6 whitespace-nowrap text-sm">
              Description
            </TabsTrigger>
            {hasCustomization && (
              <TabsTrigger value="customization" className="py-2 px-3 sm:py-3 sm:px-6 whitespace-nowrap text-sm">
                Customization
              </TabsTrigger>
            )}
            <TabsTrigger value="details" className="py-2 px-3 sm:py-3 sm:px-6 whitespace-nowrap text-sm">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="py-2 px-3 sm:py-3 sm:px-6 whitespace-nowrap text-sm">
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-tr-xl py-2 px-3 sm:py-3 sm:px-6 whitespace-nowrap text-sm">
              Shipping
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="description" className="p-6">
          <div className="prose prose-sm sm:prose max-w-none">
            <p>{product.description}</p>
          </div>
        </TabsContent>

        {hasCustomization && (
          <TabsContent value="customization" className="p-6">
            <h3 className="text-lg font-medium mb-6">Available Customization Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(category.allowed_customizations).map(([key, opts]) => (
                <div key={key} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-lg capitalize mb-3 pb-2 border-b">
                    {key}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(opts).map(([value, extraValue], i) => (
                      <div
                        key={i}
                        className="group relative px-3 py-2 rounded-lg text-sm 
                                 border transition-all duration-200 
                                 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300
                                 cursor-default"
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
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{value}</span>
                            <span className="text-xs text-muted-foreground">
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
            </div>
            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h4 className="flex items-center text-blue-800 font-medium mb-2">
                <Info className="mr-2 h-5 w-5" />
                How To Customize
              </h4>
              <p className="text-blue-700 text-sm">
                After adding this product to your cart, you'll be able to provide detailed customization
                instructions including text, images, or special requirements. Our team will work with 
                you to ensure your product is exactly as you envisioned.
              </p>
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="details" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Product Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Material</th>
                    <td className="py-2">{product.material}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Dimensions</th>
                    <td className="py-2">{`${product.dimensions.length} × ${product.dimensions.breadth} × ${product.dimensions.height} cm`}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Weight</th>
                    <td className="py-2">{product.weight} g</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Product ID</th>
                    <td className="py-2">{product.product_id}</td>
                  </tr>
                  <tr>
                    <th className="py-2 text-left font-medium text-muted-foreground">Category</th>
                    <td className="py-2">{product.category_name}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Bulk Pricing</h3>
              {product.bulk_prices.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="pb-2 text-left font-medium">Quantity Range</th>
                      <th className="pb-2 text-right font-medium">Price Per Unit</th>
                      <th className="pb-2 text-right font-medium">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">1 - {product.bulk_prices[0]?.min_quantity - 1 || 'N/A'}</td>
                      <td className="py-2 text-right">₹{product.price.toFixed(2)}</td>
                      <td className="py-2 text-right">-</td>
                    </tr>
                    {product.bulk_prices.map((bp, index) => (
                      <tr key={index} className={index < product.bulk_prices.length - 1 ? "border-b" : ""}>
                        <td className="py-2">{bp.min_quantity} - {bp.max_quantity}</td>
                        <td className="py-2 text-right">₹{bp.price.toFixed(2)}</td>
                        <td className="py-2 text-right text-green-600">
                          {Math.round((1 - (bp.price / product.price)) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted-foreground">No bulk pricing available for this product.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="p-6">
          <ProductReviews productId={product.product_id} reviews={reviews} />
        </TabsContent>
        
        <TabsContent value="shipping" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Information
              </h3>
              
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Delivery Time</h4>
                  <p className="text-sm">
                    Standard delivery: {shippingEstimate}
                    <br />
                    Express delivery: 1-2 business days (additional charges apply)
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Shipping Costs</h4>
                  <p className="text-sm">
                    Free shipping on orders above ₹499
                    <br />
                    Standard delivery: ₹49
                    <br />
                    Express delivery: ₹149
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">International Shipping</h4>
                  <p className="text-sm">
                    We currently ship to select countries. Please contact customer service for more information.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Returns & Refunds
              </h3>
              
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Return Policy</h4>
                  <p className="text-sm">
                    Returns accepted within 7 days of delivery for unused and unopened items in original packaging.
                    <br/><br/>
                    Please note that customized products cannot be returned unless there is a manufacturing defect.
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Refund Process</h4>
                  <p className="text-sm">
                    Refunds are processed within 5-7 business days after we receive and inspect the returned item.
                    The refund will be credited back to your original payment method.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Related Products Section */}
      <RelatedProducts productId={product.product_id} categoryName={product.category_name} />

      {/* On Sale Products Section */}
      <OnSaleProducts currentProductId={product.product_id} />
    </div>
  )
}