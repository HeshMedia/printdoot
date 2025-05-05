"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the TextBanner data structure
interface TextBannerItem {
  id: number
  text: string
  display_order: number
  active: number // 0 or 1
  created_at: string
}

// Props for the component
interface TextBannerProps {
  banners?: TextBannerItem[]
  autoRotateInterval?: number
  className?: string
}

export function TextBanner({
  banners = [],
  autoRotateInterval = 5000,
  className
}: TextBannerProps) {
  // Filter only active banners and sort by display_order
  const activeBanners = banners
    .filter(banner => banner.active === 1)
    .sort((a, b) => a.display_order - b.display_order)
  
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  
  // Handle navigation between banners
  const goToNext = () => {
    if (activeBanners.length <= 1) return
    setCurrentIndex(prevIndex => (prevIndex + 1) % activeBanners.length)
  }
  
  const goToPrevious = () => {
    if (activeBanners.length <= 1) return
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
    )
  }
  
  // Auto-rotate banners with the specified interval
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return
    
    const rotationTimer = setInterval(goToNext, autoRotateInterval)
    
    return () => clearInterval(rotationTimer)
  }, [currentIndex, isPaused, activeBanners.length, autoRotateInterval])
  
  // If no active banners, don't render anything
  if (activeBanners.length === 0) return null
  
  return (
    <div 
      className={cn(
        "w-full bg-black text-white text-sm py-2 relative",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-live="polite"
    >
      <div className="container mx-auto px-4 flex items-center justify-center">
        {/* Left navigation button */}
        {activeBanners.length > 1 && (
          <button 
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 p-1 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Previous banner"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        
        {/* Banner text with animation */}
        <div className="overflow-hidden text-center w-full max-w-4xl mx-auto px-8">
          <div
            key={activeBanners[currentIndex].id}
            className="animate-fade-in"
          >
            {activeBanners[currentIndex].text}
          </div>
        </div>
        
        {/* Right navigation button */}
        {activeBanners.length > 1 && (
          <button 
            onClick={goToNext}
            className="absolute right-2 md:right-4 p-1 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Next banner"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}