"use client"
import { ChevronLeft, ChevronRightIcon } from 'lucide-react';
import React from 'react';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const PaginationControl: React.FC<PaginationControlProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false 
}) => {
  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 border rounded-xl hover:bg-primary text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft/>
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={loading}
              className={`px-4 py-2 rounded-xl ${
                currentPage === page 
                ? "bg-primary text-white" 
                : "border text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || loading}
          className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-primary hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRightIcon/>
        </button>
      </nav>
    </div>
  );
};

export default PaginationControl;