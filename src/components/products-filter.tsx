"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Category } from "@/lib/api/categories"

interface ProductsFilterProps {
  categories: Category[]
}

export default function ProductsFilter({ categories = [] }: ProductsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("category") ? Number.parseInt(searchParams.get("category")!) : undefined,
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([
    searchParams.get("min_price") ? Number.parseFloat(searchParams.get("min_price")!) : 0,
    searchParams.get("max_price") ? Number.parseFloat(searchParams.get("max_price")!) : 1000,
  ])
  const [minRating, setMinRating] = useState<number | undefined>(
    searchParams.get("min_rating") ? Number.parseFloat(searchParams.get("min_rating")!) : undefined,
  )
  const [sortBy, setSortBy] = useState<string | undefined>(searchParams.get("sort_by") || undefined)
  
  // Apply filters whenever a filter changes
  useEffect(() => {
    applyFilters()
  }, [categoryId, minRating, sortBy])
  
  // Price range has a separate effect to avoid applying on every slider movement
  const [isSliderChanging, setIsSliderChanging] = useState(false)
  useEffect(() => {
    // Only apply price filter when slider stops moving (debounce)
    if (!isSliderChanging) {
      applyFilters()
    }
  }, [priceRange, isSliderChanging])

  const handleCategoryChange = (id: number) => {
    setCategoryId(categoryId === id ? undefined : id)
  }

  const handlePriceChange = (value: number[]) => {
    setIsSliderChanging(true)
    setPriceRange([value[0], value[1]])
    
    // Stop slider changing status after a short delay
    clearTimeout((window as any).priceChangeTimeout)
    ;(window as any).priceChangeTimeout = setTimeout(() => {
      setIsSliderChanging(false)
    }, 300)
  }

  const handleRatingChange = (rating: number) => {
    setMinRating(minRating === rating ? undefined : rating)
  }

  const handleSortChange = (value: string) => {
    setSortBy(sortBy === value ? undefined : value)
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId) {
      params.set("category", categoryId.toString())
    } else {
      params.delete("category")
    }
    
    if (priceRange[0] > 0) {
      params.set("min_price", priceRange[0].toString())
    } else {
      params.delete("min_price")
    }
    
    if (priceRange[1] < 1000) {
      params.set("max_price", priceRange[1].toString())
    } else {
      params.delete("max_price")
    }
    
    if (minRating) {
      params.set("min_rating", minRating.toString())
    } else {
      params.delete("min_rating")
    }
    
    if (sortBy) {
      params.set("sort_by", sortBy)
    } else {
      params.delete("sort_by")
    }

    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setCategoryId(undefined)
    setPriceRange([0, 1000])
    setMinRating(undefined)
    setSortBy(undefined)
    router.push("/products")
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <Accordion type="multiple" defaultValue={["categories", "price", "rating", "sort"]}>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={categoryId === category.id}
                      onCheckedChange={() => handleCategoryChange(category.id)}
                      className="rounded-full"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 p-2">
              <Slider
                defaultValue={[priceRange[0], priceRange[1]]}
                min={0}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between text-sm">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={minRating === rating}
                    onCheckedChange={() => handleRatingChange(rating)}
                    className="rounded-full"
                  />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {rating}+ Stars
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[
                { value: "price_asc", label: "Price: Low to High" },
                { value: "price_desc", label: "Price: High to Low" },
                { value: "rating_desc", label: "Highest Rated" },
                { value: "newest", label: "Newest" },
              ].map((option) => (
                <div key={option.value} className="flex items-center">
                  <Checkbox
                    id={`sort-${option.value}`}
                    checked={sortBy === option.value}
                    onCheckedChange={() => handleSortChange(option.value)}
                    className="rounded-full"
                  />
                  <Label
                    htmlFor={`sort-${option.value}`}
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 space-y-2">
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}

