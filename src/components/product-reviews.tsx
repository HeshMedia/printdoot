"use client"

import Link from "next/link"

import type React from "react"

import { useState } from "react"
import { type Review, reviewsApi, type ReviewInput } from "@/lib/api/reviews"
import { useUser } from "@/lib/context/user-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
}

export default function ProductReviews({ productId, reviews: initialReviews }: ProductReviewsProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review",
        variant: "destructive",
      })
      return
    }

    if (!reviewText.trim()) {
      toast({
        title: "Review Required",
        description: "Please enter your review",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const reviewInput: ReviewInput = {
        clerkId: user.clerkId,
        product_id: productId,
        rating,
        review_text: reviewText,
      }

      const newReview = await reviewsApi.createReview(reviewInput)

      setReviews([newReview, ...reviews])
      setReviewText("")
      setRating(5)

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      console.error("Failed to submit review:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++
    }
  })

  return (
    <div>
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < averageRating
                        ? "text-yellow-400 fill-yellow-400 opacity-50"
                        : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm ml-2">{averageRating.toFixed(1)} out of 5</span>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star - 1]
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

              return (
                <div key={star} className="flex items-center">
                  <span className="text-sm w-8">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                    <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Write a Review */}
        <div>
          <h3 className="text-lg font-medium mb-4">Write a Review</h3>

          {user ? (
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => handleRatingChange(star)} className="p-1">
                      <Star
                        className={`w-6 h-6 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="review" className="block text-sm font-medium mb-2">
                  Your Review
                </label>
                <Textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          ) : (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm mb-2">Please log in to write a review.</p>
              <Button asChild variant="outline">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">All Reviews ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{review.user_name}</div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm">{review.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

