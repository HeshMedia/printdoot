"use client"

// Import React types and hooks
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Import types and API functions for products and categories
import { type ProductCreateInput, type ProductStatus, type Product, productsApi } from "@/lib/api/admin/products"
import { type Category, categoriesApi } from "@/lib/api/categories"

// Define props for the ProductForm component
interface ProductFormProps {
  initialData?: Product
  isEditing?: boolean
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  // Hook for route navigation
  const router = useRouter()

  // State to store list of categories from the API
  const [categories, setCategories] = useState<Category[]>([])
  // Loading state for form submission
  const [loading, setLoading] = useState(false)
  // General error state for form operations
  const [error, setError] = useState<string | null>(null)
  // Specific error state for image uploads
  const [uploadError, setUploadError] = useState<string | null>(null)
  // States for main image file and its preview URL
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(initialData?.main_image_url || null)
  // States for side images files and their preview URLs
  const [sideImages, setSideImages] = useState<File[]>([])
  const [sideImagePreviews, setSideImagePreviews] = useState<string[]>(initialData?.side_images_url || [])

  // Form data state. If editing, initialize with existing data; otherwise set defaults.
  const [formData, setFormData] = useState<ProductCreateInput>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    // For category_id, we try to find the correct id based on the category name.
    category_id: initialData ? categories.find((c) => c.name === initialData.category_name)?.id || 0 : 0,
    description: initialData?.description || "",
    customization_options: (initialData as any)?.customization_options || {},
    status: initialData?.status || "in_stock",
  })

  // useEffect to fetch categories when the component mounts.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get categories data from API
        const data = await categoriesApi.getCategories()
        setCategories(data)

        // If editing, update category_id based on the initialData category name.
        if (isEditing && initialData) {
          const category = data.find((c) => c.name === initialData.category_name)
          if (category) {
            setFormData((prev) => ({
              ...prev,
              category_id: category.id,
            }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
        setError("Failed to fetch categories. Please try again.")
      }
    }
    // Call the async function
    fetchCategories()
  }, [initialData, isEditing])

  // Handle changes for text inputs, textarea, and select elements (except status)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Special handling for numeric inputs
    if (name === "price") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value),
      })
    } else if (name === "category_id") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value, 10),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle change specifically for the status select field
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      status: e.target.value as ProductStatus,
    })
  }

  // Handle file input changes for the main image
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setMainImage(file)
      // Generate a preview URL for the main image
      setMainImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle file input changes for side images (allows multiple files)
  const handleSideImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSideImages((prev) => [...prev, ...files])
      // Generate preview URLs for each uploaded side image
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setSideImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  // Remove a side image at a specific index
  const removeSideImage = (index: number) => {
    setSideImages((prev) => prev.filter((_, i) => i !== index))
    setSideImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Update customization options when values change. Expects a comma-separated input.
  const handleCustomizationChange = (key: string, value: string) => {
    const options = { ...formData.customization_options }

    if (!value.trim()) {
      // Remove the option if value is empty
      if (options[key]) {
        delete options[key]
      }
    } else {
      // Split the string by commas and trim whitespace
      const values = value.split(",").map((v) => v.trim())
      options[key] = values
    }

    setFormData({
      ...formData,
      customization_options: options,
    })
  }

  // Add a new customization field by prompting the user for a field name
  const addCustomizationField = () => {
    const key = prompt("Enter customization field name:")
    if (key && key.trim() && !(formData.customization_options ?? {})[key]) {
      setFormData({
        ...formData,
        customization_options: {
          ...formData.customization_options,
          [key]: [],
        },
      })
    }
  }

  // Remove a customization field by key
  const removeCustomizationField = (key: string) => {
    const options = { ...formData.customization_options }
    delete options[key]

    setFormData({
      ...formData,
      customization_options: options,
    })
  }

  // Handle form submission and API calls for creating/updating products.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Set loading state and clear any previous errors
    setLoading(true)
    setError(null)
    setUploadError(null)

    try {
      let productId: string

      // If editing, update the product, otherwise create a new one.
      if (isEditing && initialData) {
        const updatedProduct = await productsApi.updateProduct(initialData.product_id, formData)
        productId = updatedProduct.product_id
      } else {
        const newProduct = await productsApi.createProduct(formData)
        productId = newProduct.product_id
      }

      // Handle image uploads if a main image is provided.
      if (mainImage) {
        try {
          await productsApi.uploadProductImages(productId, mainImage, sideImages.length > 0 ? sideImages : undefined)
        } catch (err) {
          console.error("Failed to upload images:", err)
          setUploadError("Product was created but image upload failed. You can try uploading images later.")
        }
      }

      // Redirect to admin products list upon success.
      router.push("/admin/products")
    } catch (err) {
      console.error("Failed to save product:", err)
      setError("Failed to save product. Please check your inputs and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Render the form interface.
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display error messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
      {uploadError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">{uploadError}</div>
      )}

      {/* Form fields in a responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Product Price Field */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Status Field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleStatusChange}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        {/* Product Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>

      {/* Customization Options Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Customization Options</h3>
          <button type="button" onClick={addCustomizationField} className="text-blue-600 hover:text-blue-800 text-sm">
            + Add Option
          </button>
        </div>

        {Object.keys(formData.customization_options ?? {}).length === 0 ? (
          <p className="text-gray-500 text-sm">No customization options added yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(formData.customization_options ?? {}).map(([key, values]) => (
              <div key={key} className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                  <input
                    type="text"
                    value={values.join(", ")}
                    onChange={(e) => handleCustomizationChange(key, e.target.value)}
                    placeholder="Enter values separated by commas"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomizationField(key)}
                  className="mt-7 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Images Section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Product Images</h3>

        {/* Images upload grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              {mainImagePreview ? (
                // If a preview exists, show the image with a remove button
                <div className="space-y-2">
                  <img
                    src={mainImagePreview || "/placeholder.svg"}
                    alt="Main product"
                    className="mx-auto h-40 w-40 object-cover rounded-md"
                  />
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMainImage(null)
                        setMainImagePreview(null)
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                // Otherwise, render the file upload input
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="main-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="main-image-upload"
                        name="main-image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Side Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="side-images-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Upload files</span>
                    <input
                      id="side-images-upload"
                      name="side-images-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={handleSideImagesChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Display side image previews */}
            {sideImagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {sideImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Side ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeSideImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form submission buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  )
}
