import { config } from "../../config"

// Interface representing an individual item in an order
export interface OrderItem {
  product_id: string // ID of the product
  quantity: number // Quantity of the product ordered
  selected_customizations: Record<string, string> // Customizations selected by the user (key-value pairs)
  user_customization_type: string // Type of user-provided customization (e.g., text, image)
  user_customization_value: string // Value of the user-provided customization
  individual_price: number // Price of the individual item
}

// Interface representing an order
export interface Order {
  order_id: string // Unique identifier for the order
  clerkId: string // ID of the clerk handling the order
  total_price: number // Total price of the order
  status: string // Current status of the order (e.g., pending, completed)
  created_at: string // Timestamp when the order was created
  items: OrderItem[] // List of items in the order
  receipt_id: number // ID of the receipt associated with the order
}

// Interface for query parameters used to fetch orders
export interface OrdersParams {
  limit?: number // Maximum number of orders to fetch
  offset?: number // Number of orders to skip (for pagination)
  sort?: "asc" | "desc" // Sorting order (ascending or descending)
}

// API object for interacting with the orders endpoint
export const ordersApi = {
  // Method to fetch orders from the server
  async getOrders(params: OrdersParams = {}): Promise<Order[]> {
    const queryParams = new URLSearchParams() // Create a URLSearchParams object to build query string

    // Append query parameters if provided
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.offset) queryParams.append("offset", params.offset.toString())
    if (params.sort) queryParams.append("sort", params.sort)

    // Make a GET request to the orders endpoint with the query string
    const response = await fetch(`${config.apiUrl}/admin/orders?${queryParams.toString()}`)
    if (!response.ok) {
      // Throw an error if the response is not successful
      throw new Error("Failed to fetch orders")
    }
    // Parse and return the JSON response
    return response.json()
  },
}
