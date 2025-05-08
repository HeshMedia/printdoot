"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser } from "@/lib/context/user-context"
import { ordersApi, type Order } from "@/lib/api/orders"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight } from "lucide-react"

export default function AccountOrdersPage() {
  const { user, isLoading: userLoading } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        setLoading(true)
        const data = await ordersApi.getOrdersByUser(user.clerkId)
        setOrders(data)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        setError("Failed to load your orders. Please try again.")
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    } else if (!userLoading) {
      setLoading(false)
    }
  }, [user, userLoading])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (userLoading || loading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your orders...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl mb-4">Please log in to view your orders.</div>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Order History</h2>
          </div>

          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.order_id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="text-lg font-medium">Order #{order.order_id}</div>
                    <div className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        order.status.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status.toLowerCase() === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status.toLowerCase() === "shipped"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>

                    <Button asChild variant="outline" size="sm">
                      <Link href={`/orders/${order.order_id}`}>
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="font-medium">Total: ${order.total_price.toFixed(2)}</div>
                  <div className="text-muted-foreground">{order.items.length} items</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

