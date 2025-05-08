"use client"

import { useState, useEffect } from "react"
import { Heart, Loader2 } from "lucide-react"
import { shopByNeedApi, type FeaturedProductResponse, type NeedResponse } from "@/lib/api/featured"
import { categoriesApi } from "@/lib/api/categories"
import { Category } from "@/lib/api/admin/categories"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function ShopByNeedPage() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [filteredProducts, setFilteredProducts] = useState<FeaturedProductResponse[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [needs, setNeeds] = useState<NeedResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  
  // Filter states
  const [selectedNeed, setSelectedNeed] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>("name_asc")

  useEffect(() => {
    const fetchNeeds = async () => {
      setIsLoadingNeeds(true)
      try {
        const data = await shopByNeedApi.getNeeds()
        setNeeds(data.needs)
        if (data.needs.length > 0) {
          setSelectedNeed(data.needs[0].need)
        }
      } catch (error) {
        console.error("Error fetching needs:", error)
      } finally {
        setIsLoadingNeeds(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getCategories()
        setCategories(data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    Promise.all([fetchNeeds(), fetchCategories()])
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedNeed) return

      setIsLoading(true)
      try {
        const data = await shopByNeedApi.getProducts(selectedNeed)
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      } catch (error) {
        console.error(`Error fetching products for need ${selectedNeed}:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedNeed])

  useEffect(() => {
    // Apply filters whenever filter values change
    let filtered = [...products]

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_name === selectedCategory)
    }

    // Filter by price range
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // Filter by rating
    if (minRating !== undefined) {
      filtered = filtered.filter(product => product.average_rating >= minRating)
    }

    // Apply sorting
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating_desc") {
      filtered.sort((a, b) => b.average_rating - a.average_rating)
    } else if (sortBy === "name_asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name_desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name))
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, priceRange, minRating, sortBy, products])

  const handleRatingChange = (rating: number) => {
    setMinRating(minRating === rating ? undefined : rating)
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setPriceRange([0, 1000])
    setMinRating(undefined)
    setSortBy("name_asc")
  }

  const maxPrice = Math.max(...products.map(product => product.price), 1000)

  if (isLoadingNeeds) {
    return (
      <div className="container mx-auto py-32 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (needs.length === 0) {
    return (
      <div className="container mx-auto py-32 text-center">
        <h2 className="text-2xl font-bold mb-2">No Shop-by-Need Categories Available</h2>
        <p className="text-muted-foreground">Please check back later for updated categories.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Need category tabs */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Heart className="h-6 w-6 mr-2 text-[#60B5FF]" /> 
          Shop By Need
        </h1>
        <Tabs defaultValue={selectedNeed} onValueChange={setSelectedNeed} className="w-full">
          <TabsList className="mb-8 flex flex-wrap h-auto p-1 gap-1">
            {needs.map((need) => (
              <TabsTrigger
                key={need.need}
                value={need.need}
                className="px-4 py-2 data-[state=active]:bg-[#60B5FF] rounded-md"
              >
                {need.need}
                <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5">
                  {need.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="link" onClick={clearFilters}>Clear All</Button>
            </div>
            
            <Accordion type="single" collapsible className="w-full" defaultValue="category">
              {/* Category filter */}
              <AccordionItem value="category">
                <AccordionTrigger className="text-sm font-medium">Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 mt-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`category-${category.id}`} 
                          checked={selectedCategory === category.name}
                          onCheckedChange={() => 
                            setSelectedCategory(selectedCategory === category.name ? "" : category.name)
                          }
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Price range filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4">
                    <Slider 
                      min={0} 
                      max={maxPrice} 
                      step={10}
                      value={priceRange} 
                      onValueChange={(value) => setPriceRange(value as [number, number])} 
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Rating filter */}
              <AccordionItem value="rating">
                <AccordionTrigger className="text-sm font-medium">Rating</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 mt-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <Checkbox 
                          id={`rating-${rating}`} 
                          checked={minRating === rating}
                          onCheckedChange={() => handleRatingChange(rating)}
                        />
                        <Label htmlFor={`rating-${rating}`} className="flex items-center">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Heart key={i} className="h-4 w-4 fill-[#60B5FF] text-[#60B5FF]" />
                          ))}
                          {Array.from({ length: 5 - rating }).map((_, i) => (
                            <Heart key={i} className="h-4 w-4 text-gray-200" />
                          ))}
                          <span className="ml-1">&amp; Up</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="w-full md:w-3/4">
          {/* Selected need category heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              {selectedNeed || "All Products"}
            </h2>
            <p className="text-muted-foreground">
              Find products perfectly suited for your {selectedNeed.toLowerCase()} needs
            </p>
          </div>
          
          {/* Sorting and results count */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                  <SelectItem value="rating_desc">Rating (Highest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try selecting a different category or changing your filters.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link href={`/products/${product.product_id}`} key={product.product_id}>
                  <Card className="h-full transition-all duration-200 hover:shadow-lg">
                    <div className="relative h-64 w-full">
                      <Image
                        src={product.main_image_url || "/placeholder.svg?height=256&width=256"}
                        alt={product.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#60B5FF]">₹{product.price.toFixed(2)}</span>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 fill-[#60B5FF] stroke-[#60B5FF] mr-1" />
                          <span className="text-sm">{product.average_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}