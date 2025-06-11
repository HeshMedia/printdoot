import { config } from "../config"

export type ProductStatus = "in_stock" | "out_of_stock" | "discontinued"

export interface Product {
  category_id: any;
  // Existing fields
  product_id: string;
  name: string;
  price: number;
  description: string;
  status: "in_stock" | "out_of_stock" | "discontinued";
  main_image_url: string;
  side_images_url: string[];
  category_name: string;
  average_rating: number;
  review_count: number;
  
  // Add/update these fields
  standard_delivery_time: string;
  express_delivery_time: string;
  dimensions: Array<{
    length?: number;
    breadth?: number;
    height?: number;
    radius?: number;
    label?: string;
  }>;
  weight: number;
  material: string;
  bulk_prices: BulkPrice[];
  customization_options?: Record<string, Record<string, string>>;
  
  // New fields for admin
  hsn_code?: string;
  gst_percentage?: number;
}
export type BulkPrice = {
  min_quantity: number;
  max_quantity: number;
  price: number;
  standard_delivery_price: number,
  express_delivery_price: number
};


export interface ProductsFilterParams {
  category_id?: number
  min_price?: number
  max_price?: number
  min_rating?: number
  sort_by?: string
  skip?: number
  limit?: number
}

export interface ProductsResponse {
  total: number
  products: Product[]
}

export const productsApi = {
  async getProducts(skip = 0, limit = 10): Promise<ProductsResponse> {
    const maxRetries = 3;
    let retries = 0;
    let lastError;

    while (retries < maxRetries) {
      try {
        const response = await fetch(`${config.apiUrl}/products?skip=${skip}&limit=${limit}`, {
          cache: "no-store", // Don't cache to always get fresh data
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        return response.json();
      } catch (error) {
        lastError = error;
        retries++;
        console.log(`Retrying products fetch (${retries}/${maxRetries})...`);
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 300 * retries));
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError || new Error("Failed to fetch products after multiple attempts");
  },

  async getProduct(productId: string): Promise<Product> {
    const maxRetries = 3;
    let retries = 0;
    let lastError;

    while (retries < maxRetries) {
      try {
        const response = await fetch(`${config.apiUrl}/products/${productId}`, {
          cache: "no-store", // Don't cache to always get fresh data
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        
        return response.json();
      } catch (error) {
        lastError = error;
        retries++;
        console.log(`Retrying product fetch (${retries}/${maxRetries})...`);
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 300 * retries));
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError || new Error("Failed to fetch product after multiple attempts");
  },
  async filterProducts(params: ProductsFilterParams): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams()

    if (params.category_id) queryParams.append("category_id", params.category_id.toString())
    if (params.min_price) queryParams.append("min_price", params.min_price.toString())
    if (params.max_price) queryParams.append("max_price", params.max_price.toString())
    if (params.min_rating) queryParams.append("min_rating", params.min_rating.toString())
    if (params.sort_by) queryParams.append("sort_by", params.sort_by)
    if (params.skip) queryParams.append("skip", params.skip.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())

    const maxRetries = 3;
    let retries = 0;
    let lastError;

    while (retries < maxRetries) {
      try {
        const response = await fetch(`${config.apiUrl}/products/filter?${queryParams.toString()}`, {
          cache: "no-store", // Don't cache to always get fresh data
        });
        
        if (!response.ok) {
          throw new Error("Failed to filter products");
        }
        
        return response.json();
      } catch (error) {
        lastError = error;
        retries++;
        console.log(`Retrying products filter (${retries}/${maxRetries})...`);
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 300 * retries));
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError || new Error("Failed to filter products after multiple attempts");
  },
}
