"use client"

import { useState, useEffect } from "react"
import { ordersApi, type Order } from "@/lib/api/admin/orders"
import OrderFilters from "@/components/admin/orders/OrderFilters"
import OrderTable from "@/components/admin/orders/OrderTable"
import OrderDetails from "@/components/admin/orders/OrderDetails"
import PaginationControls from "@/components/admin/orders/PaginationControls"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
    
        const { orders, total } = await ordersApi.getOrders({
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
          sort: sortOrder,
        });
    
        let filteredOrders = orders;
    
        if (searchTerm) {
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.clerkId.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
    
        if (statusFilter) {
          filteredOrders = filteredOrders.filter(
            (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }
    
        if (dateFilter) {
          const filterDate = new Date(dateFilter);
          filteredOrders = filteredOrders.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === filterDate.toDateString();
          });
        }
    
        setOrders(filteredOrders);
        setTotalPages(Math.ceil(total / itemsPerPage)); // use total from API
    
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };    

    fetchOrders()
  }, [currentPage, searchTerm, sortOrder, statusFilter, dateFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const clearFilters = () => {
    setStatusFilter(null)
    setDateFilter(null)
    setCurrentPage(1)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <OrderFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          clearFilters={clearFilters}
          handleSearch={handleSearch}
        />

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
          <>
            <OrderTable
              orders={orders}
              expandedOrders={expandedOrders}
              toggleOrderExpand={toggleOrderExpand}
            />
            <OrderDetails orders={orders} expandedOrders={expandedOrders} />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              resultsCount={orders.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
