import { config } from "../config"

export interface OrderItem {
  product_id: string
  quantity: number
  selected_customizations: Record<string, string>
  user_customization_type: string
  user_customization_value: string
  individual_price: number
}

export interface Order {
  order_id: string
  clerkId: string
  total_price: number
  status: string
  created_at: string
  items: OrderItem[]
  receipt_id: number
}

export interface OrdersParams {
  limit?: number
  offset?: number
  sort?: "asc" | "desc"
}

export interface CheckoutInput {
  clerkId: string
  total_price: number
  products: string // JSON string of products
  files?: File[] // Optional files for customization
}

export const ordersApi = {
  async getOrdersByUser(clerkId: string, params: OrdersParams = {}): Promise<Order[]> {
    const queryParams = new URLSearchParams()

    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.offset) queryParams.append("offset", params.offset.toString())
    if (params.sort) queryParams.append("sort", params.sort)

    const response = await fetch(`${config.apiUrl}/user/${clerkId}?${queryParams.toString()}`)
    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }
    return response.json()
  },

  async getOrder(orderId: string): Promise<Order> {
    const response = await fetch(`${config.apiUrl}/${orderId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch order")
    }
    return response.json()
  },

  async checkout(data: CheckoutInput): Promise<string> {
    const formData = new FormData()
    formData.append("clerkId", data.clerkId)
    formData.append("total_price", data.total_price.toString())
    formData.append("products", data.products)

    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("files", file)
      })
    }

    const response = await fetch(`${config.apiUrl}/checkout`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to checkout")
    }

    return response.json()
  },
}

