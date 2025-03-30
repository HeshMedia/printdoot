import { config } from "../../config";

export type ProductStatus = "in_stock" | "out_of_stock" | "discontinued";

export interface ProductCreateInput {
  name: string;
  price: number;
  category_id: number;
  description: string;
  customization_options?: Record<string, string[]>;
  status: ProductStatus;
}

export interface Product {
  product_id: string;
  name: string;
  price: number;
  description: string;
  average_rating: number;
  status: ProductStatus;
  main_image_url: string;
  side_images_url: string[];
  category_name: string;
}

export interface ProductsFilterParams {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort_by?: string;
  skip?: number;
  limit?: number;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1]; // remove the data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const productsApi = {
  // ✅ Used for basic product fetching
  async getProducts(skip = 0, limit = 10): Promise<{ products: Product[]; total: number }> {
    const response = await fetch(`${config.apiUrl}/products?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json(); // returns { products, total }
  },

  // ✅ Fetch single product by ID (used in edit page)
  async getProduct(productId: string): Promise<Product> {
    const response = await fetch(`${config.apiUrl}/products/${productId}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    return response.json(); // returns Product
  },

  // ✅ Filtered fetching with pagination
  async filterProducts(params: ProductsFilterParams): Promise<{ products: Product[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.category_id) queryParams.append("category_id", params.category_id.toString());
    if (params.min_price) queryParams.append("min_price", params.min_price.toString());
    if (params.max_price) queryParams.append("max_price", params.max_price.toString());
    if (params.min_rating) queryParams.append("min_rating", params.min_rating.toString());
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.skip) queryParams.append("skip", params.skip.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await fetch(`${config.apiUrl}/products/filter?${queryParams.toString()}`);
    if (!response.ok) throw new Error("Failed to filter products");
    return response.json(); // returns { products, total }
  },

  // ✅ Create new product
  async createProduct(product: ProductCreateInput): Promise<Product> {
    const response = await fetch(`${config.apiUrl}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create product");
    }

    return response.json();
  },

  // ✅ Update existing product
  async updateProduct(productId: string, product: Partial<ProductCreateInput>): Promise<Product> {
    const response = await fetch(`${config.apiUrl}/admin/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update product");
    }

    return response.json();
  },

  // ✅ Delete a product
  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${config.apiUrl}/admin/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete product");
    }
  },

  // ✅ Upload product images
  async uploadProductImages(productId: string, mainImage: File, sideImages: File[] = []): Promise<Product> {
    try {
      const mainImageBase64 = await fileToBase64(mainImage);
      const mainImageExtension = mainImage.name.split(".").pop() || "jpg";

      const sideImagesBase64 = await Promise.all(sideImages.map(fileToBase64));
      const sideImagesExtensions = sideImages.map((img) => img.name.split(".").pop() || "jpg");

      const payload = {
        main_image: mainImageBase64,
        main_image_extension: mainImageExtension,
        side_images: sideImagesBase64,
        side_images_extensions: sideImagesExtensions,
      };

      const response = await fetch(`${config.apiUrl}/admin/products/${productId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to upload product images");
      }

      return response.json();
    } catch (err) {
      throw new Error("Image upload error: " + (err instanceof Error ? err.message : String(err)));
    }
  },

  // ✅ Update product images (used in edit page)
  async updateProductImages(productId: string, mainImage: File, sideImages: File[] = []): Promise<Product> {
    // Same as above, but use PUT method
    const mainImageBase64 = await fileToBase64(mainImage);
    const mainImageExtension = mainImage.name.split(".").pop() || "jpg";
    const sideImagesBase64 = await Promise.all(sideImages.map(fileToBase64));
    const sideImagesExtensions = sideImages.map((img) => img.name.split(".").pop() || "jpg");
  
    const payload = {
      main_image: mainImageBase64,
      main_image_extension: mainImageExtension,
      side_images: sideImagesBase64,
      side_images_extensions: sideImagesExtensions,
    };
  
    const response = await fetch(`${config.apiUrl}/admin/products/${productId}/images`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update product images");
    }
  
    return response.json();
  },  

  // ✅ Get categories (optional helper in product forms)
  async getCategories(): Promise<any[]> {
    const response = await fetch(`${config.apiUrl}/categories`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  },
};
