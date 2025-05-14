"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { categoriesApi, type Category } from "@/lib/api/admin/categories"
import { productsApi, type Product } from "@/lib/api/admin/products"
import { CouponResponse, CouponCreate, CouponUpdate } from "@/lib/api/admin/coupons"
import { Loader2, AlertTriangle, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CouponFormProps {
  initialData?: CouponResponse
  onSubmit: (data: CouponCreate | CouponUpdate) => void
  onCancel: () => void
  isEditing?: boolean
}

export default function CouponForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: CouponFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<number[]>(initialData?.applicable_categories || [])
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialData?.applicable_products || [])
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [isFocused, setIsFocused] = useState(false);

  const [formData, setFormData] = useState<CouponCreate | CouponUpdate>(
    isEditing && initialData
      ? {
          code: initialData.code || "",
          discount_percentage: initialData.discount_percentage || 10,
          applicable_categories: initialData.applicable_categories,
          applicable_products: initialData.applicable_products,
          active: initialData.active,
          expires_at: initialData.expires_at,
        }
      : {
          code: "",
          discount_percentage: 0,
          applicable_categories: undefined,
          applicable_products: undefined,
          active: 1, // Default to active
          expires_at: undefined,
        }
  );

  // Set expiry date from initial data if available
  useEffect(() => {
    if (initialData?.expires_at) {
      try {
        const date = new Date(initialData.expires_at)
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          // Format as YYYY-MM-DD
          const formattedDate = date.toISOString().split('T')[0]
          setExpiryDate(formattedDate)
        }
      } catch (error) {
        console.error("Failed to parse expiry date:", error)
      }
    }
  }, [initialData])

  // Fetch categories and products for dropdowns
