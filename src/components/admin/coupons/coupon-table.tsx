"use client"

import { Edit, Trash2, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils/formDate"
import type { CouponResponse } from "@/lib/api/admin/coupons"
import Link from "next/link"

interface CouponTableProps {
  coupons: CouponResponse[]
  onEdit: (coupon: CouponResponse) => void
  onDelete: (id: number) => void
}

export default function CouponTable({ coupons, onEdit, onDelete }: CouponTableProps) {
  // Safe date formatting function that handles invalid dates
  const formatDateSafe = (dateString?: string): string => {
    if (!dateString) return "Never";
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Code", "Discount %", "Status", "Created", "Expires", "Categories", "Products", "Actions"].map((heading) => (
              <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                <Link href={`/admin/coupons/${coupon.id}`} className="hover:text-blue-600 hover:underline">
                  {coupon.code}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {coupon.discount_percentage}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  coupon.active === 1 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {coupon.active === 1 ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDateSafe(coupon.created_at)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDateSafe(coupon.expires_at)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {coupon.applicable_categories?.length 
                  ? `${coupon.applicable_categories.length} categories` 
                  : "All categories"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {coupon.applicable_products?.length 
                  ? `${coupon.applicable_products.length} products` 
                  : "All products"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2">
                  <Link 
                    href={`/admin/coupons/${coupon.id}`}
                    className="text-gray-600 hover:text-blue-900"
                    aria-label={`View coupon ${coupon.code}`}
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link 
                    href={`/admin/coupons/${coupon.id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                    aria-label={`Edit coupon ${coupon.code}`}
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => onDelete(coupon.id)} 
                    className="text-red-600 hover:text-red-900"
                    aria-label={`Delete coupon ${coupon.code}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}