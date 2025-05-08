"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { categoriesApi } from "@/lib/api/categories"
import { Category } from "@/lib/api/admin/categories"

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        
        // Extract categories array from the response
        setCategories(response.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="sticky top-0 z-50 bg-white shadow-sm py-3 border-b">
      <div className="container mx-auto px-4">
       
        {/* Mobile Menu - Now horizontal scrollable instead of sidebar */}
        <div className="md:hidden">
          <h2 className="font-semibold mb-3">Categories</h2>
          <div className="flex overflow-x-auto hide-scrollbar pb-2 space-x-2">
            {isLoading ? (
              // Loading skeleton for mobile view
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse">
                  <div className="flex flex-col items-center px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="h-2.5 w-14 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
              ))
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex-shrink-0">
                  <Link 
                    href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group"
                  >
                    <div className="flex flex-col items-center px-3 py-2">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#60B5FF]">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs mt-1 font-medium text-center whitespace-nowrap">{category.name}</span>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop Horizontal Categories */}
        <div className="hidden md:block">
          <motion.div 
            className="flex flex-wrap overflow-x-auto hide-scrollbar pb-2 space-x-2 justify-center gap-y-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              // Loading skeleton for desktop
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse">
                  <div className="flex flex-col items-center px-5 py-2">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
              ))
            ) : (
              categories.map((category) => (
                <motion.div
                  key={category.id}
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href={`/products?category=${category.id}`}
                    className="group"
                    onMouseEnter={() => setActiveCategory(category.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div className={`flex flex-col items-center px-5 py-2 rounded-lg transition-colors ${activeCategory === category.name ? 'bg-[#60B5FF]/15' : 'hover:bg-gray-100'}`}>
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#60B5FF] transition-all">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <span className="text-xs mt-1 font-medium text-center whitespace-nowrap">{category.name}</span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

