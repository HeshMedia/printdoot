import { config } from "../../config"

export type ProductStatus = "in_stock" | "out_of_stock" | "discontinued"

export interface ProductCreateInput {
  name: string
  price: number
  category_id: number
  description: string
  customization_options?: Record<string, string[]>
  status: ProductStatus
}

export interface Product {
  product_id: string
  name: string
  price: number
  description: string
  average_rating: number
  status: ProductStatus
  main_image_url: string
  side_images_url: string[]
  category_name: string
}

export interface ProductsFilterParams {
  category_id?: number
  min_price?: number
  max_price?: number
  min_rating?: number
  sort_by?: string
  skip?: number
  limit?: number
}

export const productsApi = {
  async getProducts(skip = 0, limit = 10): Promise<Product[]> {
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

  async filterProducts(params: ProductsFilterParams): Promise<Product[]> {
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

  async createProduct(product: ProductCreateInput): Promise<Product> {
    const response = await fetch(`${config.apiUrl}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create product")
    }

    return response.json()
  },

  async updateProduct(productId: string, product: Partial<ProductCreateInput>): Promise<Product> {
    const response = await fetch(`${config.apiUrl}/admin/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to update product")
    }

    return response.json()
  },

  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${config.apiUrl}/admin/products/${productId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to delete product")
    }
  },

  async uploadProductImages(productId: string, mainImage: File, sideImages?: File[]): Promise<Product> {
    const formData = new FormData()
    formData.append("main_image", mainImage)

    if (sideImages && sideImages.length > 0) {
      sideImages.forEach((image) => {
        formData.append("side_images", image)
      })
    }

    const response = await fetch(`${config.apiUrl}/admin/products/${productId}/images`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to upload product images")
    }

    return response.json()
  },
}

