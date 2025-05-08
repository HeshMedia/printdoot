"use client"

import { Filter, MinusCircle, Search } from "lucide-react"
import { useState } from "react"

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
  minRating, setMinRating, clearFilters, handleFilter
}: ProductFiltersProps) {
  return (
    <div className="p-4 border rounded-t-xl shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); }} className="relative w-full md:w-64 lg:w-auto lg:flex-grow">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters section with transition */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out 
          ${showFilters ? "max-h-20 opacity-100 mt-4" : "max-h-0 opacity-0"}
        `}
      >
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none w-[140px]"
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            aria-label="Category"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price"
            className="w-[120px] border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
            value={minPrice || ""}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
            min="0"
            step="0.01"
            aria-label="Minimum Price"
          />

          <input
            type="number"
            placeholder="Max Price"
            className="w-[120px] border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
            value={maxPrice || ""}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
            min="0"
            step="0.01"
            aria-label="Maximum Price"
          />

          <input
            type="number"
            placeholder="Min Rating"
            className="w-[120px] border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none"
            value={minRating || ""}
            onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
            min="0"
            max="5"
            step="0.1"
            aria-label="Minimum Rating"
          />

          <button 
            onClick={clearFilters} 
            className="px-3 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-sm"
          >
            <MinusCircle size={14} className="text-gray-500" />
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}