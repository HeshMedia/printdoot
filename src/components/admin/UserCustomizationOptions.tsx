// components/product/UserCustomizationOptions.tsx
"use client"

import { UserCustomizationOption } from "@/lib/api/admin/categories"

interface UserCustomizationOptionsProps {
  options: UserCustomizationOption[]
  selectedOptions: UserCustomizationOption[]
  onChange: (option: UserCustomizationOption) => void
}

export default function UserCustomizationOptions({
  options,
  selectedOptions,
  onChange,
}: UserCustomizationOptionsProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">User Customization Options *</label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => onChange(option)}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="capitalize">{option}</span>
          </label>
        ))}
      </div>
      {selectedOptions.length === 0 && (
        <p className="text-red-500 text-sm mt-1">Please select at least one customization option</p>
      )}
    </div>
  )
}
