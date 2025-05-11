"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTextBanner } from "@/lib/context/text-banner-context"
import { TextBannerResponse } from "@/lib/api/text-banners"
import { usePathname } from "next/navigation"

interface TextBannerProps {
  className?: string
  autoRotateInterval?: number
}

export function TextBanner({ 
  className = "", 
  autoRotateInterval = 5000 
}: TextBannerProps) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  
  // Don't render the banner on admin pages
  if (isAdminPage) {
    return null
  }
  const { banners, isLoading, error } = useTextBanner()
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get only active banners sorted by display_order
  const activeBanners = !isLoading && !error && banners.length > 0 
    ? [...banners]
        .filter(banner => banner.active === 1)
        .sort((a, b) => a.display_order - b.display_order) 
    : []
  
  // Set up auto-rotation timer
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    // Set new timer for rotation
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length)
    }, autoRotateInterval)
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [activeBanners.length, isPaused, autoRotateInterval])
  
  // Navigation functions
  const goToNextBanner = () => {
    if (activeBanners.length <= 1) return
    setCurrentIndex(prev => (prev + 1) % activeBanners.length)
    
    // Reset timer when manually navigating
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeBanners.length)
      }, autoRotateInterval)
    }
  }
  
  const goToPreviousBanner = () => {
    if (activeBanners.length <= 1) return
    setCurrentIndex(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1))
    
    // Reset timer when manually navigating
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeBanners.length)
      }, autoRotateInterval)
    }
  }
  
  // Handle mouse events to pause/resume rotation
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)
  
  // Don't render anything if there are no active banners or if loading/error
  if (isLoading || error || activeBanners.length === 0) {
    return null
  }
  
  return (
    <div 
      className={`w-full bg-black text-white text-sm py-2 relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Promotional announcements"
    >
      <div className="container mx-auto px-4 flex items-center justify-center relative">
        {/* Left navigation button */}
        {activeBanners.length > 1 && (
          <button 
            onClick={goToPreviousBanner}
            className="absolute left-2 md:left-4 p-1 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 focus:ring-offset-black rounded-full"
            aria-label="Previous banner"
            tabIndex={0}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        
        {/* Banner text with smooth transitions */}
        <div className="overflow-hidden text-center w-full max-w-4xl mx-auto px-8">
          <div
            key={activeBanners[currentIndex].id}
            className="animate-fade-in text-center"
            aria-live="polite"
          >
            {activeBanners[currentIndex].text}
          </div>
        </div>
        
        {/* Right navigation button */}
        {activeBanners.length > 1 && (
          <button 
            onClick={goToNextBanner}
            className="absolute right-2 md:right-4 p-1 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 focus:ring-offset-black rounded-full"
            aria-label="Next banner"
            tabIndex={0}
          >
            <ChevronRight size={18} />
          </button>
        )}
        
        {/* Navigation dots for accessibility */}
        {activeBanners.length > 1 && (
          <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/40 w-2'
                }`}
                aria-label={`Go to banner ${idx + 1}`}
                aria-current={idx === currentIndex ? 'true' : 'false'}
                tabIndex={-1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}