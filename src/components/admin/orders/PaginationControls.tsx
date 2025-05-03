"use client"

// Importing icons from the lucide-react library
import { ChevronLeft, ChevronRight } from "lucide-react"

// Defining the interface for the component's props
interface PaginationControlsProps {
    currentPage: number // The current active page
    totalPages: number // Total number of pages
    setCurrentPage: (page: number) => void // Function to update the current page
    resultsCount: number // Total number of results
    itemsPerPage: number // Number of items displayed per page
}

// PaginationControls component definition
export default function PaginationControls({
    currentPage,
    totalPages,
    setCurrentPage,
    resultsCount,
    itemsPerPage,
}: PaginationControlsProps) {
    return (
        <div className="px-4 py-3 flex items-center justify-between border-t">
            {/* Container for pagination details and controls */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                {/* Displaying the range of results currently being shown */}
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, resultsCount)}</span> of{" "}
                    <span className="font-medium">{resultsCount}</span> results
                </p>
                {/* Navigation controls for pagination */}
                <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Button to navigate to the previous page */}
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1} // Disable if on the first page
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-5 w-5" /> {/* Left arrow icon */}
                    </button>
                    {/* Generating page number buttons dynamically */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page} // Unique key for each page button
                            onClick={() => setCurrentPage(page)} // Set the current page on click
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600" // Active page styling
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" // Inactive page styling
                            }`}
                        >
                            {page} {/* Display the page number */}
                        </button>
                    ))}
                    {/* Button to navigate to the next page */}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages} // Disable if on the last page
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronRight className="h-5 w-5" /> {/* Right arrow icon */}
                    </button>
                </nav>
            </div>
        </div>
    )
}
