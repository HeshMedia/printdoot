import { config } from "../../config";

// Defining allowed customization types
export type UserCustomizationOption = "text" | "image" | "color";

// Input type used when creating/updating a category
export interface CategoryCreateInput {
  name: string;
  allowed_customizations?: Record<string, string[]>;
  user_customization_options: UserCustomizationOption[];
  image: string;               // base64 string
  image_extension: string;     // file extension, e.g., "png", "jpg"
}

// Returned Category object from API
export interface Category {
  id: number;
  name: string;
  allowed_customizations: Record<string, string[]>;
  user_customization_options: UserCustomizationOption[];
  image_url: string;             // base64 image string
}


export const categoriesApi = {
  /**
   * Fetch the list of categories from the server
   * GET /categories
   */
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    const response = await fetch(`${config.apiUrl}/categories`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    return response.json(); // expected: { categories: [...], total: number }
  },

  /**
   * Create a new category
   * POST /admin/categories
   */
  async createCategory(category: CategoryCreateInput): Promise<Category> {
    const response = await fetch(`${config.apiUrl}/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create category");
    }

    return response.json(); // expected: Category with image_url
  },

  /**
   * Update an existing category
   * PUT /admin/categories/{category_id}
   */
  async updateCategory(
    categoryId: number,
    category: Partial<CategoryCreateInput>
  ): Promise<Category> {
    const response = await fetch(`${config.apiUrl}/admin/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update category");
    }

    return response.json(); // expected: Category with image_url
  },
};
