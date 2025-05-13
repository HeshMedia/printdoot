"use client"

import { useState, useEffect} from "react"
import { useParams, useRouter } from "next/navigation"
import { productsApi, type Product } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { reviewsApi, type Review } from "@/lib/api/reviews"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import ProductReviews from "@/components/product-reviews"
import WhatsAppButton from "@/components/whatsappbutton"
import RelatedProducts from "@/components/product/RelatedProducts"
import OnSaleProducts from "@/components/product/OnSaleProducts"
import QuantitySelector from "@/components/product/QuantitySelector"

import ProductHeader from "@/components/product/ProductHeader"
import ProductGallery from "@/components/product/ProductGallery"
import ProductPricing from "@/components/product/ProductPricing" 
import ProductDelivery from "@/components/product/ProductDelivery"
import ProductDimensions from "@/components/product/ProductDimensions"
import ProductCustomization from "@/components/product/ProductCustomization"

import Link from "next/link"
import {
  Loader2,
  Package,
  Share2,
  ShoppingCart,
  Truck,
} from "lucide-react"

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }
  const productId = id
  const router = useRouter()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({})
  
  // Fetch product data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const p = await productsApi.getProduct(productId)
        setProduct(p)

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
  
  // Handle adding to cart with selected options
  const handleAddToCart = () => {
    if (!product) return
    
    // Validation - ensure all required customizations are selected
    const customizationOptions = product?.customization_options
    const hasCustomization = customizationOptions && Object.keys(customizationOptions).length > 0
    
    if (hasCustomization) {
      const requiredOptions = Object.keys(customizationOptions)
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
  
  // Handle share product functionality
 const handleShareProduct = async () => {
  if (navigator.share && window) {
    try {
      // First check if we can share files
      const imageUrl = product?.main_image_url 
      
      // Only attempt to share image if it exists and the browser supports file sharing
      if (imageUrl && navigator.canShare && navigator.canShare({ files: [] })) {
        // Fetch the image and convert to a file
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const imageFile = new File([blob], 'product-image.jpg', { type: blob.type });
        
        await navigator.share({
          title: product?.name || 'Check out this product',
          text: product?.description || 'I found this awesome product',
          url: window.location.href,
          files: [imageFile]
        });
      } else {
        // Fall back to sharing without an image
        await navigator.share({
          title: product?.name || 'Check out this product',
          text: product?.description || 'I found this awesome product',
          url: window.location.href,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      // Fallback - copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          description: "You can now paste the link to share this product",
        });
      }
    }
  } else {
    // Fallback for browsers that don't support Web Share API
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "You can now paste the link to share this product",
      });
    }
  }
};
  
  // Calculate basic data
  const customizationOptions = product?.customization_options
  const hasCustomization = customizationOptions && Object.keys(customizationOptions).length > 0
  
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
      {/* Header with breadcrumb and product title */}
      <ProductHeader 
        product={product} 
        category={category} 
        reviewCount={reviews.length}
      />

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* — Left: Image Gallery */}
        <ProductGallery 
          mainImageUrl={product.main_image_url}
          sideImagesUrl={product.side_images_url}
          productName={product.name}
        />

        {/* — Right: Product Info */}
        <div className="space-y-6">
          {/* Product description - moved to top of right column */}
          <div>
            <h2 className="text-lg font-medium mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>
          </div>
          
          {/* Basic Info with Pricing */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Product pricing component */}
            <ProductPricing 
              price={product.price}
              bulkPrices={product.bulk_prices}
              quantity={quantity}
            />
          </div>
           {/* WhatsApp Link */}
          <WhatsAppButton />
          
          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(() => {
              // Handle dimensions regardless of format
              const dimensionsArray = Array.isArray(product.dimensions) 
                ? product.dimensions 
                : [product.dimensions];
              
              const validDimensions = dimensionsArray.filter(dim => 
                dim && (dim.length || dim.breadth || dim.height || dim.radius)
              );
              
              if (validDimensions.length > 0) {
                const primaryDimension = validDimensions[0];
                
                // Format dimension values, omitting those that are 0 or undefined
                const formatDimension = (value?: number) => {
                  if (!value || value === 0) return '';
                  return `${value} cm`;
                };
                
                // Build the dimensions string
                let dimensionString = '';
                
                if (primaryDimension.radius) {
                  dimensionString = `${formatDimension(primaryDimension.radius)} (radius)`.trim();
                } else {
                  const length = formatDimension(primaryDimension.length);
                  const breadth = formatDimension(primaryDimension.breadth);
                  const height = formatDimension(primaryDimension.height);
                  
                  const parts = [length, breadth, height].filter(part => part !== '');
                  dimensionString = parts.join(' × ');
                }
                
                // Only show dimensions card if there are valid dimensions to display
                if (dimensionString) {
                  return (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Dimensions</div>
                      <div className="font-medium">{dimensionString}</div>
                    </div>
                  );
                }
              }
              return null;
            })()}
            
            {product.weight && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Weight</div>
                <div className="font-medium">{product.weight} g</div>
              </div>
            )}
            
            {product.material && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Material</div>
                <div className="font-medium">{product.material}</div>
              </div>
            )}
            
           
          </div>
          
          {/* Product dimensions */}
          <ProductDimensions 
            dimensions={product.dimensions}
            weight={product.weight}
            material={product.material}
          />
         
         
          <ProductDelivery 
            standardDeliveryTime={product.standard_delivery_time}
            expressDeliveryTime={product.express_delivery_time}
            bulkPrices={product.bulk_prices}
            weight={product.weight}
            quantity={quantity}
          />

          {/* Customization/Purchase Options */}
          <Card>
            <CardContent className="pt-6 space-y-5">
              {/* Quantity Selector */}
              <div className="flex flex-col">

                <QuantitySelector 
                  quantity={quantity} 
                  setQuantity={setQuantity} 
                  bulkPrices={product.bulk_prices}
                />
              </div>
              
              {/* Customization Options */}
              {hasCustomization && (
                <ProductCustomization
                  customizationOptions={customizationOptions}
                  selectedCustomizations={selectedCustomizations}
                  setSelectedCustomizations={setSelectedCustomizations}
                />
              )}
              
              {/* Total Price */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blu">Total Price:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 pt-2">
                <Button 
                  size="lg"
                  className="sm:col-span-5 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={product.status !== "in_stock"}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                
               <button 
                  className="inline-flex items-center hover:text-black hover:bg-blue-100  justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={handleShareProduct}
                >
                  <Share2  className="h-5 w-5 font-thin text-muted-foreground " />
        
                </button>
              </div>
            </CardContent>
          </Card>
          
          
        </div>
      </div>

      {/* Detailed Product Information Tabs */}
      <Tabs defaultValue="details" className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="border-b rounded-t-xl p-0 h-auto w-full flex-nowrap min-w-max">

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

       
        
        <TabsContent value="details" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Product Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Material</th>
                    <td className="py-2">{product.material || "Specification unavailable"}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Dimensions</th>
                    <td className="py-2">
                      {(() => {
                        // Handle dimensions regardless of format
                        const dimensionsArray = Array.isArray(product.dimensions) 
                          ? product.dimensions 
                          : [product.dimensions];
                        
                        // Filter out empty dimension objects
                        const validDimensions = dimensionsArray.filter(dim => 
                          dim && (dim.length || dim.breadth || dim.height || dim.radius)
                        );
                        
                        if (validDimensions.length === 0) {
                          return "Dimensions unavailable";
                        }
                        
                        // Helper function to format dimensions without showing 0 values
                        const formatDimension = (value?: number) => {
                          if (!value || value === 0) return '';
                          return `${value} cm`;
                        }

                        // Helper function to build dimensions string
                        const buildDimensionsString = (dim: any) => {
                          if (dim.radius) {
                            return `${formatDimension(dim.radius)} (radius)`.trim();
                          }
                          
                          const length = formatDimension(dim.length);
                          const breadth = formatDimension(dim.breadth);
                          const height = formatDimension(dim.height);
                          
                          // Create array of non-empty dimension values
                          const parts = [length, breadth, height].filter(part => part !== '');
                          
                          // If no parts are valid, return empty string
                          if (parts.length === 0) return '';
                          
                          // Join parts with the × symbol
                          return parts.join(' × ');
                        };
                        
                        return validDimensions.map((dim, i) => {
                          // Get formatted dimensions string
                          const dimensionsString = buildDimensionsString(dim);
                          
                          // Skip this dimension if string is empty
                          if (!dimensionsString) return null;
                          
                          return (
                            <div key={i} className={i > 0 ? "mt-2 pt-2 border-t" : ""}>
                              {dim.label && <span className="text-xs text-muted-foreground block">{dim.label}:</span>}
                              {dimensionsString}
                            </div>
                          );
                        });
                      })()}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Weight</th>
                    <td className="py-2">{product.weight ? `${product.weight} g` : "Specification unavailable"}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Product ID</th>
                    <td className="py-2">{product.product_id || "N/A"}</td>
                  </tr>
                  <tr>
                    <th className="py-2 text-left font-medium text-muted-foreground">Category</th>
                    <td className="py-2">{product.category_name || "Uncategorized"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Bulk Pricing</h3>
              {Array.isArray(product.bulk_prices) && product.bulk_prices.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="pb-2 text-left font-medium">Quantity Range</th>
                      <th className="pb-2 text-right font-medium">Price Per Unit</th>
                      <th className="pb-2 text-right font-medium">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    
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
                <Package className="h-5 w-5 mr-2" />
                Shipping Information
              </h3>
              
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Delivery Time</h4>
                  <p className="text-sm">
                    Standard delivery: {product.standard_delivery_time || "3-5 "} business days
                    <br />
                    Express delivery: {product.express_delivery_time || "1-2 "} buisness days (additional charges apply)
                  </p>
                </div>                  <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    Shipping Costs
                  </h4>


                  {Array.isArray(product.bulk_prices) && product.bulk_prices.length > 0 ? (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Shipping costs by Bulk Quantity:</h5>
                      <table className="w-full text-sm border-collapse">
                        <thead className="border-b">
                          <tr>
                            <th className="pb-2 text-left font-medium">Quantity Range</th>
                            <th className="pb-2 text-right font-medium">Standard</th>
                            <th className="pb-2 text-right font-medium">Express</th>
                           
                          </tr>
                        </thead>
                        <tbody>
                          {product.bulk_prices.map((bp, index) => {
                            // Calculate if this range qualifies for free shipping
                            const orderValue = bp.min_quantity * product.price;
                            const freeShipping = bp.standard_delivery_price === 0 ;
                            
                            return (
                              <tr key={index} className={index < product.bulk_prices.length - 1 ? "border-b" : ""}>
                                <td className="py-2">{bp.min_quantity} - {bp.max_quantity}</td>
                                <td className={`py-2 text-right ${freeShipping ? 'text-green-600 font-medium' : ''}`}>
                                  {freeShipping ? 'FREE' : `₹${bp.standard_delivery_price ?? "Contact Us"}`}
                                </td>
                                <td className="py-2 text-right">₹{bp.express_delivery_price ?? "Contact Us"}</td>
                                
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                     
                    </div>
                  ) : (
                    <div>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 font-medium">Standard delivery:</td>
                            <td className="py-2 text-right">₹{product.bulk_prices?.[0]?.standard_delivery_price ?? 49}</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">Express delivery:</td>
                            <td className="py-2 text-right">₹{product.bulk_prices?.[0]?.express_delivery_price ?? 149}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
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