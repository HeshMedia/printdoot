// components/HeroSection.tsx
"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import Image from "next/image";
import BestSellers from "./best-sellers";
import { Banner, bannerApi } from "@/lib/api/banners";

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
                    src={displayImages[currentSlide]}
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
          
          {/* Right side - Bestselling Items */}
          <div className="lg:w-2/5 mt-4 lg:mt-0">
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
const HeroSideBestsellers = () => {
  return (
    <div className="bg-white h-full rounded-2xl shadow-lg p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Bestsellers</h2>
        <div className="flex items-center">
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
          <div className="h-1 w-20 bg-blue-400 opacity-50 rounded-full ml-1"></div>
        </div>
      </div>
      
      {/* We'll use a minimal version of the BestSellers component */}
      <div className="h-[300px] sm:h-[350px] md:h-[385px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
        <BestSellers />
      </div>
    </div>
  );
};

export default HeroSection;
