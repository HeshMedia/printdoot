import React from 'react'
import { Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { BulkPrice } from '@/lib/api/products'

interface ProductPricingProps {
  price: number | null
  bulkPrices: BulkPrice[] | null
  quantity: number
}

const ProductPricing: React.FC<ProductPricingProps> = ({ 
  price, 
  bulkPrices = [], 
  quantity = 1
}) => {
  // Handle missing price data
  if (price === null || typeof price === 'undefined') {
    return (
      <div className="flex flex-col w-full">
        <div className="text-3xl font-bold text-muted-foreground">Price unavailable</div>
        <div className="text-sm text-muted-foreground mt-1">Please contact for pricing</div>
      </div>
    )
  }

  // Calculate the unit price based on quantity
  const getUnitPrice = (qty: number): number => {
    if (!Array.isArray(bulkPrices) || bulkPrices.length === 0) {
      return price
    }
    
    for (let i = 0; i < bulkPrices.length; i++) {
      const { min_quantity, max_quantity, price: bulkPrice } = bulkPrices[i]
      if (qty >= min_quantity && qty <= max_quantity) {
        return bulkPrice
      }
    }
    
    // If quantity is larger than any defined range, use the last bulk price
    if (quantity > (bulkPrices[bulkPrices.length - 1]?.max_quantity || 0)) {
      return bulkPrices[bulkPrices.length - 1]?.price || price
    }
    
    return price
  }

  const unitPrice = getUnitPrice(quantity)
  const totalPrice = unitPrice * quantity
  const discount = price > 0 ? Math.round((1 - (unitPrice / price)) * 100) : 0
  const hasBulkDiscount = discount > 0 && quantity > 1

  return (
    <div className="flex flex-col w-full">
      <div className="text-3xl font-bold text-blue-600">
        ₹{unitPrice.toFixed(2)}
      </div>
      
      {/* {hasBulkDiscount && (
        <div className="text-sm text-muted-foreground mt-1">
          <span className="line-through text-black">₹{price.toFixed(2)}</span> • <span className="text-green-600 font-medium">{discount}% bulk discount</span>
        </div>
      )}

      {Array.isArray(bulkPrices) && bulkPrices.length > 0 && (
        <div className="mt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="link" size="sm" className="p-0 h-auto text-blue-300 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">View bulk discounts</span>
                  <span className="sm:hidden">Bulk discounts</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="w-72 bg-blue-400">
                <div className="py-2 bg-blue-400">
                  <h4 className="font-medium mb-2">Bulk Pricing</h4>
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="pb-2 text-left font-medium">Quantity</th>
                        <th className="pb-2 text-right font-medium">Price/Unit</th>
                        <th className="pb-2 text-right font-medium">Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">1 - {(bulkPrices[0]?.min_quantity || 2) - 1}</td>
                        <td className="py-2 text-right ">₹{price.toFixed(2)}</td>
                        <td className="py-2 text-right">-</td>
                      </tr>
                      {bulkPrices.map((bp, index) => (
                        <tr key={index} className={index < bulkPrices.length - 1 ? "border-b" : ""}>
                          <td className="py-2">{bp.min_quantity} - {bp.max_quantity}</td>
                          <td className="py-2 text-right">₹{bp.price.toFixed(2)}</td>
                          <td className="py-2 text-right text-white">
                            {Math.round((1 - (bp.price / price)) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )} */}


    </div>
  )
}

export default ProductPricing