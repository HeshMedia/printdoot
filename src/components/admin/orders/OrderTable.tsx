// Order table
"use client"

import { formatDate } from "@/lib/utils/formDate"
import { getStatusColor } from "@/lib/utils/getStatusColor"
import type { Order } from "@/lib/api/admin/orders"
import Link from "next/link"

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
            {["Order ID", "Customer", "Date", "Total", "Status", "Items"].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.order_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                <Link href={`/admin/orders/${order.order_id}`} className="hover:underline">
                  #{order.order_id}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.clerkId}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${order.total_price.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.items.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
