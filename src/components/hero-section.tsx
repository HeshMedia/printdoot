// components/HeroSection.tsx
"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/print-d.webp",
  "/printdoot1.webp",
  "/printdoot-hero.png"
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay]);

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" 
             style={{ height: "280px" }}>
          
          {/* Carousel Controls */}
          <div className="absolute inset-0 z-10 flex items-center justify-between px-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
              onClick={() => {
                prevSlide();
                setAutoplay(false);
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
              onClick={() => {
                nextSlide();
                setAutoplay(false);
              }}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setAutoplay(false);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === index 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

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
              <img
                src={images[currentSlide]}
                alt={`Banner Slide ${currentSlide + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* No text overlay as per request */}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
