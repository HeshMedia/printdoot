"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTopbarData } from "@/lib/hooks/useTopbarData";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MAX_PRODUCTS_PER_GROUP = 10;

export default function Topbar() {
  const { topbarData, isLoading, error } = useTopbarData();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuOpen = (id: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenDropdown(id);
  };

  const handleMenuClose = (id: number) => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown((prev) => (prev === id ? null : prev));
    }, 200);
  };

  const cancelMenuClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  // Using Tailwind classes for text wrapping instead of custom formatting

  if (isLoading) {
    return (
      <div className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-6 h-12">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-20 rounded-md my-auto" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 py-2 px-4 text-center text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 hidden md:block">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            {topbarData.map(
              (titleItem) =>
                titleItem.active === 1 && (
                  <div
                    key={titleItem.id}
                    className="relative group"
                    onMouseEnter={() => handleMenuOpen(titleItem.id)}
                    onMouseLeave={() => handleMenuClose(titleItem.id)}
                  >
                    <button
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 relative"
                      onClick={(e) => e.preventDefault()}
                    >                      <span className="inline-block max-w-[160px] whitespace-normal text-center leading-tight">
                        {titleItem.title.toUpperCase()}
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                    </button>

                    {openDropdown === titleItem.id && (
                      <div className="fixed left-0 right-0 top-[120px] w-screen bg-white shadow-lg border-t border-gray-200 z-50 animate-fadeIn">
                        <div className="max-w-7xl mx-auto px-8 py-8">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                            {titleItem.categories.map((category) => (
                              <div key={category.id} className="space-y-4">
                                <Link
                                  href={`/products?category=${encodeURIComponent(category.id)}`}
                                >
                                  <h3 className="font-semibold text-gray-900 text-sm  pb-2 whitespace-normal break-words">
                                    {category.name}
                                  </h3>
                                </Link>
                                <div className="space-y-2">
                                  {category.products
                                    .slice(0, MAX_PRODUCTS_PER_GROUP)
                                    .map((product) => (
                                      <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="block text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors duration-150"
                                      >
                                        {product.name}
                                      </Link>
                                    ))}
                                  {category.products.length > MAX_PRODUCTS_PER_GROUP && (
                                    <Link
                                      href={`/products?category=${encodeURIComponent(category.id)}`}
                                      className="block text-sm font-medium text-blue-600 hover:underline transition-colors duration-150 mt-1"
                                    >
                                      Shop all {category.name}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      </nav>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
