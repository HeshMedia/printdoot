// components/product/CustomizationPreview.tsx
"use client"

import { Button } from "@/components/ui/button"

interface CustomizationPreviewProps {
  productImageUrl: string
  saveCustomization: () => string | null
}

export default function CustomizationPreview({
  productImageUrl,
  saveCustomization,
}: CustomizationPreviewProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4">Customization Preview</h2>
      <div className="border rounded-xl mb-4 flex items-center justify-center" style={{ height: "500px" }}>
        <img src={productImageUrl} alt="Product Preview" className="object-cover" />
      </div>

      <Button onClick={saveCustomization}>Save Preview</Button>
    </div>
  )
}
