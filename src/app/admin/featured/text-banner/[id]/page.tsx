"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TextBannerForm } from "@/components/admin/TextBannerForm"
import { fetchTextBanners, TextBannerResponse } from "@/lib/api/text-banners"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"

export default function EditTextBannerPage() {
  const params = useParams()
  const router = useRouter()
  const bannerId = parseInt(params.id as string)
  
  const [banner, setBanner] = useState<TextBannerResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadBanner = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (isNaN(bannerId)) {
          setError("Invalid banner ID")
          return
        }
        
        const response = await fetchTextBanners()
        const foundBanner = response.text_banners.find(b => b.id === bannerId)
        
        if (!foundBanner) {
          setError(`Banner with ID ${bannerId} not found`)
          return
        }
        
        setBanner(foundBanner)
      } catch (err) {
        console.error("Error loading text banner:", err)
        setError("Failed to load text banner")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadBanner()
  }, [bannerId])
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/admin/featured/text-banner">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Text Banners
            </Link>
          </Button>
        </div>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/featured/text-banner">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Text Banners
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Edit Text Banner</h1>
      
      {banner && (
        <TextBannerForm 
          banner={banner} 
          isEditing={true}
          onSuccess={() => router.push("/admin/featured/text-banner")} 
        />
      )}
    </div>
  )
}