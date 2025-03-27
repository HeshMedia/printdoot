"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ordersApi, type Order } from "@/lib/api/orders"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const data = await ordersApi.getOrder(orderId)
        setOrder(data)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch order:", err)
        setError("Failed to load order details. Please try again.")
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order details...</span>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error || "Order not found"}</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm mb-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We've received your order and will begin processing it soon.
          </p>
          <div className="text-lg font-medium mb-2">Order #{order.order_id}</div>
          <div className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Order Details</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Information</h3>
                <p className="text-sm">Order ID: #{order.order_id}</p>
                <p className="text-sm">Date: {formatDate(order.created_at)}</p>
                <p className="text-sm">Status: {order.status}</p>
                <p className="text-sm">Receipt ID: {order.receipt_id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Information</h3>
                <p className="text-sm">Total: ${order.total_price.toFixed(2)}</p>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Items</h3>

            <div className="divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="py-4 flex gap-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                    {/* Placeholder for item image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <span className="text-xs">{item.product_id}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Product ID: {item.product_id}</h4>
                      <p className="font-semibold">${(item.individual_price * item.quantity).toFixed(2)}</p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      ${item.individual_price.toFixed(2)} each × {item.quantity}
                    </p>

                    {/* Customizations */}
                    {Object.keys(item.selected_customizations).length > 0 && (
                      <div className="mt-2">
                        <h5 className="text-xs font-medium text-muted-foreground">Customizations:</h5>
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(item.selected_customizations).map(([key, value]) => (
                            <div key={key}>
                              {key}: {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Customization */}
                    <div className="mt-2">
                      <h5 className="text-xs font-medium text-muted-foreground">Personalization:</h5>
                      <div className="text-xs text-muted-foreground">
                        {item.user_customization_type}: {item.user_customization_value || "None"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>

          <Button asChild>
            <Link href="/account/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

