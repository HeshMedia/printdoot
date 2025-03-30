import { config } from "../../config";

// Order item within a specific order
export interface OrderItem {
  product_id: string;
  quantity: number;
  selected_customizations: Record<string, string>;
  user_customization_type: "text" | "image" | "color";
  user_customization_value: string;
  individual_price: number;
}

// Full order interface
export interface Order {
  order_id: string;
  clerkId: string;
  total_price: number;
  status: string;
  created_at: string; // ISO date
  receipt_id: number;
  items: OrderItem[];
  user_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}

// Parameters you can send to the GET /admin/orders API
export interface OrderQueryParams {
  limit?: number;
  offset?: number;
  sort?: "asc" | "desc";
}

// Response shape from the API
export interface OrdersApiResponse {
  orders: Order[];
  total: number;
}

export const ordersApi = {
  // ✅ Fetch all orders with optional query params
  async getOrders(params: OrderQueryParams = {}): Promise<OrdersApiResponse> {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.sort) queryParams.append("sort", params.sort);

    const url = `${config.apiUrl}/admin/orders?${queryParams.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return response.json(); // { orders, total }
  },
};
