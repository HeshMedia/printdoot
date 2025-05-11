import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"

interface ProductGalleryProps {
  mainImageUrl: string | null
  sideImagesUrl: string[] | null
  productName: string
}

const ProductGallery = ({ 
  mainImageUrl, 
  sideImagesUrl = [], 
  productName = "Product" 
}: ProductGalleryProps) => {
  // Handle missing images with placeholders
  const allImages = [
    mainImageUrl || '/placeholder-product.png', 
    ...(sideImagesUrl?.filter(url => url) || [])
  ]
  
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  
  // Get the active image URL
  const activeImage = allImages[activeImageIndex]
  
  // Handle image zooming
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    
    setZoomPosition({ x, y })
  }
  
  // Image carousel navigation
  const nextImage = () => {
    const nextIndex = (activeImageIndex + 1) % allImages.length
    setActiveImageIndex(nextIndex)
  }
  
  const prevImage = () => {
    const prevIndex = (activeImageIndex - 1 + allImages.length) % allImages.length
    setActiveImageIndex(prevIndex)
  }
  
  // If there are no images, show a placeholder
  if (!mainImageUrl && (!sideImagesUrl || sideImagesUrl.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="bg-muted rounded-xl overflow-hidden aspect-square relative flex items-center justify-center">
          <div className="text-muted-foreground text-center p-4">
            <ZoomIn className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No product images available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main image with zoom */}
      <div 
        ref={imageRef}
        className="bg-white rounded-xl shadow overflow-hidden aspect-square relative group"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleImageMouseMove}
      >
        <Image
          src={activeImage}
          alt={`${productName} - Image ${activeImageIndex + 1}`}
          fill
          priority
          className="object-contain p-4 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"
          onError={(e) => {
            // Fallback for image loading errors
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.png';
          }}
        />
        
        {/* Zoom overlay */}
        {showZoom && (
          <div className="absolute inset-0 bg-black/5 pointer-events-none">
           
          </div>
        )}
        
        {/* Image lightbox indicator */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              variant="outline" 
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[95vh] sm:h-[95vh]">
            <SheetHeader>
              <SheetTitle>{productName}</SheetTitle>
              <SheetDescription>Image Gallery</SheetDescription>
            </SheetHeader>
            <div className="h-full flex justify-center items-center p-4">
              <div className="relative h-full w-full">
                <Image
                  src={activeImage}
                  alt={`${productName} - Image ${activeImageIndex + 1}`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.png';
                  }}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Image navigation buttons (only show if more than one image) */}
        {allImages.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-90 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-90 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnails (only show if more than one image) */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`
                relative flex-shrink-0
                w-20 h-20
                rounded-md overflow-hidden
                border-2 transition-all
                snap-start
                ${idx === activeImageIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"}
              `}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.png';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery