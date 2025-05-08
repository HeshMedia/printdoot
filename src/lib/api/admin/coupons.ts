// API client for coupon management

// Types based on the API response structure
export interface CouponCreate {
  code: string;
  discount_percentage: number;
  applicable_categories?: number[];
  applicable_products?: string[];
  active?: number;  // Added to match the sample data structure
  expires_at?: string;
}

export interface CouponResponse {
  id: number;
  code: string;
  discount_percentage: number;
  applicable_categories?: number[];
  applicable_products?: string[];
  active: number; // 0 or 1
  created_at: string;
  expires_at?: string;
}

export interface CouponListResponse {
  total: number;
  coupons: CouponResponse[];
}

export interface CouponUpdate {
  code?: string;
  discount_percentage?: number;
  applicable_categories?: number[];
  applicable_products?: string[];
  active?: number;
  expires_at?: string;
}

const API_BASE_URL = "https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod";

// API client functions
export const couponsApi = {
  // Get all coupons
  getCoupons: async (): Promise<CouponListResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coupons: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get a specific coupon by ID
  getCouponById: async (id: number): Promise<CouponResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coupon ${id}: ${response.status}`);
    }
    
    return await response.json();
  },

  // Create a new coupon
  createCoupon: async (coupon: CouponCreate): Promise<CouponResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(coupon),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create coupon: ${response.status}`);
    }
    
    return await response.json();
  },

  // Update an existing coupon
  updateCoupon: async (id: number, coupon: CouponUpdate): Promise<CouponResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(coupon),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update coupon ${id}: ${response.status}`);
    }
    
    return await response.json();
  },

  // Delete a coupon
  deleteCoupon: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete coupon ${id}: ${response.status}`);
    }
  }
};