// In your CouponForm component, modify the fetchData function in the useEffect:

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoadingDropdowns(true)
      setFetchError(null)
      
      // Fetch categories
      const categoriesData = await categoriesApi.getCategories()
      setCategories(categoriesData.categories || [])
      
      // Fetch all products (up to 1000) like in the Products page
      const productsData = await productsApi.getProducts(0, 1000) // Fetch up to 1000 products
      setProducts(productsData.products || [])
      setFilteredProducts(productsData.products || [])
    } catch (err) {
      console.error("Failed to fetch form data:", err)
      setFetchError("Failed to load categories and products. Please refresh to try again.")
    } finally {
      setLoadingDropdowns(false)
    }
  }
  
  fetchData()
}, [])

  // Filter products based on search query
  useEffect(() => {
    if (!productSearchQuery.trim()) {
      setFilteredProducts(products)
      return
    }
    
    const query = productSearchQuery.toLowerCase()
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.description?.toLowerCase().includes(query)
    )
    setFilteredProducts(filtered)
  }, [productSearchQuery, products])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    if (type === "number") {
      const numValue = parseInt(value)
      // Ensure discount is between 1-100
      if (name === "discount_percentage") {
        const validDiscount = Math.min(100, Math.max(1, numValue || 0))
        setFormData({
          ...formData,
          [name]: validDiscount,
        })
      } else {
        setFormData({
          ...formData,
          [name]: numValue || 0,
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setExpiryDate(value)
    
    if (value) {
      try {
        // Create date object from the input value
        // Adding time to make it end of day in local timezone
        const date = new Date(`${value}T23:59:59.769`)
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date format")
        }
        
        // Format the date with correct millisecond precision and without Z at the end
        // The format needs to be: "2025-05-08T18:29:51.769304"
        const isoStringWithZ = date.toISOString()
        // Remove the 'Z' at the end
        const isoString = isoStringWithZ.substring(0, isoStringWithZ.length - 1)
        
        // Store the formatted string in the form data
        setFormData({
          ...formData,
          expires_at: isoString,
        })
        
        // Log the conversion for debugging
        console.log(`Date input: ${value}, ISO output: ${isoString}`)
      } catch (error) {
        console.error("Invalid date:", error)
      }
    } else {
      setFormData({
        ...formData,
        expires_at: undefined,
      })
    }
  }
  
  // Available for both create and edit modes now
  const handleActiveChange = (checked: boolean) => {
    setFormData({
      ...formData,
      active: checked ? 1 : 0,
    })
  }

  const handleCategoryChange = (categoryId: number) => {
    let newSelected: number[]
    
    if (selectedCategories.includes(categoryId)) {
      newSelected = selectedCategories.filter(c => c !== categoryId)
    } else {
      newSelected = [...selectedCategories, categoryId]
    }
    
    setSelectedCategories(newSelected)
    setFormData({
      ...formData,
      applicable_categories: newSelected.length > 0 ? newSelected : undefined,
    })
  }

  const handleProductChange = (productId: string) => {
    let newSelected: string[]
    
    if (selectedProducts.includes(productId)) {
      newSelected = selectedProducts.filter(p => p !== productId)
    } else {
      newSelected = [...selectedProducts, productId]
    }
    
    setSelectedProducts(newSelected)
    setFormData({
      ...formData,
      applicable_products: newSelected.length > 0 ? newSelected : undefined,
    })
  }

  const validateForm = (): boolean => {
    if (!formData.code || formData.code.trim() === "") {
      return false
    }
    
    if (!formData.discount_percentage || formData.discount_percentage < 1 || formData.discount_percentage > 100) {
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      await onSubmit(formData)
    } catch (err) {
      console.error("Form submission error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Check if current date is set to today (used for setting minimum date in date picker)
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fetchError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      
      {/* Code */}
      <div>
        <Label htmlFor="code" className="text-sm font-medium text-gray-700">
          Coupon Code *
        </Label>
        <Input
          id="code"
          name="code"
          value={formData.code}
          onChange={handleInputChange}
          placeholder="SUMMER25"
          required
          className="mt-1"
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-1">
          Must be unique. Customers will enter this code at checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discount Percentage */}
        <div>
          <Label htmlFor="discount_percentage" className="text-sm font-medium text-gray-700">
            Discount Percentage *
          </Label>
          <div className="mt-1 relative">
            <Input
              id="discount_percentage"
              name="discount_percentage"
              type="number"
              min="1"
              max="100"
              value={formData.discount_percentage || ""}
              onChange={handleInputChange}
              required
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500">%</span>
            </div>
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <Label htmlFor="expires_at" className="text-sm font-medium text-gray-700">
            Expiry Date
          </Label>
          <Input
            id="expires_at"
            type={isFocused ? "date" : "text"}
            value={expiryDate || ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(expiryDate ? true : false)}
            onChange={handleExpiryDateChange}
            className="mt-1"
            min={today}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank for no expiry date.
          </p>
        </div>
      </div>

      {/* Active Status - now shown in both create and edit modes */}
      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active === 1}
          onCheckedChange={handleActiveChange}
        />
        <Label htmlFor="active" className="text-sm font-medium text-gray-700">
          Coupon Active
        </Label>
        <p className="text-xs text-gray-500 ml-2">
          Inactive coupons cannot be used at checkout.
        </p>
      </div>

      {loadingDropdowns ? (
        <div className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading categories and products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Applicable Categories */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">
              Applicable Categories
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-xl">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-2">No categories available.</p>
              )}
            </div>
           
          </div>

          {/* Applicable Products with Search Bar */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">
              Applicable Products
            </Label>
            
            {/* Search input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-xl">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.product_id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`product-${product.product_id}`}
                      checked={selectedProducts.includes(product.product_id)}
                      onChange={() => handleProductChange(product.product_id)}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor={`product-${product.product_id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {product.name}
                    </Label>
                  </div>
                ))
              ) : productSearchQuery ? (
                <p className="text-sm text-gray-500 p-2">No products match your search.</p>
              ) : (
                <p className="text-sm text-gray-500 p-2">No products available.</p>
              )}
            </div>
            
            {filteredProducts.length > 0 && productSearchQuery && (
              <p className="text-xs text-blue-600 mt-1">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !validateForm() || loadingDropdowns}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEditing ? "Update Coupon" : "Create Coupon"
          )}
        </Button>
      </div>
    </form>
  )
}