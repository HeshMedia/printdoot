"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { topbarApi } from "@/lib/api/topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransformedProduct {
  id: string;
  name: string;
}

interface TransformedCategory {
  id: number;
  name: string;
  products: TransformedProduct[];
}

interface TransformedTopbarTitle {
  id: number;
  title: string;
  display_order: number;
  active: number;
  categories: TransformedCategory[];
}

const MAX_CATEGORIES_PER_TITLE = 6;
const MAX_PRODUCTS_PER_GROUP = 10;

export default function Topbar() {
  const [topbarData, setTopbarData] = useState<TransformedTopbarTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
  
  // Track dropdown open/close timers to prevent flicker
  const dropdownTimers: Record<number, NodeJS.Timeout> = {};
  
  const handleMouseEnter = (id: number) => {
    // Clear any existing close timer for this dropdown
    if (dropdownTimers[id]) {
      clearTimeout(dropdownTimers[id]);
      delete dropdownTimers[id];
    }
    
    // Open the dropdown immediately
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: true
    }));
  };
  
  const handleMouseLeave = (id: number) => {
    // Set a timer to close the dropdown after a delay
    dropdownTimers[id] = setTimeout(() => {
      setOpenDropdowns(prev => ({
        ...prev,
        [id]: false
      }));
    }, 300);
  };

  useEffect(() => {
    const fetchTopbarData = async () => {
      setIsLoading(true);
      try {
        const response = await topbarApi.getTopbars();
        
        const transformedData = response.titles.map((apiTitle: any) => ({
          id: apiTitle.id,
          title: apiTitle.title,
          display_order: apiTitle.display_order,
          active: apiTitle.active,
          categories: (apiTitle.categories || []).slice(0, MAX_CATEGORIES_PER_TITLE).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            products: (cat.products || []).map((prod: any) => ({
              id: prod.id,
              name: prod.name,
            }))
          }))
        }));
        
        setTopbarData(transformedData);
      } catch (err) {
        console.error("Error fetching topbar data:", err);
        setError("Failed to load navigation data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopbarData();
    
    // Clean up any lingering timers when component unmounts
    return () => {
      Object.values(dropdownTimers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Cleanup function to remove timers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(dropdownTimers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 py-2 shadow-sm">
        <div className="container mx-auto px-4 flex justify-center space-x-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-20 rounded-md" />
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
    <nav className="bg-gray-100 dark:bg-gray-800 py-2 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-center items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {topbarData.map((titleItem) => (
          titleItem.active === 1 && (
            <div key={titleItem.id} className="relative">
              <DropdownMenu 
                open={openDropdowns[titleItem.id] || false}
                onOpenChange={(open) => {
                  setOpenDropdowns(prev => ({
                    ...prev,
                    [titleItem.id]: open
                  }));
                }}
              >
                <DropdownMenuTrigger 
                  className="px-3 py-1 focus:outline-none"
                  onMouseEnter={() => handleMouseEnter(titleItem.id)}
                  onMouseLeave={() => handleMouseLeave(titleItem.id)}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
                      {titleItem.title.toUpperCase()}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  </div>
                </DropdownMenuTrigger>                  <DropdownMenuContent 
                  className="p-0 border-none shadow-lg rounded-none animate-none"
                  style={{ 
                    width: '100vw',
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    top: '42px', /* Adjust based on your topbar height */
                    maxHeight: '80vh'
                  }}
                  onMouseEnter={() => handleMouseEnter(titleItem.id)}
                  onMouseLeave={() => handleMouseLeave(titleItem.id)}
                  sideOffset={0}
                  forceMount
                >                  <div className="bg-white dark:bg-gray-800 w-full">
                    <div className="container mx-auto p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {titleItem.categories.map((category) => (
                          <div key={category.id} className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2 mb-2">
                              {category.name}
                            </h3>
                            <ul className="space-y-1.5">
                              {category.products.slice(0, MAX_PRODUCTS_PER_GROUP).map((product) => (
                                <li key={product.id}>
                                  <Link
                                    href={`/products/${product.id}`}
                                    className="block text-xs text-gray-600 dark:text-gray-300 hover:text-primary hover:underline"
                                  >
                                    {product.name}
                                  </Link>
                                </li>
                              ))}
                              {category.products.length > MAX_PRODUCTS_PER_GROUP && (
                                <li>
                                  <Link
                                    href={`/products?category=${encodeURIComponent(category.id)}`}
                                    className="block text-xs font-medium text-primary hover:underline mt-1"
                                  >
                                    Shop all {category.name}
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-3 border-t border-gray-200 dark:border-gray-600 text-center">
                        <Link
                          href={`/products?title=${encodeURIComponent(titleItem.title)}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          See all {titleItem.title.toLowerCase()}
                        </Link>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        ))}
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </nav>
  );
}