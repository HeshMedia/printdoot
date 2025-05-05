"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  // Don't show pagination if there's only 1 page
  if (totalPages <= 1) return null;
  
  // Calculate the range of pages to display
  const maxDisplayedPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
  let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  
  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxDisplayedPages) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }

  return (
    <div className="flex justify-center mt-4">
      <nav className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-xl disabled:opacity-50 text-gray-600 hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
        </button>

        {/* First page */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-xl border ${
                currentPage === 1 ? "bg-blue-600 text-white" : "text-gray-700"
              }`}
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Page numbers */}
        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-xl ${
              currentPage === page
                ? "bg-primary text-white"
                : "border text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-1 text-gray-500">...</span>
            )}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-8 h-8 rounded-xl border ${
                currentPage === totalPages ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next button */}
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl disabled:opacity-50 text-gray-600 hover:bg-gray-100"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default PaginationControls;
