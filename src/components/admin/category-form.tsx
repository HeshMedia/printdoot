// components/product/CategoryForm.tsx
"use client"

import { useState } from "react"
import { categoriesApi } from "@/lib/api/admin/categories"
import CategoryNameInput from "./CategoryNameInput"
import UserCustomizationOptions from "./UserCustomizationOptions"
import AllowedCustomizations from "./AllowedCustomizations"
import SubmitCancelButtons from "./SubmitCancelButtons"

interface CategoryFormProps {
  initialData?: any
  isEditing?: boolean
  onSubmit: (category: any) => void
  onCancel: () => void
}

export default function CategoryForm({ initialData, isEditing = false, onSubmit, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    allowed_customizations: initialData?.allowed_customizations || {},
    user_customization_options: initialData?.user_customization_options || [],
  })

  const customizationOptions = ["text", "image", "color"]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCustomizationOptionChange = (option: string) => {
    const currentOptions = [...formData.user_customization_options]

    if (currentOptions.includes(option)) {
      setFormData({
        ...formData,
        user_customization_options: currentOptions.filter((opt) => opt !== option),
      })
    } else {
      setFormData({
        ...formData,
        user_customization_options: [...currentOptions, option],
      })
    }
  }

  const handleCustomizationChange = (key: string, value: string) => {
    const customizations = { ...formData.allowed_customizations }

    if (!value.trim()) {
      if (customizations[key]) {
        delete customizations[key]
      }
    } else {
      const values = value.split(",").map((v) => v.trim())
      customizations[key] = values
    }

    setFormData({
      ...formData,
      allowed_customizations: customizations,
    })
  }

  const addCustomizationField = () => {
    const key = prompt("Enter customization field name:")
    if (key && key.trim() && !(formData.allowed_customizations?.[key])) {
      setFormData({
        ...formData,
        allowed_customizations: {
          ...formData.allowed_customizations,
          [key]: [],
        },
      })
    }
  }

  const removeCustomizationField = (key: string) => {
    const customizations = { ...formData.allowed_customizations }
    delete customizations[key]

    setFormData({
      ...formData,
      allowed_customizations: customizations,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result: any

      if (isEditing && initialData) {
        result = await categoriesApi.updateCategory(initialData.id, formData)
      } else {
        result = await categoriesApi.createCategory(formData)
      }

      onSubmit(result)
    } catch (err) {
      console.error("Failed to save category:", err)
      setError("Failed to save category. Please check your inputs and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      <CategoryNameInput value={formData.name} onChange={handleInputChange} />

      <UserCustomizationOptions
        options={customizationOptions}
        selectedOptions={formData.user_customization_options}
        onChange={handleCustomizationOptionChange}
      />

      <AllowedCustomizations
        customizations={formData.allowed_customizations}
        onChange={handleCustomizationChange}
        onAdd={addCustomizationField}
        onRemove={removeCustomizationField}
      />

      <SubmitCancelButtons
        onCancel={onCancel}
        onSubmit={handleSubmit}
        loading={loading}
        isEditing={isEditing}
        isFormInvalid={formData.user_customization_options.length === 0}
      />
    </form>
  )
}
