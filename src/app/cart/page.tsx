"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/context/cart-context"
import { useUser } from "@/lib/context/user-context"
import { ordersApi } from "@/lib/api/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const { items, updateItem, removeItem, clearCart, totalPrice } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return

    const item = items[index]
    updateItem(index, {
      ...item,
      quantity,
    })
  }

  const handleRemoveItem = (index: number) => {
    removeItem(index)
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to checkout",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCheckingOut(true)

      // Prepare order data
      const orderItems = items.map((item) => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
        selected_customizations: item.selectedCustomizations,
        user_customization_type: item.userCustomization.type,
        user_customization_value: item.userCustomization.value,
        individual_price: item.product.price,
      }))

      // Convert custom preview images to files if they exist
      const files: File[] = []
      items.forEach((item, index) => {
        if (item.customPreviewUrl) {
          // Convert data URL to File
          const byteString = atob(item.customPreviewUrl.split(",")[1])
          const mimeString = item.customPreviewUrl.split(",")[0].split(":")[1].split(";")[0]
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)

          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }

          const file = new File([ab], `custom_preview_${index}.png`, { type: mimeString })
          files.push(file)
        }
      })

      // Submit order
      const orderId = await ordersApi.checkout({
        clerkId: user.clerkId,
        total_price: totalPrice,
        products: JSON.stringify(orderItems),
        files: files.length > 0 ? files : undefined,
      })

      // Clear cart after successful checkout
      clearCart()

      // Redirect to order confirmation
      router.push(`/orders/${orderId}`)
    } catch (error) {
      console.error("Checkout failed:", error)
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
              </div>

              <div className="divide-y">
                {items.map((item, index) => (
                  <div key={index} className="p-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      {item.customPreviewUrl ? (
                        <Image
                          src={item.customPreviewUrl || "/placeholder.svg"}
                          alt={`Custom ${item.product.name}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src={item.product.main_image_url || "/placeholder.svg?height=100&width=100"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>

                      <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>

                      {/* Customizations */}
                      {Object.keys(item.selectedCustomizations).length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-xs font-medium text-muted-foreground">Customizations:</h4>
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(item.selectedCustomizations).map(([key, value]) => (
                              <div key={key}>
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* User Customization */}
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Personalization:</h4>
                        <div className="text-xs text-muted-foreground">
                          {item.userCustomization.type === "text" ? (
                            <div>Text: {item.userCustomization.value || "None"}</div>
                          ) : item.userCustomization.type === "image" ? (
                            <div>Custom Image Added</div>
                          ) : (
                            <div className="flex items-center">
                              Color:
                              <div
                                className="w-3 h-3 rounded-full ml-1"
                                style={{ backgroundColor: item.userCustomization.value }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, Number.parseInt(e.target.value) || 1)}
                            className="w-12 mx-2 text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut || items.length === 0}
              >
                {isCheckingOut ? "Processing..." : "Checkout"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm text-blue-600 hover:text-blue-800">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

