"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAtom } from "jotai"
import Image from "next/image"
import Link from "next/link"
import { 
  cartItemsAtom, 
  cartTotalAtom, 
  updateCartItemQuantityAtom, 
  removeCartItemAtom, 
  applyDiscountCodeAtom,
  getImageFromIndexedDBAtom,
  clearCartAtom
} from "@/lib/atoms/cartAtoms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
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
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  Minus, 
  Plus,
  Tag,
  ChevronRight,
  Info,
  RefreshCw,
  AlertCircle,
  LayoutGrid
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge" // Import Badge component

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Atoms
  const [cartItems, setCartItems] = useAtom(cartItemsAtom)
  const [cartTotal] = useAtom(cartTotalAtom)
  const [, updateCartItemQuantity] = useAtom(updateCartItemQuantityAtom)
  const [, removeCartItem] = useAtom(removeCartItemAtom)
  const [, applyDiscount] = useAtom(applyDiscountCodeAtom) 
  const [, getImageFromIndexedDB] = useAtom(getImageFromIndexedDBAtom)
  const [, clearCart] = useAtom(clearCartAtom)
  
  // Local state
  const [loadingImages, setLoadingImages] = useState(true)
  const [discountCode, setDiscountCode] = useState("")
  const [applyingDiscount, setApplyingDiscount] = useState(false)
  const [showDesignImages, setShowDesignImages] = useState(true)
  const [showGroupedView, setShowGroupedView] = useState(false)
  const [itemImagesToShow, setItemImagesToShow] = useState<Record<string, string>>({})
  
  // Load design images from IndexedDB
  useEffect(() => {
    const loadImages = async () => {
      if (cartItems.length === 0) {
        setLoadingImages(false)
        return
      }
      
      setLoadingImages(true)
      const itemsWithDesigns = cartItems.filter(item => item.userCustomization?.design_id)
      
      if (itemsWithDesigns.length === 0) {
        setLoadingImages(false)
        return
      }
      
      const images: Record<string, string> = {}
      
      for (const item of itemsWithDesigns) {
        const designId = item.userCustomization?.design_id
        if (designId) {
          try {
            const imageUrl = await getImageFromIndexedDB(designId)
            if (imageUrl) {
              images[item.id] = imageUrl
            }
          } catch (error) {
            console.error(`Failed to load image for design ${designId}:`, error)
          }
        }
      }
      
      setItemImagesToShow(images)
      setLoadingImages(false)
    }
    
    loadImages()
  }, [cartItems, getImageFromIndexedDB])
  
  // Functions to handle cart actions
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateCartItemQuantity({ itemId, quantity: newQuantity })
  }
  
  const handleRemoveItem = (itemId: string) => {
    removeCartItem(itemId)
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
      duration: 3000
    })
  }
  
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a discount code",
        duration: 3000
      })
      return
    }
    
    setApplyingDiscount(true)
    const success = await applyDiscount(discountCode.trim())
    setApplyingDiscount(false)
    
    if (success) {
      toast({
        title: "Discount applied",
        description: `Discount code ${discountCode} has been applied to your cart.`,
        duration: 3000
      })
    } else {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "The discount code you entered is invalid.",
        duration: 3000
      })
    }
  }
  
  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
      duration: 3000
    })
  }
  
  const handleCheckout = () => {
    // Navigate to checkout or address page
    router.push("/checkout/address")
  }
    // Group items by product for clearer display in the cart
  const getItemsByProduct = () => {
    // Create a dictionary to group items by product_id
    const productGroups: Record<string | number, typeof cartItems> = {};
    
    cartItems.forEach(item => {
      const productId = item.product.product_id;
      if (!productGroups[productId]) {
        productGroups[productId] = [];
      }
      
      // Check if this is a customized product with a design ID
      // Ensures each customized design is preserved within its product group
      productGroups[productId].push(item);
    });
    
    return productGroups;
  };
  
  // Get product groups
  const productGroups = getItemsByProduct();
  
  // Show empty cart state if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="container max-w-5xl py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Your Cart</h1>
        
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Looks like you haven't added any products to your cart yet.
            Browse our products and find something you'll love!
          </p>
          <Button asChild>
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container max-w-6xl py-8 lg:py-12">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className="mr-2"
        >
          <Link href="/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Toggle for showing design images and viewing options */}
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-designs" 
                checked={showDesignImages} 
                onCheckedChange={setShowDesignImages}
              />
              <Label htmlFor="show-designs">Show customized designs</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="grouped-view" 
                checked={showGroupedView} 
                onCheckedChange={setShowGroupedView}
              />
              <Label htmlFor="grouped-view" className="flex items-center">
                <LayoutGrid className="h-4 w-4 mr-1" />
                Group by product
              </Label>
            </div>
          </div>
          
          {/* Item list - Standard View */}
          {!showGroupedView && cartItems.map(item => {
            const itemImage = showDesignImages && item.userCustomization?.design_id && 
              itemImagesToShow[item.id] ? 
              itemImagesToShow[item.id] : 
              item.product.main_image_url
              
            const hasCustomDesign = !!item.userCustomization?.design_id
            
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Product Image */}
                  <div className="relative sm:w-1/3 md:w-1/4">
                    <div className="aspect-square w-full relative">
                      {loadingImages && hasCustomDesign ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                        </div>
                      ) : (
                        <img 
                          src={itemImage} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Custom Design Badge */}
                    {hasCustomDesign && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Customized
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 p-4 sm:p-6 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-lg">{item.product.name}</h3>
                        <span className="font-semibold">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1">Unit Price: ₹{item.product.price.toFixed(2)}</p>
                      
                      {/* Selected Customizations */}
                      {Object.keys(item.selectedCustomizations).length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700">Customizations:</h4>
                          <div className="mt-1 grid grid-cols-1 gap-1">
                            {Object.entries(item.selectedCustomizations).map(([key, value]) => (
                              <div key={key} className="flex text-xs">
                                <span className="text-gray-500 capitalize">{key}: </span>
                                <span className="ml-1">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Quantity and Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this item from your cart?
                              {hasCustomDesign && (
                                <div className="mt-2 flex items-center text-amber-600 bg-amber-50 p-2 rounded-md">
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  <span className="text-sm">This will remove your custom design</span>
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Customize Again Option */}
                    {hasCustomDesign && (
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                          className="text-xs"
                        >
                          <Link href={`/products/${item.product.product_id}/customize`}>
                            Customize Again
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
          
          {/* Item list - Grouped View */}
          {showGroupedView && Object.entries(productGroups).map(([productId, items]) => {
            const product = items[0].product;
            const multipleDesigns = items.length > 1;
            
            return (
              <Card key={productId} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-normal">
                      {items.reduce((total, item) => total + item.quantity, 0)} items
                    </Badge>
                    {multipleDesigns && (
                      <Badge variant="secondary" className="font-normal">
                        {items.length} different designs
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {items.map((item) => {
                    const itemImage = showDesignImages && item.userCustomization?.design_id && 
                      itemImagesToShow[item.id] ? 
                      itemImagesToShow[item.id] : 
                      item.product.main_image_url
                      
                    const hasCustomDesign = !!item.userCustomization?.design_id
                    
                    return (
                      <div key={item.id} className="flex flex-row border-b pb-4 last:border-0 last:pb-0 pt-2">
                        {/* Design Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 mr-4">
                          {loadingImages && hasCustomDesign ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
                            </div>
                          ) : (
                            <img 
                              src={itemImage} 
                              alt={`Design for ${product.name}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          )}
                        </div>
                        
                        {/* Design Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              {hasCustomDesign ? (
                                <div className="text-sm font-medium">
                                  Custom Design 
                                  <Badge variant="outline" className="ml-2 font-normal">
                                    Design #{items.findIndex(i => i.id === item.id) + 1}
                                  </Badge>
                                </div>
                              ) : (
                                <div className="text-sm font-medium">Standard Product</div>
                              )}
                              
                              <div className="text-xs text-gray-500 mt-1">
                                Unit Price: ₹{product.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="font-medium">
                              ₹{(product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          
                          {/* Quantity control and remove */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-2 w-2" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-2 w-2" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {hasCustomDesign && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  asChild
                                  className="text-xs h-7 px-2"
                                >
                                  <Link href={`/products/${product.product_id}/customize`}>
                                    Edit
                                  </Link>
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 h-7 px-2"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
          
          {/* Clear Cart Button */}
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all items from your cart. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cartItems.reduce((total, item) => total + item.quantity, 0)} items in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Subtotal */}
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{cartTotal.subtotal.toFixed(2)}</span>
              </div>
              
              {/* Discount */}
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">
                  {cartTotal.discountAmount > 0 
                    ? `-₹${cartTotal.discountAmount.toFixed(2)}` 
                    : '₹0.00'}
                </span>
              </div>
              
              {/* Tax */}
              <div className="flex justify-between py-2">
                <div className="flex items-center">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <Info className="h-4 w-4 text-muted-foreground ml-1" />
                </div>
                <span>₹{cartTotal.taxAmount.toFixed(2)}</span>
              </div>
              
              {/* Shipping */}
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{cartTotal.shippingCost.toFixed(2)}</span>
              </div>
              
              {/* Discount Code Input */}
              <div className="pt-4">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button 
                    onClick={handleApplyDiscount} 
                    disabled={applyingDiscount}
                    variant="secondary"
                  >
                    {applyingDiscount ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-bold">₹{cartTotal.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center h-11"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full" 
                asChild
              >
                <Link href="/products">
                  Continue Shopping
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}