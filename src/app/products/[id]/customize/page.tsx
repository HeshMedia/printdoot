// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { useToast } from "@/components/ui/use-toast"
// import { useCart } from "@/lib/context/cart-context"
// import CanvasEditor from "@/components/product/CanvasEditor"
// import CustomizationOptions from "@/components/product/CustomizationOptions"
// import ProductDetails from "@/components/product/ProductDetails"
// import CustomizationPreview from "@/components/product/CustomizationPreview"

// interface Product {
//   product_id: string;
//   name: string;
//   main_image_url: string;
//   price: number;
//   description: string;
//   average_rating: number;
//   status: string;
//   side_images_url: string[];
//   category_name: string;
//   // add other properties as needed
// }

// interface Category {
//   id: string;
//   name: string;
//   // add other properties as needed
// }

// export default function ProductCustomizePage() {
//   const params = useParams()
//   const router = useRouter()
//   const { toast } = useToast()
//   const { addItem } = useCart()
//   const productId = params.id as string

//   const [product, setProduct] = useState<Product | null>(null)
//   const [category, setCategory] = useState<Category | null>(null)
//   const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({})
//   const [userCustomization, setUserCustomization] = useState<any>({
//     type: "text",
//     value: "",
//   })
//   const [quantity, setQuantity] = useState(1)

//   useEffect(() => {
//     // Fetch product and category data
//     const fetchProductData = async () => {
//       // Add your fetching logic here
//     }
//     fetchProductData()
//   }, [productId])

//   const handleAddToCart = () => {
//     if (!product) return

//     const cartItem = {
//       product,
//       quantity,
//       selectedCustomizations,
//       userCustomization,
//       customPreviewUrl: null, // Add preview URL logic here
//     }

//     // addItem(cartItem)

//     toast({
//       title: "Added to Cart",
//       description: `${product.name} has been added to your cart.`,
//     })

//     router.push("/cart")
//   }

//   if (!product || !category) {
//     return <div>Loading...</div>
//   }

//   return (
//     <div className="container py-8">
//       <h1 className="text-3xl font-bold mb-6">Customize Your {product.name}</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <CanvasEditor productImageUrl={product.main_image_url} />
//         <div>
//           <ProductDetails
//             product={product}
//             quantity={quantity}
//             setQuantity={setQuantity}
//             handleAddToCart={handleAddToCart}
//           />
//           <CustomizationOptions
//             selectedCustomizations={selectedCustomizations}
//             setSelectedCustomizations={setSelectedCustomizations}
//             handleTextChange={(text: string) => setUserCustomization({ ...userCustomization, value: text })}
//             handleImageUpload={() => {}}
//             handleColorChange={() => {}}
//           />
//         </div>
//       </div>

//       <CustomizationPreview productImageUrl={product.main_image_url} saveCustomization={() => null} />
//     </div>
//   )
// }

import React from 'react'

function edit () {
  return (
    <div>edit </div>
  )
}

export default edit 
