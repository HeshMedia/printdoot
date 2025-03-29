import { config } from "../../config";

// Defining a type for user customization options
export type UserCustomizationOption = "text" | "image" | "color";

// Interface for the input required to create a new category
export interface CategoryCreateInput {
  name: string;
  allowed_customizations?: Record<string, string[]>;
  user_customization_options: UserCustomizationOption[];
}

// Interface representing a category object
export interface Category {
  id: number;
  name: string;
  allowed_customizations: Record<string, string[]>;
  user_customization_options: UserCustomizationOption[];
}

// ✅ Updated return type for getCategories
export const categoriesApi = {
  // Fetches the list of categories from the server
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    const response = await fetch(`${config.apiUrl}/categories`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json(); // expected to be { categories, total }
  },

  // Sends a request to create a new category
  async createCategory(category: CategoryCreateInput): Promise<Category> {
    const response = await fetch(`${config.apiUrl}/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create category");
    }

    return response.json();
  },

  // Sends a request to update an existing category
  async updateCategory(
    categoryId: number,
    category: Partial<CategoryCreateInput>
  ): Promise<Category> {
    const response = await fetch(`${config.apiUrl}/admin/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update category");
    }

    return response.json();
  },
};
