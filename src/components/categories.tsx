"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { categoriesApi } from "@/lib/api/categories"
import { Category } from "@/lib/api/admin/categories"

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        
        // Extract categories array from the response
        setCategories(response.categories);
        
        // Filter out categories without valid image_url
        const filtered = response.categories.filter(
          category => category.image_url && category.image_url !== "/placeholder-product.png"
        );
        setFilteredCategories(filtered);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
        setFilteredCategories([]);
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
     <section className="top-0 z-50 bg-white shadow-sm py-8 border-b">      
     <div className="container mx-auto px-4 overflow-hidden">
        {/* Section Title - Similar to other components */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            className="w-full max-w-xl text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >            
            <h2 className="text-4xl font-bold mb-4">Explore Categories</h2>
            <div className="w-full max-w-md mx-auto">
              <div className="h-2 bg-[#60B5FF] rounded-full w-full"></div>
            </div>
          </motion.div>
        </div>
       
        {/* Mobile Menu - Now horizontal scrollable instead of sidebar */}
        <div className="md:hidden">          
          <div className="flex overflow-x-auto hide-scrollbar pb-5 space-x-5 px-2 w-full">
            {isLoading ? (
              // Loading skeleton for mobile view
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse">                  
                <div className="flex flex-col items-center px-5 py-3">
                    <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                    <div className="h-4 w-28 bg-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              ))
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="flex-shrink-0">
                  <Link 
                    href={`/products?category=${category.id}`}
                    className="group"
                  >                    
                  <div className="flex flex-col items-center px-5 py-3">
                      <div className="w-24 h-24 relative rounded-full overflow-hidden border-3 border-transparent group-hover:border-[#60B5FF] shadow-lg">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-base mt-4 font-medium text-center whitespace-nowrap">{category.name}</span>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>        
        {/* Desktop Horizontal Categories */}      
          <div className="hidden md:block w-full">         
           <motion.div 
            className="flex overflow-x-auto hide-scrollbar pb-8 space-x-6 px-4 w-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              // Loading skeleton for desktop
              Array(8).fill(0).map((_, i) => (                <div key={i} className="flex-shrink-0 flex-none animate-pulse">                  <div className="flex flex-col items-center px-10 py-5">
                    <div className="w-28 h-28 rounded-full bg-gray-200"></div>
                    <div className="h-5 w-28 bg-gray-200 rounded mt-5"></div>
                  </div>
                </div>
              ))
            ) : (
              filteredCategories.map((category) => (<motion.div
                  key={category.id}
                  className="flex-shrink-0 flex-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href={`/products?category=${category.id}`}
                    className="group"
                    onMouseEnter={() => setActiveCategory(category.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >                    <div className={`flex flex-col items-center px-10 py-5 rounded-lg transition-colors ${activeCategory === category.name ? 'bg-[#60B5FF]/15' : 'hover:bg-gray-100'}`}>
                      <div className="w-28 h-28 relative rounded-full overflow-hidden border-4 border-transparent group-hover:border-[#60B5FF] transition-all shadow-xl">
                        <Image
                          src={category.image_url || "/placeholder-product.png"}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <span className="text-lg mt-5 font-medium text-center whitespace-nowrap">{category.name}</span>
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
