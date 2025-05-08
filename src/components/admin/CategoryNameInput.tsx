// components/product/CategoryNameInput.tsx
"use client"

interface CategoryNameInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function CategoryNameInput({ value, onChange }: CategoryNameInputProps) {
  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
        Category Name *
      </label>
      <input
        type="text"
        id="name"
        name="name"
        required
        value={value}
        onChange={onChange}
        className="w-full border rounded-xl px-3 py-2"
      />
    </div>
  )
}
