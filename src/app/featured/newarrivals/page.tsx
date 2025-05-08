"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, ArrowRight, Loader2, Clock } from "lucide-react"
import { newarrivalsApi, type FeaturedProductResponse } from "@/lib/api/featured"
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
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<FeaturedProductResponse[]>([])
  const [filteredProducts, setFilteredProducts] = useState<FeaturedProductResponse[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const productsPerPage = 9

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const [productsData, categoriesData] = await Promise.all([
          newarrivalsApi.get(100, 0), // Get a large number to allow for client-side filtering
          categoriesApi.getCategories()
        ])
        
        setProducts(productsData.products || [])
        setFilteredProducts(productsData.products || [])
        setCategories(categoriesData.categories || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

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
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [selectedCategory, priceRange, minRating, sortBy, products])

  const handleRatingChange = (rating: number) => {
    setMinRating(minRating === rating ? undefined : rating)
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setPriceRange([0, Math.max(...products.map(product => product.price), 1000)])
    setMinRating(undefined)
    setSortBy("newest")
  }

  const maxPrice = Math.max(...products.map(product => product.price), 1000)

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-green-800">Filters</h2>
              <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={clearFilters}>Clear All</Button>
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
                      className="text-green-600"
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
                            <Clock key={i} className="h-4 w-4 fill-green-400 text-green-400" />
                          ))}
                          {Array.from({ length: 5 - rating }).map((_, i) => (
                            <Clock key={i} className="h-4 w-4 text-gray-200" />
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
          {/* Page header */}
          <div className="mb-6 bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-lg text-white shadow-md">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ShoppingBag className="h-8 w-8 mr-3" /> 
              New Arrivals
            </h1>
            <p className="opacity-90">Discover our latest additions - fresh and exciting products</p>
          </div>
          
          {/* Sorting and results count */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border border-green-100">
            <div className="text-sm">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] border-green-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
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
            <div className="flex justify-center items-center py-32 bg-white rounded-lg shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-medium mb-2">No new arrivals found</h3>
              <p className="text-muted-foreground mb-6">Try changing your filters or check back later.</p>
              <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700">Clear All Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <Link href={`/products/${product.product_id}`} key={product.product_id}>
                    <Card className="h-full transition-all duration-300 hover:shadow-lg border-green-100 overflow-hidden">
                      <div className="relative h-64 w-full">
                        <Image
                          src={product.main_image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 hover:bg-green-700">
                            <Clock className="h-3 w-3 mr-1" /> New
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-700">₹{product.price.toFixed(2)}</span>
                          <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                            <Clock className="h-3.5 w-3.5 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-800">New</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      disabled={currentPage === 1}
                      onClick={() => paginate(currentPage - 1)}
                      className="border-green-200 text-green-700"
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNumber = idx + 1
                      // Show current page, first, last, and neighboring pages
                      if (
                        pageNumber === 1 || 
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            className={currentPage === pageNumber ? "bg-green-600 hover:bg-green-700" : "border-green-200 text-green-700"}
                            onClick={() => paginate(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        )
                      } else if (
                        (pageNumber === currentPage - 2 && currentPage > 3) || 
                        (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                      ) {
                        return <span key={pageNumber} className="flex items-center px-3">...</span>
                      }
                      return null
                    })}
                    
                    <Button 
                      variant="outline" 
                      disabled={currentPage === totalPages}
                      onClick={() => paginate(currentPage + 1)}
                      className="border-green-200 text-green-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}