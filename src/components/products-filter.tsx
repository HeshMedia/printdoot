"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X, Check, FilterX, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/api/categories"

interface ProductsFilterProps {
  categories: Category[]
  closeSheet?: () => void
}

export default function ProductsFilter({ categories = [], closeSheet }: ProductsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<string>("categories")

  // Filter states
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
  
  // Count active filters for mobile indicator
  const activeFilterCount = [
    categoryId !== undefined, 
    priceRange[0] > 0 || priceRange[1] < 1000, 
    minRating !== undefined, 
    sortBy !== undefined
  ].filter(Boolean).length;
  
  // Manage active filters for display
  const [activeFilters, setActiveFilters] = useState<{id: string, label: string}[]>([])
  
  useEffect(() => {
    const filters: {id: string, label: string}[] = []
    
    // Add category filter
    if (categoryId !== undefined) {
      const category = categories.find(c => c.id === categoryId)
      if (category) {
        filters.push({ id: `category-${categoryId}`, label: category.name })
      }
    }
    
    // Add price range filter
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      filters.push({ id: 'price', label: `₹${priceRange[0]} - ₹${priceRange[1]}` })
    }
    
    // Add rating filter
    if (minRating !== undefined) {
      filters.push({ id: `rating-${minRating}`, label: `${minRating}+ Stars` })
    }
    
    // Add sort filter
    if (sortBy) {
      const sortOptions = {
        price_asc: "Price: Low to High",
        price_desc: "Price: High to Low",
        rating_desc: "Highest Rated",
        newest: "Newest"
      }
      filters.push({ id: `sort-${sortBy}`, label: sortOptions[sortBy as keyof typeof sortOptions] })
    }
    
    setActiveFilters(filters)
  }, [categoryId, priceRange, minRating, sortBy, categories])
    // Price range has a separate effect to avoid applying on every slider movement
  const [isSliderChanging, setIsSliderChanging] = useState(false)
  
  // Apply filters automatically whenever filter values change
  useEffect(() => {
    if (!isSliderChanging) {
      applyFilters()
    }
  }, [categoryId, minRating, sortBy, priceRange, isSliderChanging])

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
    const removeFilter = (id: string) => {
    if (id.startsWith('category-')) {
      setCategoryId(undefined)
    } else if (id === 'price') {
      setPriceRange([0, 1000])
    } else if (id.startsWith('rating-')) {
      setMinRating(undefined)
    } else if (id.startsWith('sort-')) {
      setSortBy(undefined)
    }
    // No need to call applyFilters() as the useEffect will handle it
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
    
    // Close the sheet if we're in mobile view
    if (closeSheet) {
      closeSheet()
    }
  }

  // Tabs configuration
  const tabs = [
    { id: "categories", label: "Categories", icon: <div className="h-5 w-5 flex items-center justify-center font-semibold text-sm">#</div> },
    { id: "price", label: "Price", icon: <div className="h-5 w-5 flex items-center justify-center font-semibold text-sm">₹</div> },
    { id: "rating", label: "Rating", icon: <Star className="h-4 w-4" /> },
    { id: "sort", label: "Sort By", icon: <div className="h-5 w-5 flex items-center justify-center font-semibold text-sm">⇅</div> }
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 py-4 border-b sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold flex items-center">
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </h2>
        
        {closeSheet && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={closeSheet}
            className="rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
      
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="px-4 py-2 border-b overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 flex-nowrap">
            {activeFilters.map(filter => (
              <Badge 
                key={filter.id} 
                variant="outline" 
                className="whitespace-nowrap py-1.5 pl-3 pr-2 flex items-center gap-1"
              >
                {filter.label}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-full ml-1 p-0.5"
                  onClick={() => removeFilter(filter.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            
            {activeFilters.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 whitespace-nowrap h-8 text-xs"
                onClick={clearFilters}
              >
                <FilterX className="h-3 w-3" /> Clear all
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Tab navigation */}
      <div className="grid grid-cols-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-1 text-xs transition-colors",
              activeTab === tab.id 
                ? "text-primary border-b-2 border-primary font-medium" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.icon}
            <span className="mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Categories tab */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            <h3 className="font-medium">Select Category</h3>
            <div className="space-y-3">
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <div 
                    key={category.id} 
                    className={cn(
                      "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                      categoryId === category.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-gray-300"
                    )}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    {categoryId === category.id && (
                      <Check className="text-primary h-4 w-4 mr-1" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2">No categories available</p>
              )}
            </div>
          </div>
        )}
        
        {/* Price range tab */}
        {activeTab === "price" && (
          <div className="space-y-6">
            <h3 className="font-medium">Price Range</h3>
            
            <div className="bg-gray-50 p-5 rounded-lg">
              <Slider
                defaultValue={[priceRange[0], priceRange[1]]}
                value={[priceRange[0], priceRange[1]]}
                min={0}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
                className="h-6"
              />
              
              <div className="mt-8 flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                  <div className="bg-white border rounded-md p-2 text-center font-medium">
                    ₹{priceRange[0]}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                  <div className="bg-white border rounded-md p-2 text-center font-medium">
                    ₹{priceRange[1]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Rating tab */}
        {activeTab === "rating" && (
          <div className="space-y-4">
            <h3 className="font-medium">Customer Rating</h3>
            <div className="space-y-3">
              {[4, 3, 2, 1].map((rating) => (
                <div 
                  key={rating} 
                  className={cn(
                    "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                    minRating === rating 
                      ? "border-primary bg-primary/5" 
                      : "hover:border-gray-300"
                  )}
                  onClick={() => handleRatingChange(rating)}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{rating}+</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-4 w-4", 
                              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {minRating === rating && (
                    <Check className="text-primary h-4 w-4 mr-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sort tab */}
        {activeTab === "sort" && (
          <div className="space-y-4">
            <h3 className="font-medium">Sort Products By</h3>
            <div className="space-y-3">
              {[
                { value: "price_asc", label: "Price: Low to High" },
                { value: "price_desc", label: "Price: High to Low" },
                { value: "rating_desc", label: "Highest Rated" },
                { value: "newest", label: "Newest" },
              ].map((option) => (
                <div 
                  key={option.value} 
                  className={cn(
                    "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                    sortBy === option.value 
                      ? "border-primary bg-primary/5" 
                      : "hover:border-gray-300"
                  )}
                  onClick={() => handleSortChange(option.value)}
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  {sortBy === option.value && (
                    <Check className="text-primary h-4 w-4 mr-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>      {/* Bottom action buttons */}
      <div className="border-t p-4 sticky bottom-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {activeFilterCount > 0 ? `${activeFilterCount} active filters` : "No filters applied"}
          </span>
          <div className="flex gap-3">
            <Button 
              onClick={clearFilters} 
              variant="outline"
            >
              Reset All
            </Button>
            
          </div>
        </div>
      </div>
    </div>
  )
}

