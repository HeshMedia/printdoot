"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { couponsApi, CouponResponse } from "@/lib/api/admin/coupons"
import { categoriesApi } from "@/lib/api/admin/categories"
import { productsApi } from "@/lib/api/admin/products"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/formDate"
import { Edit, ArrowLeft, Trash2, AlertTriangle } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function CouponDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = Number(params.id)
  
  const [coupon, setCoupon] = useState<CouponResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{[id: number]: string}>({})
  const [products, setProducts] = useState<{[id: string]: string}>({})
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  
  // Format date with proper error handling
  const formatDateSafe = (dateString?: string): string => {
    if (!dateString) return "Never"
    try {
      return formatDate(dateString)
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid date"
    }
  }
  
  // Fetch coupon details
  useEffect(() => {
    const fetchCouponData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch coupon detail
        const couponData = await couponsApi.getCouponById(id)
        setCoupon(couponData)
        
        // Fetch categories data to show names
        if (couponData.applicable_categories?.length) {
          const categoriesData = await categoriesApi.getCategories()
          const catMap: {[id: number]: string} = {}
          categoriesData.categories.forEach(cat => {
            catMap[cat.id] = cat.name
          })
          setCategories(catMap)
        }
        
        // Fetch products data to show names
        if (couponData.applicable_products?.length) {
          const productsData = await productsApi.getProducts()
          const prodMap: {[id: string]: string} = {}
          productsData.products.forEach(prod => {
            prodMap[prod.product_id] = prod.name
          })
          setProducts(prodMap)
        }
      } catch (err) {
        console.error("Failed to fetch coupon details:", err)
        setError("Failed to load coupon details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    if (id && !isNaN(id)) {
      fetchCouponData()
    } else {
      setError("Invalid coupon ID")
      setLoading(false)
    }
  }, [id])
  
  // Handle coupon deletion
  const handleDelete = async () => {
    if (!coupon) return
    
    try {
      await couponsApi.deleteCoupon(coupon.id)
      toast({
        title: "Coupon Deleted",
        description: `Coupon "${coupon.code}" has been deleted successfully.`,
      })
      router.push("/admin/coupons")
    } catch (err) {
      console.error("Failed to delete coupon:", err)
      toast({
        title: "Error",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConfirmDialogOpen(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push("/admin/coupons")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coupons
        </Button>
        <h1 className="text-3xl font-bold flex-1">Coupon Details</h1>
      </div>
      
      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading coupon details...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : coupon ? (
        <>
          <Card className="p-6 bg-white rounded-xl shadow-sm mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{coupon.code}</h2>
                <p className="text-gray-600 text-sm">Created on {formatDateSafe(coupon.created_at)}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/admin/coupons/${coupon.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsConfirmDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Coupon Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Discount Percentage</p>
                    <p className="text-lg font-semibold">{coupon.discount_percentage}%</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={coupon.active === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {coupon.active === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Expiration Date</p>
                    <p className="font-medium">{formatDateSafe(coupon.expires_at)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Applicability</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Applicable Categories</p>
                  {coupon.applicable_categories?.length ? (
                    <ul className="list-disc ml-5 space-y-1">
                      {coupon.applicable_categories.map(catId => (
                        <li key={catId}>{categories[catId] || `Category ID: ${catId}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">All categories</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Applicable Products</p>
                  {coupon.applicable_products?.length ? (
                    <ul className="list-disc ml-5 space-y-1">
                      {coupon.applicable_products.map(prodId => (
                        <li key={prodId}>{products[prodId] || `Product ID: ${prodId}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">All products</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Usage Information</h3>
            <p className="text-gray-600 mb-4">
              Customers will enter the coupon code <span className="font-mono bg-gray-100 px-2 py-1 rounded">{coupon.code}</span> at checkout to receive {coupon.discount_percentage}% off their purchase.
            </p>
            
            {coupon.active !== 1 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-amber-700">
                <p className="font-semibold">Note: This coupon is currently inactive</p>
                <p className="text-sm">Customers cannot use this coupon until it is activated.</p>
              </div>
            )}
            
            {coupon.expires_at && new Date(coupon.expires_at) < new Date() && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-3 text-red-700">
                <p className="font-semibold">Note: This coupon has expired</p>
                <p className="text-sm">The expiration date has passed.</p>
              </div>
            )}
          </Card>
        </>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm">
          <p className="text-gray-600">Coupon not found.</p>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon "{coupon?.code}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}