"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { formatDate } from "@/lib/utils/formDate"
import { getStatusColor } from "@/lib/utils/getStatusColor"
import type { Order } from "@/lib/api/admin/orders"

interface OrderTableProps {
  orders: Order[]
  expandedOrders: Record<string, boolean>
  toggleOrderExpand: (orderId: string) => void
}

export default function OrderTable({ orders, expandedOrders, toggleOrderExpand }: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Order ID", "Customer", "Date", "Total", "Status", "Items", "Actions"].map((heading) => (
              <th
                key={heading}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  heading === "Actions" ? "text-center" : ""
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.order_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{order.order_id}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.clerkId}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${order.total_price.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.items.length}</td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <button onClick={() => toggleOrderExpand(order.order_id)} className="text-gray-600 hover:text-gray-900">
                  {expandedOrders[order.order_id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
