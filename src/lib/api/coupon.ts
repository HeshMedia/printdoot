import { config } from "../config";

const BASE_URL = `${config.apiUrl}`;

/**
 * Interface for coupon verification request
 */
export interface VerifyCouponRequest {
  code: string;
  category_id?: number;
  product_id?: string;
}

/**
 * Interface for coupon verification response
 */
export interface VerifyCouponResponse {
  valid: boolean;
  discount_percentage: number;
  message: string;
}

/**
 * Verifies a coupon code with the API
 * @param payload The coupon code and optional category/product IDs
 * @returns Response with validation status and discount percentage
 */
export async function verifyCoupon(payload: VerifyCouponRequest): Promise<VerifyCouponResponse> {
  const url = `${BASE_URL}/coupons/verify`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error verifying coupon: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error verifying coupon:", error);
    // Return default failed response
    return {
      valid: false,
      discount_percentage: 0,
      message: "Failed to verify coupon. Please try again."
    };
  }
}