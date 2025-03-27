// components/product/CustomizationOptions.tsx
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface CustomizationOptionsProps {
  selectedCustomizations: Record<string, string>
  setSelectedCustomizations: React.Dispatch<React.SetStateAction<Record<string, string>>>
  handleTextChange: (text: string) => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleColorChange: (color: string) => void
}

export default function CustomizationOptions({
  selectedCustomizations,
  setSelectedCustomizations,
  handleTextChange,
  handleImageUpload,
  handleColorChange,
}: CustomizationOptionsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4">Product Options</h2>

      {/* Customizations */}
      {Object.entries(selectedCustomizations).map(([key, values]) => (
        <div key={key} className="mb-4">
          <Label htmlFor={key} className="block text-sm font-medium mb-1">
            {key}
          </Label>
          <Select
            value={selectedCustomizations[key] || ""}
            onValueChange={(value) => setSelectedCustomizations((prev) => ({ ...prev, [key]: value }))}
          >
            <SelectTrigger id={key}>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(values) &&
                values.map((value: string) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {/* Text Input */}
      <div className="mb-4">
        <Label htmlFor="custom-text" className="block text-sm font-medium mb-1">
          Custom Text
        </Label>
        <Input
          id="custom-text"
          placeholder="Enter your text here..."
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <Label htmlFor="custom-image" className="block text-sm font-medium mb-1">
          Upload Image
        </Label>
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {/* Color Picker */}
      <div className="mb-4">
        <Label htmlFor="custom-color" className="block text-sm font-medium mb-1">
          Choose Color
        </Label>
        <Input
          id="custom-color"
          type="color"
          onChange={(e) => handleColorChange(e.target.value)}
          className="h-10 w-full"
        />
      </div>
    </div>
  )
}
