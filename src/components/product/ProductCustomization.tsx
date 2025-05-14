import React from 'react'
import { Info, Check } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type CustomizationOptions = Record<string, Record<string, string | number>>

interface ProductCustomizationProps {
  customizationOptions: CustomizationOptions | null
  selectedCustomizations: Record<string, string>
  setSelectedCustomizations: (customizations: Record<string, string>) => void
}

const ProductCustomization: React.FC<ProductCustomizationProps> = ({ 
  customizationOptions,
  selectedCustomizations,
  setSelectedCustomizations
}) => {
  // If there are no customization options, don't render anything
  if (!customizationOptions || Object.keys(customizationOptions).length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Customization Options</h3>
      
      {Object.entries(customizationOptions).map(([optionName, values]) => {
        // Skip if values is not an object
        if (!values || typeof values !== 'object' || Array.isArray(values)) {
          return null
        }
        
        return (
          <div key={optionName}>
            <label className="block text-sm font-medium mb-2">
              {optionName.charAt(0).toUpperCase() + optionName.slice(1)}
            </label>
            
            {/* Different UI for different option types */}
            {optionName.toLowerCase() === "color" ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(values).map(([value, colorCode], i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCustomizations({
                      ...selectedCustomizations,
                      [optionName]: value
                    })}
                    aria-label={`Select color: ${value}`}
                    className={`
                      w-8 h-8 rounded-full border-2
                      ${selectedCustomizations[optionName] === value 
                        ? "border-primary ring-2 ring-primary/30" 
                        : "border-gray-200"
                      }
                      transition-all
                    `}
                    style={{ 
                      backgroundColor: typeof colorCode === 'string' ? colorCode : undefined 
                    }}
                    title={value}
                  >
                    {selectedCustomizations[optionName] === value && (
                      <Check className="w-4 h-4 mx-auto text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <Select
                value={selectedCustomizations[optionName] || ""}
                onValueChange={(value) => setSelectedCustomizations({
                  ...selectedCustomizations, 
                  [optionName]: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${optionName}`} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(values).map(([value, extraInfo], i) => (
                    <SelectItem key={i} value={value}>
                      <span className="flex items-center justify-between w-full">
                        <span>{value}</span>
                       
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )
      })}
      
      {/* Customization Help Info */}
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <h4 className="flex items-center text-blue-800 font-medium mb-2">
          <Info className="mr-2 h-5 w-5" />
          How To Customize
        </h4>
        <p className="text-blue-700 text-sm">
          After adding this product to your cart, you&apos;ll be able to provide detailed customization
          instructions including text, images, or special requirements. Our team will work with 
          you to ensure your product is exactly as you envisioned.
        </p>
      </div>
    </div>
  )
}

export default ProductCustomization