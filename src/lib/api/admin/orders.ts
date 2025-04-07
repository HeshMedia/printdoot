import { config } from "../../config";

// Order item within a specific order
export interface OrderItem {
  product_id: string;
  quantity: number;
  selected_customizations: Record<string, string>;
  user_customization_type: "text" | "image" | "color" | "logo";
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
   // Fetch a single order by its ID from the API
   async getOrderById(order_id: string): Promise<Order> {
    const url = `https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/${order_id}`;
    const options = {
      method: "GET",
      headers: { Accept: "application/json" },
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Failed to fetch order details");
    }

    const data = await response.json();
    return data; // Return the order details from the API
  },

  // ✅ Generate a PDF report for all orders, with an optional date filter
  async generateOrdersPdf(from_date?: string): Promise<string> {
    const queryParams = from_date ? `?from_date=${from_date}` : '';
    const url = `${config.apiUrl}/admin/orders/pdf${queryParams}`;

    const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error("Failed to generate orders PDF");
    }

    const data = await response.json();
    return data.base64Pdf; // base64 encoded PDF string
  },

  // ✅ Generate a PDF report for orders from the last X days
  async generateRecentOrdersPdf(days: number = 30): Promise<string> {
    const queryParams = `?days=${days}`;
    const url = `${config.apiUrl}/admin/orders/pdf/recent${queryParams}`;

    const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error("Failed to generate recent orders PDF");
    }

    const data = await response.json();
    return data.base64Pdf; // base64 encoded PDF string
  },

  // ✅ Generate a PDF report for a single order by its ID
  async generateSingleOrderPdf(order_id: string): Promise<{ pdf_data: string; filename: string }> {
    const url = `${config.apiUrl}/admin/orders/${order_id}/pdf`;
  
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  
    if (!response.ok) {
      throw new Error("Failed to generate single order PDF");
    }
  
    return response.json(); 
  }
  

  
};
