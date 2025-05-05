"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { couponsApi, CouponResponse, CouponUpdate } from "@/lib/api/admin/coupons"
import CouponForm from "@/components/admin/coupons/coupon-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EditCouponPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = Number(params.id)
  
  const [coupon, setCoupon] = useState<CouponResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch coupon details for editing
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true)
        setError(null)
        const couponData = await couponsApi.getCouponById(id)
        setCoupon(couponData)
      } catch (err) {
        console.error("Failed to fetch coupon:", err)
        setError("Failed to load coupon. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    if (id && !isNaN(id)) {
      fetchCoupon()
    } else {
      setError("Invalid coupon ID")
      setLoading(false)
    }
  }, [id])
  
  const handleUpdateCoupon = async (couponData: CouponUpdate) => {
    if (!coupon) return
    
    try {
      await couponsApi.updateCoupon(coupon.id, couponData)
      
      toast({
        title: "Coupon Updated",
        description: `Coupon "${couponData.code || coupon.code}" has been updated successfully.`,
      })
      
      // Navigate back to coupon details page
      router.push(`/admin/coupons/${coupon.id}`)
    } catch (err) {
      console.error("Failed to update coupon:", err)
      toast({
        title: "Error",
        description: "Failed to update coupon. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/admin/coupons/${id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coupon Details
        </Button>
        <h1 className="text-3xl font-bold flex-1">Edit Coupon</h1>
      </div>
      
      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading coupon...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : coupon ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <CouponForm 
            initialData={coupon}
            onSubmit={handleUpdateCoupon}
            onCancel={() => router.push(`/admin/coupons/${id}`)}
            isEditing={true}
          />
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm">
          <p className="text-gray-600">Coupon not found.</p>
        </div>
      )}
    </div>
  )
}