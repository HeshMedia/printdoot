// components/product/QuantitySelector.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface QuantitySelectorProps {
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
}

export default function QuantitySelector({ quantity, setQuantity }: QuantitySelectorProps) {
  return (
    <div className="mb-4">
      <Label htmlFor="quantity" className="block text-sm font-medium mb-1">
        Quantity
      </Label>
      <div className="flex items-center">
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
          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
          className="w-16 mx-2 text-center"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
          +
        </Button>
      </div>
    </div>
  )
}
