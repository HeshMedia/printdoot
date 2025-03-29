"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Define your Order interface if not already imported
interface Order {
  order_id: string;
  clerkId: string;
  total_price: number;
  status: string;
}

// Fetch orders directly from your API
async function getOrders(limit = 10): Promise<Order[]> {
  const res = await fetch(
    `https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/admin/orders?limit=${limit}`
  );
  const data = await res.json();
  return data.orders || [];
}

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <Link href="/admin/orders" className="text-blue-600 hover:underline text-sm">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-gray-600">No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {["Order ID", "Customer", "Amount", "Status"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.order_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.clerkId}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{order.total_price}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
