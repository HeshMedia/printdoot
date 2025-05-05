import { config } from "../config"

export type ProductStatus = "in_stock" | "out_of_stock" | "discontinued"

export interface Product {
  product_id: string;
  name: string;
  price: number;
  description: string;
  status: "in_stock" | "out_of_stock" | "discontinued";
  main_image_url: string;
  side_images_url: string[];
  category_name: string;
  average_rating: number;

  // ✅ Add these
  dimensions: {
    length: number;
    breadth: number;
    height: number;
  };
  bulk_prices: {
    min_quantity: number;
    max_quantity: number;
    price: number;
  }[];

  weight: number;
  material: string;
  customization_options?: Record<string, Record<string, string>>;

}

export type BulkPrice = {
  min_quantity: number;
  max_quantity: number;
  price: number;
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
    const response = await fetch(`${config.apiUrl}/products?skip=${skip}&limit=${limit}`)
    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }
    return response.json()
  },

  async getProduct(productId: string): Promise<Product> {
    const response = await fetch(`${config.apiUrl}/products/${productId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch product")
    }
    return response.json()
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

    const response = await fetch(`${config.apiUrl}/products/filter?${queryParams.toString()}`)
    if (!response.ok) {
      throw new Error("Failed to filter products")
    }
    return response.json()
  },
}
