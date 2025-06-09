// components/product/CustomizationPreview.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAtom } from "jotai"
import { addToCartAtom } from "@/lib/atoms/cartAtoms"
import { Product } from "@/lib/api/products"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Save, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CustomizationPreviewProps {
  productImageUrl: string
  saveCustomization: () => string | null
  product: Product
  selectedCustomizations: Record<string, string>
  quantity: number
}

export default function CustomizationPreview({
  productImageUrl,
  saveCustomization,
  product,
  selectedCustomizations,
  quantity
}: CustomizationPreviewProps) {
  const [, addToCart] = useAtom(addToCartAtom)
  const { toast } = useToast()
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false)
  const [designId, setDesignId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Save customization and add to cart
  const handleAddToCart = () => {
    // First save the design to get the designId
    const savedDesignId = saveCustomization()
    setDesignId(savedDesignId)

    if (savedDesignId) {
      // Successfully saved, now add to cart
      setIsAdding(true)
      try {
        addToCart({
          product,
          quantity,
          selectedCustomizations,
          designId: savedDesignId,
          customPreviewUrl: productImageUrl
        })
        
        toast({
          title: "Added to cart!",
          description: `${product.name} has been added to your cart.`,
          duration: 3000
        })
        setIsAdding(false)
        setShowAddToCartDialog(false)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add item to cart",
          duration: 3000
        })
        setIsAdding(false)
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your design",
        duration: 3000
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4">Customization Preview</h2>
      <div className="border rounded-xl mb-4 flex items-center justify-center" style={{ height: "500px" }}>
        <img src={productImageUrl} alt="Product Preview" className="object-cover" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={saveCustomization} variant="outline" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save Preview
        </Button>
        
        <Button 
          onClick={() => setShowAddToCartDialog(true)} 
          variant="default"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      {/* Add to Cart Dialog */}
      <Dialog open={showAddToCartDialog} onOpenChange={setShowAddToCartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
            <DialogDescription>
              Save your design and add this product to cart?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="border rounded-lg overflow-hidden w-20 h-20">
                <img src={productImageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                <p className="text-sm font-semibold">₹{product.price * quantity}</p>
              </div>
            </div>
            
            <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm">Your design will be saved before adding to cart</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddToCartDialog(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <>Processing...</>
              ) : (
                <>Add to Cart</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
