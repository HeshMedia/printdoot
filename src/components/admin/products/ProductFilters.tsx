"use client"

import { Filter, Search } from "lucide-react"

interface ProductFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  categories: { id: number; name: string }[]
  selectedCategory: number | null
  setSelectedCategory: (categoryId: number | null) => void
  minPrice: number | null
  setMinPrice: (price: number | null) => void
  maxPrice: number | null
  setMaxPrice: (price: number | null) => void
  minRating: number | null
  setMinRating: (rating: number | null) => void
  handleFilter: () => void
  clearFilters: () => void
}

export default function ProductFilters({
  searchTerm, setSearchTerm, showFilters, setShowFilters,
  categories, selectedCategory, setSelectedCategory, 
  minPrice, setMinPrice, maxPrice, setMaxPrice, 
  minRating, setMinRating, handleFilter, clearFilters
}: ProductFiltersProps) {
  return (
    <div className="p-4 border-b rounded-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); }} className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              className="w-full border rounded-xl px-3 py-2"
              value={minPrice || ""}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-1">Max Price</label>
            <input
              type="number"
              className="w-full border rounded-xl px-3 py-2"
              value={maxPrice || ""}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <input
              type="number"
              className="w-full border rounded-xl px-3 py-2"
              value={minRating || ""}
              onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
              min="0"
              max="5"
              step="0.1"
            />
          </div>

          <div className="md:col-span-4 flex justify-end gap-2">
            <button onClick={clearFilters} className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50">
              Clear
            </button>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
