// components/ProductCustomizer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, Image } from 'fabric';

interface ProductCustomizerProps {
  productImage?: string; // Optional now since we're not using it
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  // Initialize canvas on component mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a simple canvas without background image
    const initCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f5f5f5'
    });
    setCanvas(initCanvas);

    // Cleanup on unmount
    return () => {
      initCanvas.dispose();
    };
  }, []);

  // Handle image upload from user
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target?.result || !canvas) return;
      
      try {
        // Create an HTML image element first
        const imgElement = new window.Image();
        const result = event.target.result.toString();
        
        const loadedImage = new Promise<HTMLImageElement>((resolve, reject) => {
          imgElement.onload = () => resolve(imgElement);
          imgElement.onerror = () => reject(new Error("Failed to load image"));
          imgElement.src = result;
        });
        
        const htmlImg = await loadedImage;
        const img = new Image(htmlImg);
        
        // Make the uploaded image interactive
        img.scaleToWidth(200);
        img.set({
          left: 100,
          top: 100,
          angle: 0,
          hasControls: true,
          borderColor: 'red',
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to load the selected image. Please try another image.");
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="customizer-container flex flex-col items-center p-4">
      <div className="canvas-container">
        <canvas ref={canvasRef} id="product-canvas" className="border border-gray-300 shadow-lg" />
      </div>
      
      <div className="controls-section mt-4 p-4 border border-gray-200 rounded-md shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Upload Your Design</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="upload-input block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <small className="text-xs text-gray-500 mt-1">Supported formats: PNG, JPG, SVG</small>
      </div>
    </div>
  );
};

export default ProductCustomizer;
