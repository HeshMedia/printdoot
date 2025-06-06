// components/HeroSection.tsx
"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BestSellers from "./best-sellers";
import { Banner, bannerApi } from "@/lib/api/banners";
import { bestsellingApi } from "@/lib/api/featured";

const HeroSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default images as fallback if the API fails or returns no banners
  const defaultImages = [
    "/print-d.webp",
    "/printdoot1.webp",
    "/printdoot-hero.png"
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const response = await bannerApi.getBanners(true); // Get only active banners
        if (response.banners.length > 0) {
          // Sort by display order
          const sortedBanners = [...response.banners].sort((a, b) => a.display_order - b.display_order);
          setBanners(sortedBanners);
        } else {
          // If no banners, set error to trigger fallback images
          setError("No banners available");
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setError("Failed to fetch banners");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const nextSlide = () => {
    const slides = banners.length > 0 ? banners.length : defaultImages.length;
    setCurrentSlide((prev) => (prev + 1) % slides);
  };

  const prevSlide = () => {
    const slides = banners.length > 0 ? banners.length : defaultImages.length;
    setCurrentSlide((prev) => (prev - 1 + slides) % slides);
  };

  // Always reset autoplay to true when banners change
  useEffect(() => {
    if (banners.length > 0) {
      setAutoplay(true);
    }
  }, [banners]);

  useEffect(() => {
    // Always autoplay regardless of user interaction
    const interval = setInterval(() => {
      const slides = banners.length > 0 ? banners.length : defaultImages.length;
      setCurrentSlide((prev) => (prev + 1) % slides);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [banners.length, defaultImages.length]); // Only depend on the length of slides, not autoplay state

  // Display images based on API banners or fall back to default images
  const displayImages = banners.length > 0 
    ? banners.map(banner => banner.image_url)
    : defaultImages;

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Create a flex layout to have hero on left and bestsellers on right */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left side - Hero Carousel with responsive height */}
          <div className="lg:w-3/5">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/9]">
              
              {/* Carousel Controls */}
              <div className="absolute inset-0 z-10 flex items-center justify-between px-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
                  onClick={() => {
                    prevSlide();
                  }}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
                  onClick={() => {
                    nextSlide();
                  }}
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              </div>
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-10 flex justify-center space-x-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                    }}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      currentSlide === index 
                        ? "bg-white w-4 sm:w-6" 
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="absolute inset-0 bg-blue-50/30 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              )}

              {/* Error state */}
              {error && displayImages.length === 0 && (
                <div className="absolute inset-0 bg-red-50/30 flex flex-col items-center justify-center text-red-600">
                  <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 mb-2" />
                  <p className="text-sm sm:text-base">Failed to load banners</p>
                </div>
              )}

              {/* Carousel Slides */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentSlide}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: {
                      opacity: { duration: 0.8, ease: "easeOut" },
                      scale: { duration: 1.2, ease: "easeOut" }
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    transition: { duration: 0.8, ease: "easeIn" }
                  }}
                >                  
                <Image
                    src={displayImages?.[currentSlide]}
                    alt={`Banner Slide ${currentSlide + 1}`}
                    className="object-cover object-center"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 60vw"                   
                    priority
                  
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Right side - Bestselling Items */}          <div className="lg:w-2/5 mt-4 lg:mt-0">
            <div className="h-full overflow-hidden rounded-2xl">
              <HeroSideBestsellers />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Compact version of bestsellers specifically for hero section
const HeroSideBestsellers = () => {  return (
    <motion.div 
      className="bg-white w-full rounded-2xl shadow-lg p-4 flex flex-col"
      style={{ height: "100%" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >      <div className="mb-2 flex flex-col items-start">
        <motion.h2 
          className="text-2xl font-bold mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          Bestsellers
        </motion.h2>
        <div className="flex  flex-col w-full justify-start">
          <motion.div 
            className="h-1 w-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>          <motion.p
            className="mt-1 text-gray-600 text-base font-medium"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            our most popular items just for you
          </motion.p>
        </div>
      </div>
        {/* We'll adapt the BestSellers component to fit without scrolling */}      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <BestSellersCompact />
      </motion.div>
    </motion.div>
  );
};

// Simpler version of BestSellers with fewer products and no scrollbar
const BestSellersCompact = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await bestsellingApi.get();
        // Take only 3 products for compact display
        setProducts(data.products.slice(0, 3));
      } catch (error) {
        console.error("Error fetching bestselling products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {isLoading
          ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-100 aspect-[3/4] w-full"></div>
            ))
          : products.map((product, index) => (              <motion.div
                key={product.product_id}
                className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 group relative flex flex-col h-full"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >                <Link href={`/products/${product.product_id}`} className="flex flex-col h-full">
                  {/* Product image */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden">                   
                   <Image src={product?.main_image_url || "/placeholder-product.png"}
                      alt={product?.name}
                      fill
                      sizes="(max-width: 768px) 90vw, 30vw"                      className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>                  
                  {/* Product info */}
                  <div className="p-3 pt-2">
                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-[#60B5FF] transition-colors">                      {product?.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-bold text-[#60B5FF] text-sm">
                        ₹{product?.price?.toFixed(2)}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400 mr-0.5" />
                        <span className="text-xs">{product.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>        <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >        <Button 
          className="rounded-full bg-[#60B5FF] hover:bg-[#4da8f7] text-white px-5 py-2 text-sm flex items-center group shadow-md w-full justify-center"
          asChild
        >
          <Link href="/featured/bestselling">
            View All Bestsellers
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default HeroSection;
