import { config } from "../../config"

// Defining a type for user customization options
export type UserCustomizationOption = "text" | "image" | "color"

// Interface for the input required to create a new category
export interface CategoryCreateInput {
    name: string // Name of the category
    allowed_customizations?: Record<string, string[]> // Optional customizations allowed for the category
    user_customization_options: UserCustomizationOption[] // List of customization options available to the user
}

// Interface representing a category object
export interface Category {
    id: number // Unique identifier for the category
    name: string // Name of the category
    allowed_customizations: Record<string, string[]> // Customizations allowed for the category
    user_customization_options: UserCustomizationOption[] // List of customization options available to the user
}

// Object containing API methods for interacting with categories
export const categoriesApi = {
    // Fetches the list of categories from the server
    async getCategories(): Promise<Category[]> {
        const response = await fetch(`${config.apiUrl}/categories`) // Sending a GET request to the categories endpoint
        if (!response.ok) {
            throw new Error("Failed to fetch categories") // Throwing an error if the response is not successful
        }
        return response.json() // Returning the parsed JSON response
    },

    // Sends a request to create a new category
    async createCategory(category: CategoryCreateInput): Promise<Category> {
        const response = await fetch(`${config.apiUrl}/admin/categories`, {
            method: "POST", // HTTP method for creating a resource
            headers: {
                "Content-Type": "application/json", // Setting the content type to JSON
            },
            body: JSON.stringify(category), // Converting the category input to a JSON string
        })

        if (!response.ok) {
            const error = await response.json() // Parsing the error response
            throw new Error(error.detail || "Failed to create category") // Throwing an error with details if available
        }

        return response.json() // Returning the created category object
    },

    // Sends a request to update an existing category
    async updateCategory(categoryId: number, category: Partial<CategoryCreateInput>): Promise<Category> {
        const response = await fetch(`${config.apiUrl}/admin/categories/${categoryId}`, {
            method: "PUT", // HTTP method for updating a resource
            headers: {
                "Content-Type": "application/json", // Setting the content type to JSON
            },
            body: JSON.stringify(category), // Converting the partial category input to a JSON string
        })

        if (!response.ok) {
            const error = await response.json() // Parsing the error response
            throw new Error(error.detail || "Failed to update category") // Throwing an error with details if available
        }

        return response.json() // Returning the updated category object
    },
}
