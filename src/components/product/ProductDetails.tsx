// components/product/ProductDetails.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Ruler, ShoppingCart } from "lucide-react"
import ProductDimensions from "./ProductDimensions"

interface ProductDetailsProps {
  product: any
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  handleAddToCart: () => void
}

export default function ProductDetails({
  product,
  quantity,
  setQuantity,
  handleAddToCart,
}: ProductDetailsProps) {
  // Format the product dimensions for display
  const formatDimensions = () => {
    if (!product.dimensions) return "Dimensions unavailable";
    
    // Handle dimensions regardless of format
    const dimensionsArray = Array.isArray(product.dimensions) 
      ? product.dimensions 
      : [product.dimensions];
    
    // Filter out empty dimension objects
    const validDimensions = dimensionsArray.filter((dim: { length: any; breadth: any; height: any; radius: any }) => 
      dim && (dim.length || dim.breadth || dim.height || dim.radius)
    );
    
    if (validDimensions.length === 0) return "Dimensions unavailable";
    
    const dim = validDimensions[0]; // Use first valid dimension
    
    return dim.radius 
      ? `${dim.radius} cm (radius)`
      : `${dim.length || '?'} × ${dim.breadth || '?'} × ${dim.height || '?'} cm`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Product Specifications
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Product specifications */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Material</Label>
              <p className="font-medium">{product.material || "Not specified"}</p>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Weight</Label>
              <p className="font-medium">{product.weight ? `${product.weight} g` : "Not specified"}</p>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Dimensions</Label>
              <p className="font-medium">{formatDimensions()}</p>
            </div>
          </div>
          
          {/* Full dimensions display using the dimensions component */}
          <ProductDimensions 
            dimensions={product.dimensions} 
            weight={product.weight}
            material={product.material}
          />
        </div>
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Order Information</h3>
        
        <div className="mb-4">
          <Label htmlFor="quantity" className="block text-sm font-medium mb-2">
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

        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Price per unit:</span>
          <span className="font-medium">₹{product.price.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4 text-lg">
          <span className="font-medium">Total:</span>
          <span className="font-bold text-primary">₹{(product.price * quantity).toFixed(2)}</span>
        </div>

        <Button 
          onClick={handleAddToCart} 
          disabled={product.status !== "in_stock"}
          className="w-full"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
