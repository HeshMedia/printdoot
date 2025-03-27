import { config } from "../config"

export type UserCustomizationOption = "text" | "image" | "color"

export interface Category {
  id: number
  name: string
  allowed_customizations: Record<string, string[]>
  user_customization_options: UserCustomizationOption[]
}

export const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${config.apiUrl}/categories`)
    if (!response.ok) {
      throw new Error("Failed to fetch categories")
    }
    return response.json()
  },
}

