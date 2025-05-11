// components/product/QuantitySelector.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BulkPrice } from "@/lib/api/products"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuantitySelectorProps {
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  bulkPrices?: BulkPrice[] | null
}

export default function QuantitySelector({ quantity, setQuantity, bulkPrices }: QuantitySelectorProps) {
  // Handle quantity input validation
  const handleQuantityChange = (value: string) => {
    const numVal = parseInt(value)
    if (!isNaN(numVal) && numVal > 0) {
      setQuantity(numVal)
    } else if (value === '') {
      setQuantity(1)
    }
  }
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="quantity" className="text-sm font-medium">
          Quantity
        </Label>
        
        {/* Bulk pricing tooltip */}
        {bulkPrices && bulkPrices.length > 0 && (
          <TooltipProvider delayDuration={100}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button variant="link" size="sm" className="text-blue-400 p-0 h-auto">
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-xs">Bulk discounts available</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-blue-400 w-64">
                <div className="py-2">
                  <h4 className="font-medium mb-2 text-sm">Bulk Pricing</h4>
                  <div className="text-xs  space-y-1">
                    {bulkPrices.map((bp, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{bp.min_quantity} - {bp.max_quantity} units:</span>
                        <span className="font-medium">₹{bp.price.toFixed(2)}/each</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center mt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          -
        </Button>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          className="w-16 mx-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </Button>
      </div>
    </div>
  )
}
