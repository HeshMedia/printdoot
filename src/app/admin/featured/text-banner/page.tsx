"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TextBannerList } from "@/components/admin/TextBannerList"
import { TextBanner } from "@/components/layout/TextBanner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, RefreshCw, AlertCircle } from "lucide-react"
import { fetchTextBanners, TextBannerResponse } from "@/lib/api/text-banners"

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
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button asChild>
            <Link href="/admin/featured/text-banner/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Banner
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
        </CardHeader>
        <CardContent>
          {activeBanners.length > 0 ? (
            <div className="rounded-md overflow-hidden">
              <TextBanner />
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