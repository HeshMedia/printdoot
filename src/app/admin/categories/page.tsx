"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, ChevronDown, ChevronUp } from "lucide-react"
import { categoriesApi, type Category } from "@/lib/api/admin/categories"
import CategoryForm from "@/components/admin/category-form"

export default function CategoriesPage() {
  // State to store the list of categories
  const [categories, setCategories] = useState<Category[]>([])
  // State to track loading status
  const [loading, setLoading] = useState(true)
  // State to store any error messages
  const [error, setError] = useState<string | null>(null)
  // State to toggle the category form visibility
  const [isFormOpen, setIsFormOpen] = useState(false)
  // State to track the category being edited
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  // State to track expanded categories for showing additional details
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({})

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true) // Start loading
        const data = await categoriesApi.getCategories() // Fetch categories from API
        setCategories(data) // Update state with fetched categories
        setLoading(false) // Stop loading
      } catch (err) {
        console.error("Failed to fetch categories:", err)
        setError("Failed to fetch categories") // Set error message
        setLoading(false) // Stop loading
      }
    }

    fetchCategories()
  }, [])

  // Handle creating a new category
  const handleCreateCategory = async (category: Category) => {
    try {
      setCategories([...categories, category]) // Add new category to the list
      setIsFormOpen(false) // Close the form
    } catch (err) {
      console.error("Failed to create category:", err)
    }
  }

  // Handle updating an existing category
  const handleUpdateCategory = async (category: Category) => {
    try {
      setCategories(categories.map((c) => (c.id === category.id ? category : c))) // Update the category in the list
      setEditingCategory(null) // Clear editing state
    } catch (err) {
      console.error("Failed to update category:", err)
    }
  }

  // Toggle the expanded state of a category to show/hide details
  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  return (
    <div>
      {/* Header section with title and "Add Category" button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null) // Clear editing state
            setIsFormOpen(!isFormOpen) // Toggle form visibility
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Form for creating a new category */}
      {isFormOpen && !editingCategory && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
          <CategoryForm onSubmit={handleCreateCategory} onCancel={() => setIsFormOpen(false)} />
        </div>
      )}

      {/* Form for editing an existing category */}
      {editingCategory && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Category: {editingCategory.name}</h2>
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditingCategory(null)}
            isEditing={true}
          />
        </div>
      )}

      {/* Main content area for displaying categories */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          // Show loading spinner while categories are being fetched
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : error ? (
          // Show error message if fetching categories fails
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : categories.length === 0 ? (
          // Show message if no categories are found
          <div className="p-8 text-center text-gray-600">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          // Display the list of categories
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {category.user_customization_options.length} customization options
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Edit button */}
                    <button onClick={() => setEditingCategory(category)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* Expand/Collapse button */}
                    <button onClick={() => toggleExpand(category.id)} className="text-gray-600 hover:text-gray-800">
                      {expandedCategories[category.id] ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded details for the category */}
                {expandedCategories[category.id] && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    {/* User customization options */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">User Customization Options</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.user_customization_options.map((option, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Allowed customizations */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Allowed Customizations</h4>
                      {Object.keys(category.allowed_customizations).length === 0 ? (
                        <p className="text-sm text-gray-500">No customizations defined</p>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(category.allowed_customizations).map(([key, values]) => (
                            <div key={key}>
                              <span className="text-sm font-medium">{key}:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {values.map((value, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                                  >
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
