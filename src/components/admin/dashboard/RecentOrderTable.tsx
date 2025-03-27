"use client"
import { useEffect, useState } from "react";
import { ordersApi, Order } from "@/lib/api/admin/orders"; // Import the API and the Order interface
import Link from "next/link";

// Component to display a table of recent orders
export default function RecentOrdersTable() {
  // State to store the list of orders fetched from the API
  const [orders, setOrders] = useState<Order[]>([]); 
  // State to track if data is still being loaded
  const [loading, setLoading] = useState<boolean>(true); 
  // State to store any error messages that occur during the fetch
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    // Function to fetch orders from the API when the component mounts
    const fetchOrders = async () => {
      try {
        // Fetching a limited number of orders (3 in this case)
        const fetchedOrders = await ordersApi.getOrders({ limit: 10 });
        // Storing the fetched orders in the state
        setOrders(fetchedOrders); 
      } catch (err) {
        // If an error occurs, set the error state with a message
        setError("Failed to fetch orders");
      } finally {
        // Stop loading state once the fetching process is complete
        setLoading(false); 
      }
    };

    // Call the function to fetch orders
    fetchOrders();
  }, []); // Empty dependency array ensures this runs only once after the component mounts

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header section with title and link to view all orders */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <Link href="/admin/orders" className="text-blue-600 hover:underline text-sm">
          View All
        </Link>
      </div>

      {/* Conditional rendering based on loading, error, or no orders */}
      {loading ? (
        // If loading is true, display a spinner and loading message
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      ) : error ? (
        // If there's an error, display the error message in red
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        // If there are no orders, display a message saying no orders were found
        <div className="p-8 text-center text-gray-600">No orders found.</div>
      ) : (
        // If data is successfully fetched and there are orders, display them in a table
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table header with column names */}
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

            {/* Table body with rows of order data */}
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id}>
                  {/* Display the Order ID */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.order_id}</td>
                  {/* Display the Customer ID (using clerkId here as placeholder for customer) */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.clerkId}</td>
                  {/* Display the total amount of the order */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${order.total_price}</td>
                  {/* Display the order status with dynamic styling based on status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full bg-${order.status.toLowerCase()}-100 text-${order.status.toLowerCase()}-800`}
                    >
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
