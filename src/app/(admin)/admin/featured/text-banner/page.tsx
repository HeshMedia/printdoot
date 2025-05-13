"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TextBannerList } from "@/components/admin/TextBannerList"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchTextBanners, TextBannerResponse } from "@/lib/api/text-banners"

// Banner Preview Component with navigation
interface BannerPreviewProps {
  banners: TextBannerResponse[]
}

function BannerPreview({ banners }: BannerPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }
  
  return (
    <div className="w-full bg-black text-white text-sm py-2 relative overflow-hidden">
      <div className="container mx-auto px-4 flex items-center justify-center">
        {banners.length > 1 && (
          <button 
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 p-1 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 focus:ring-offset-black rounded-full"
            aria-label="Previous banner"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        
        <div className="overflow-hidden text-center w-full max-w-4xl mx-auto px-8">
          <div className="animate-fade-in text-center">
            {banners[currentIndex].text}
          </div>
        </div>
        
        {banners.length > 1 && (
          <button 
            onClick={goToNext}
            className="absolute right-2 md:right-4 p-1 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 focus:ring-offset-black rounded-full"
            aria-label="Next banner"
          >
            <ChevronRight size={18} />
          </button>
        )}
        
        {banners.length > 1 && (
          <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/40 w-2'
                }`}
                aria-label={`Go to banner ${idx + 1}`}
                aria-current={idx === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TextBannersPage() {
  const [banners, setBanners] = useState<TextBannerResponse[]>([])
  const [activeBanners, setActiveBanners] = useState<TextBannerResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetchTextBanners()
      const allBanners = response.text_banners
      
      setBanners(allBanners)
      setActiveBanners(allBanners.filter(banner => banner.active === 1))
    } catch (err) {
      console.error("Error loading text banners:", err)
      setError("Failed to load text banners. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Refresh banners
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchBanners()
    setIsRefreshing(false)
  }
  
  useEffect(() => {
    fetchBanners()
  }, [])
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Text Banners</h1>
          <p className="text-gray-500 mt-1">
            Manage promotional messages displayed at the top of your site
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="relative"
          >
            <RefreshCw className={`h-4 w-4  ${isRefreshing ? "animate-spin" : ""}`} />
          
          </Button>
          
          <Button asChild>
            <Link href="/admin/featured/text-banner/new">
              <Plus className="h-4 w-4 " />
             
            </Link>
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Banner Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            This is how your active text banners will appear on your website
          </CardDescription>
        </CardHeader>        <CardContent>          {activeBanners.length > 0 ? (
            <div className="rounded-md overflow-hidden">
              {/* Pass the active banners directly to the component with navigation */}
              <BannerPreview banners={activeBanners} />
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-500 p-4 rounded-md text-center">
              No active banners to display
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Banner List */}
      <Card>
        <CardHeader>
          <CardTitle>All Text Banners</CardTitle>
          <CardDescription>
            View, edit and manage all your text banners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextBannerList 
            banners={banners} 
            onRefresh={fetchBanners}
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  )
}