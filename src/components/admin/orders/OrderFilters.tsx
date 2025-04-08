//order filters 
"use client"

import { Calendar, Filter, Search } from "lucide-react"

interface OrderFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortOrder: "asc" | "desc"
  setSortOrder: (order: "asc" | "desc") => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  statusFilter: string | null
  setStatusFilter: (status: string | null) => void
  dateFilter: string | null
  setDateFilter: (date: string | null) => void
  clearFilters: () => void
  handleSearch: (e: React.FormEvent) => void
}

export default function OrderFilters({
  searchTerm, setSearchTerm, sortOrder, setSortOrder,
  showFilters, setShowFilters, statusFilter, setStatusFilter,
  dateFilter, setDateFilter, clearFilters, handleSearch
}: OrderFiltersProps) {
  return (
    <div className="p-4 border-b">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </form>

        <div className="flex items-center gap-4">
          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="flex items-center text-gray-600 hover:text-gray-900">
            <Calendar className="w-4 h-4 mr-2" />
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center text-gray-600 hover:text-gray-900">
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2"
              value={dateFilter || ""}
              onChange={(e) => setDateFilter(e.target.value || null)}
            />
          </div>

          <div className="flex items-end">
            <button onClick={clearFilters} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
