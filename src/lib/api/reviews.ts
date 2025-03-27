import { config } from "../config"

export interface Review {
  id: number
  clerkId: string
  user_name: string
  product_id: string
  rating: number
  review_text: string
}

export interface ReviewInput {
  clerkId: string
  product_id: string
  rating: number
  review_text: string
}

export const reviewsApi = {
  async getReviews(productId: string): Promise<Review[]> {
    const response = await fetch(`${config.apiUrl}/reviews/${productId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch reviews")
    }
    return response.json()
  },

  async createReview(review: ReviewInput): Promise<Review> {
    const response = await fetch(`${config.apiUrl}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create review")
    }

    return response.json()
  },
}

