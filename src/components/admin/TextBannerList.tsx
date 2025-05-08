"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { TextBannerResponse, updateTextBanner } from "@/lib/api/text-banners"
import { Edit, ArrowUpDown, Eye, EyeOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TextBannerListProps {
  banners: TextBannerResponse[]
  onRefresh: () => void
  isLoading?: boolean
}

export function TextBannerList({ banners, onRefresh, isLoading = false }: TextBannerListProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortedBanners, setSortedBanners] = useState<TextBannerResponse[]>([])
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  
  // Use effect to update sorted banners when props change
  useEffect(() => {
    if (!isLoading && banners.length > 0) {
      const sorted = [...banners].sort((a, b) => {
        const comparison = a.display_order - b.display_order
        return sortOrder === 'asc' ? comparison : -comparison
      })
      setSortedBanners(sorted)
    } else {
      setSortedBanners([])
    }
  }, [banners, sortOrder, isLoading])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return dateString
    }
  }
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')
  }
  
  // Handle toggle active status
  const handleToggleActive = async (id: number, currentStatus: number) => {
    try {
      setUpdatingId(id)
      const newStatus = currentStatus === 1 ? 0 : 1
      await updateTextBanner(id, { active: newStatus })
      onRefresh()
    } catch (error) {
      console.error("Failed to update banner status:", error)
      // Could add toast notification here
    } finally {
      setUpdatingId(null)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    )
  }
  
  if (sortedBanners.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-gray-500">No text banners found</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/featured/text-banner/new">Create your first banner</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="w-[100px] cursor-pointer" 
              onClick={toggleSortOrder}
            >
              <div className="flex items-center">
                Order
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Text Content</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[150px]">Created</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBanners.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell className="font-medium">{banner.display_order}</TableCell>
              <TableCell>
                <div className="max-w-md truncate">{banner.text}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={banner.active === 1}
                    disabled={updatingId === banner.id}
                    onCheckedChange={() => handleToggleActive(banner.id, banner.active)}
                  />
                  {banner.active === 1 ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{formatDate(banner.created_at)}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/featured/text-banner/${banner.id}`}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}