"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import { 
  TextBannerResponse, 
  TextBannerCreate, 
  createTextBanner, 
  updateTextBanner, 
  deleteTextBanner 
} from "@/lib/api/text-banners"

interface TextBannerFormProps {
  banner?: TextBannerResponse
  isEditing?: boolean
  onSuccess?: () => void
}

export function TextBannerForm({ banner, isEditing = false, onSuccess }: TextBannerFormProps) {
  const router = useRouter()
  
  const [formData, setFormData] = useState<TextBannerCreate>({
    text: "",
    display_order: 1,
    active: 1
  })
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // If editing, populate form with existing data
  useEffect(() => {
    if (banner && isEditing) {
      setFormData({
        text: banner.text,
        display_order: banner.display_order,
        active: banner.active
      })
    }
  }, [banner, isEditing])
  
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  // Handle switch toggle for active status
  const handleActiveToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked ? 1 : 0
    }))
  }
  
  // Form validation
  const validateForm = (): boolean => {
    if (!formData.text.trim()) {
      setError("Banner text is required")
      return false
    }
    
    if (formData.display_order < 1) {
      setError("Display order must be at least 1")
      return false
    }
    
    return true
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }
    
    try {
      setIsSubmitting(true)
      
      if (isEditing && banner) {
        await updateTextBanner(banner.id, formData)
      } else {
        await createTextBanner(formData)
      }
      
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate back to list page
        router.push("/admin/featured/text-banner")
      }
      
    } catch (err) {
      console.error("Error saving text banner:", err)
      setError(`Failed to ${isEditing ? "update" : "create"} text banner`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle banner deletion
  const handleDelete = async () => {
    if (!banner || !isEditing) return
    
    const confirmed = window.confirm("Are you sure you want to delete this banner? This action cannot be undone.")
    
    if (!confirmed) return
    
    try {
      setIsDeleting(true)
      await deleteTextBanner(banner.id)
      
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate back to list page
        router.push("/admin/text-banners")
      }
    } catch (err) {
      console.error("Error deleting text banner:", err)
      setError("Failed to delete text banner")
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <Card className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Text Banner" : "Create New Text Banner"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update the properties of this text banner" 
              : "Add a new promotional message to display at the top of your site"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="text">Banner Text</Label>
            <Textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Enter promotional message text"
              className="resize-none"
              rows={3}
              required
            />
            <p className="text-sm text-gray-500">
              Keep it short and clear. You can use emojis for visual appeal.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              min={1}
              value={formData.display_order}
              onChange={handleChange}
              className="w-24"
              required
            />
            <p className="text-sm text-gray-500">
              Banners will display in numerical order (1 first, 2 second, etc.)
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active === 1}
              onCheckedChange={handleActiveToggle}
            />
            <Label htmlFor="active">Active</Label>
            <p className="text-sm text-gray-500 ml-2">
              Only active banners will be visible on the website
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Banner"
                )}
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/featured/text-banner")}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Save Changes" : "Create Banner"
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}