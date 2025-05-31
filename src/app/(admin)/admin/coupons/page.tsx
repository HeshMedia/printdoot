"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import CouponTable from "@/components/admin/coupons/coupon-table"
import CouponForm from "@/components/admin/coupons/coupon-form"
import { couponsApi, CouponResponse, CouponCreate, CouponUpdate } from "@/lib/api/admin/coupons"
import PaginationControl from "@/components/ui/pagination-control"
import Loader from "@/components/ui/loader"

export default function CouponsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [coupons, setCoupons] = useState<CouponResponse[]>([])
  const [filteredCoupons, setFilteredCoupons] = useState<CouponResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingCouponId, setDeletingCouponId] = useState<number | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [paginatedCoupons, setPaginatedCoupons] = useState<CouponResponse[]>([])
  
  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const data = await couponsApi.getCoupons()
      setCoupons(data.coupons)
      setFilteredCoupons(data.coupons)
    } catch (err) {
      console.error("Failed to fetch coupons:", err)
      setError("Failed to fetch coupons. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])
  
  // Apply filters whenever the search query, status filter, or coupons change
  useEffect(() => {
    let result = [...coupons]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter - 'active' field exists in CouponResponse
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      result = result.filter(coupon => 
        isActive ? coupon.active === 1 : coupon.active === 0
      )
    }
    
    setFilteredCoupons(result)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [searchQuery, statusFilter, coupons])
  
  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedCoupons(filteredCoupons.slice(startIndex, endIndex))
  }, [filteredCoupons, currentPage])

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // This is the handler that will match the expected type for both create and update scenarios
  const handleFormSubmit = async (data: CouponCreate | CouponUpdate) => {
    if ('id' in data) {
      // If data has an ID, it's an update operation (although you don't seem to use this path)
      console.log("Creating coupon with data:", data)
      await handleUpdateCoupon(data as CouponUpdate)
    } else {
      // Otherwise it's a create operation
      console.log("Creating coupon with data:", data)
      await handleCreateCoupon(data as CouponCreate)
    }
  }

  const handleCreateCoupon = async (couponData: CouponCreate) => {
    try {
      // Remove any properties not expected by the API for CouponCreate
      const createData: CouponCreate = {
        code: couponData.code,
        discount_percentage: couponData.discount_percentage,
        applicable_categories: couponData.applicable_categories,
        applicable_products: couponData.applicable_products,
        expires_at: couponData.expires_at,
      }
      
      const response = await couponsApi.createCoupon(createData)
      await fetchCoupons()
      setIsFormOpen(false)
      
      toast({
        title: "Coupon Created",
        description: `Coupon "${createData.code}" has been created successfully.`,
      })
      
      // Navigate to the new coupon's detail page
      router.push(`/admin/coupons/${response.id}`)
    } catch (err) {
      console.error("Failed to create coupon:", err)
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCoupon = async (couponData: CouponUpdate) => {
    // This is a placeholder for the update function
    // Since you're routing to another page for editing, you may not need this
    console.log("Update function would be called with:", couponData);
  }

  // This function is now just a navigation helper - routing to the edit page
  const handleEditCoupon = (coupon: CouponResponse) => {
    router.push(`/admin/coupons/${coupon.id}/edit`)
  }

  const confirmDeleteCoupon = (id: number) => {
    setDeletingCouponId(id)
    setIsConfirmDialogOpen(true)
  }

  const handleDeleteCoupon = async () => {
    if (!deletingCouponId) return
    
    try {
      await couponsApi.deleteCoupon(deletingCouponId)
      await fetchCoupons()
      
      toast({
        title: "Coupon Deleted",
        description: "The coupon has been deleted successfully.",
      })
    } catch (err) {
      console.error("Failed to delete coupon:", err)
      toast({
        title: "Error",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingCouponId(null)
      setIsConfirmDialogOpen(false)
    }
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white rounded-xl flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Coupon
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>
          {/* Use the new handleFormSubmit instead of handleCreateCoupon directly */}
          <CouponForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </div>
      )}

      {/* Search and filter bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select 
              value={statusFilter} 
              onValueChange={(value: string) => setStatusFilter(value as "all" | "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="shrink-0"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <div className="h-screen flex items-center justify-center">
              <Loader/>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {coupons.length === 0 
              ? "No coupons found." 
              : "No coupons match your search criteria."}
          </div>
        ) : (
          <>
            <CouponTable 
              coupons={paginatedCoupons} 
              onEdit={handleEditCoupon}
              onDelete={confirmDeleteCoupon}
            />
            <div className="p-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCoupons.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredCoupons.length)} of {filteredCoupons.length} coupons
              </div>
              
              {/* Add pagination control */}
              {filteredCoupons.length > itemsPerPage && (
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredCoupons.length / itemsPerPage)}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon. This action cannot be undone.
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
              onClick={handleDeleteCoupon}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}