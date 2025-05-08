import { config } from "../config"

// Returned Category object from API
export interface Category {
  id: number;
  name: string;
  allowed_customizations: Record<string, Record<string, string>>;
  image_url: string;            
}


export const categoriesApi = {

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