// components/product/CanvasEditor.tsx
"use client"

import { useRef, useEffect } from "react"
import { fabric } from "fabric"

interface CanvasEditorProps {
  productImageUrl: string
}

export default function CanvasEditor({ productImageUrl }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const productImageRef = useRef<fabric.Image | null>(null)

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
      backgroundColor: "#f8f9fa",
      preserveObjectStacking: true
    })

    return () => {
      fabricCanvasRef.current?.dispose()
      fabricCanvasRef.current = null
      productImageRef.current = null
    }
  }, [])

  // Handle product image changes
  useEffect(() => {
    if (!productImageUrl || !fabricCanvasRef.current) return

    fabric.Image.fromURL(
      productImageUrl,
      (img) => {
        if (!fabricCanvasRef.current) return

        const canvas = fabricCanvasRef.current
        const scale = Math.min(
          (canvas.width! * 0.8) / (img.width || 1),
          (canvas.height! * 0.8) / (img.height || 1)
        )

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: "center",
          originY: "center",
          selectable: false,
          hoverCursor: "default",
        })

        // Remove previous image if exists
        if (productImageRef.current) {
          canvas.remove(productImageRef.current)
        }

        productImageRef.current = img
        canvas.add(img)
        canvas.sendToBack(img)
        canvas.renderAll()
      },
      {
        crossOrigin: 'anonymous',
        // Additional image loading options if needed
      }
    )
  }, [productImageUrl])

  return (
    <div className="border rounded-md mb-4 flex items-center justify-center" style={{ height: "500px" }}>
      <canvas ref={canvasRef} />
    </div>
  )
}