import React from 'react'
import { Truck, AlertTriangle } from 'lucide-react'
import type { BulkPrice } from '@/lib/api/products'

interface ProductDeliveryProps {
  standardDeliveryTime?: string
  expressDeliveryTime?: string
  bulkPrices: BulkPrice[] | null
  weight?: number
  quantity: number
}

const ProductDelivery: React.FC<ProductDeliveryProps> = ({ 
  standardDeliveryTime,
  expressDeliveryTime,
  bulkPrices = [], 
  weight = 0,
  quantity = 1
}) => {
  // Calculate estimated delivery date
  const getEstimatedDeliveryDate = (deliveryTimeInDays: number) => {
    const today = new Date()
    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + deliveryTimeInDays)
    
    return deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  // Parse the delivery times from strings (e.g., "2-3 business days")
  const parseDeliveryDays = (deliveryTimeStr?: string): { min: number; max: number } => {
    if (!deliveryTimeStr) return { min: 3, max: 5 }; // Default values
    
    const match = deliveryTimeStr.match(/(\d+)-(\d+)/)
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[2]) }
    }
    
    const singleMatch = deliveryTimeStr.match(/(\d+)/)
    if (singleMatch) {
      return { min: parseInt(singleMatch[1]), max: parseInt(singleMatch[1]) }
    }
    
    return { min: 3, max: 5 }; // Default values
  }

  // Get shipping cost from bulk prices
  const getShippingCost = (isExpress: boolean = false): number => {
    // Find the applicable bulk price tier
    for (const bp of bulkPrices || []) {
      if (quantity >= bp.min_quantity && quantity <= bp.max_quantity) {
        return isExpress 
          ? (bp.express_delivery_price ?? 149) 
          : (bp.standard_delivery_price ?? 49)
      }
    }

    // If quantity exceeds all tiers, use the last tier
    if (bulkPrices && bulkPrices.length > 0 && quantity > bulkPrices[bulkPrices.length - 1].max_quantity) {
      const lastTier = bulkPrices[bulkPrices.length - 1]
      return isExpress 
        ? (lastTier.express_delivery_price ?? 149) 
        : (lastTier.standard_delivery_price ?? 49)
    }

    // Default values
    return isExpress ? 149 : 49
  }

  // Calculate shipping based on weight if delivery time isn't provided
  const getFallbackDeliveryTime = (): string => {
    if (weight < 500) return "1-2 "
    else if (weight < 2000) return "2-3 "
    else return "3-5"
  }

  const standardDelivery = standardDeliveryTime || getFallbackDeliveryTime()
  const expressDelivery = expressDeliveryTime || "1-2 "
  
  const standardDays = parseDeliveryDays(standardDelivery)
  const expressDays = parseDeliveryDays(expressDelivery)
  
  const standardEstimate = getEstimatedDeliveryDate(standardDays.max)
  const expressEstimate = getEstimatedDeliveryDate(expressDays.max)
  
  const standardShippingCost = getShippingCost(false)
  const expressShippingCost = getShippingCost(true)
  const isFreeShipping = standardShippingCost <= 0

  return (
    <div className="bg-muted p-4 rounded-lg space-y-3">
      <h3 className="flex items-center font-medium text-lg">
        <Truck className="h-5 w-5 mr-2" />
        Delivery Information
      </h3>

      {/* Standard delivery */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">Standard Delivery</p>
          <p className="text-sm text-muted-foreground">{standardDelivery} buisness days</p>
          <p className="text-xs mt-1">Est. arrival: {standardEstimate}</p>
        </div>
        <div className="text-right">
          {isFreeShipping ? (
            <span className="text-green-600 font-semibold">FREE</span>
          ) : (
            <span>₹{standardShippingCost}</span>
          )}
        </div>
      </div>

      {/* Express delivery */}
      <div className="flex items-start justify-between pt-2 border-t">
        <div>
          <p className="font-medium">Express Delivery</p>
          <p className="text-sm text-muted-foreground">{expressDelivery} buisness days</p>
          <p className="text-xs mt-1">Est. arrival: {expressEstimate}</p>
        </div>
        <div className="text-right">
          <span>₹{expressShippingCost}</span>
        </div>
      </div>

      {/* Free shipping threshold */}
      {!isFreeShipping && (
        <div className="text-sm pt-2 border-t text-green-600">
          Free standard shipping on orders over ₹499
        </div>
      )}

      {/* Fallback notice if delivery times are estimations */}
      {!standardDeliveryTime && !expressDeliveryTime && (
        <div className="flex items-start gap-2 mt-2 pt-2 border-t text-amber-600 text-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>Estimated delivery times. Contact us for precise delivery information.</p>
        </div>
      )}
    </div>
  )
}

export default ProductDelivery