"use client"

import type { Order } from "@/lib/api/admin/orders"
import { formatDate } from "@/lib/utils/formDate"

interface OrderDetailsProps {
  orders: Order[]
  expandedOrders: Record<string, boolean>
}

export default function OrderDetails({ orders, expandedOrders }: OrderDetailsProps) {
  return (
    <>
      {orders.map(
        (order) =>
          expandedOrders[order.order_id] && (
            <div key={`details-${order.order_id}`} className="p-4 bg-gray-50 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Order Information</h4>
                  <p className="text-sm text-gray-600">Order ID: #{order.order_id}</p>
                  <p className="text-sm text-gray-600">Date: {formatDate(order.created_at)}</p>
                  <p className="text-sm text-gray-600">Status: {order.status}</p>
                  <p className="text-sm text-gray-600">Receipt ID: {order.receipt_id}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Customer Information</h4>
                  <p className="text-sm text-gray-600">Customer ID: {order.clerkId}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Payment Information</h4>
                  <p className="text-sm text-gray-600">Total: ${order.total_price.toFixed(2)}</p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {["Product ID", "Quantity", "Price", "Customizations"].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={`${order.order_id}-item-${index}`}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.product_id}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ${item.individual_price.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          <div>
                            <p className="text-xs font-medium text-gray-700">
                              {item.user_customization_type}: {item.user_customization_value}
                            </p>
                            {Object.entries(item.selected_customizations).map(([key, value]) => (
                              <p key={key} className="text-xs text-gray-600">
                                {key}: {value}
                              </p>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
      )}
    </>
  )
}
