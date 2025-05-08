import { config } from "../config"
import { Category } from "@/lib/api/admin/categories"




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

    return response.json();
  },
}