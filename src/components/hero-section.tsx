// components/HeroSection.tsx
"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  "/print-d.webp",
  "/printdoot1.webp",
];

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 5000); // Change every 5 seconds for a more relaxed pace
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-8 mb-8">
      <section className="relative w-[90vw] sm:w-[90vw] rounded-3xl h-[400px] sm:h-[600px] overflow-hidden shadow-lg">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                opacity: { duration: 1.2, ease: "easeOut" },
                scale: { duration: 1.5, ease: "easeOut" }
              }
            }}
            exit={{ 
              opacity: 0,
              transition: { duration: 2, ease: "easeIn" }
            }}
          >
            <img
              src={images[currentImage]}
              alt="Hero Image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default HeroSection;
