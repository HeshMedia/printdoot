"use client"

import { useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <section className="w-full bg-primary py-12 md:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              One Stop
              <br />
              Printing
            </motion.h1>
            <motion.div
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-lg md:text-xl font-medium">
                <span className="block">50+</span>
                <span className="text-sm text-muted-foreground">Products</span>
              </div>
              <div className="w-px bg-border"></div>
              <div className="text-lg md:text-xl font-medium">
                <span className="block">100+</span>
                <span className="text-sm text-muted-foreground">Customers</span>
              </div>
            </motion.div>
            <motion.div
              className="relative max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Input
                type="text"
                placeholder="What are you looking for?"
                className="pr-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="icon" className="absolute right-0 top-0 rounded-l-none" variant="ghost">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </motion.div>
          </div>
          <div className="relative h-[300px] md:h-[400px]">
            <motion.div
              className="absolute top-10 right-10 hero-animation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=150&h=150&fit=crop"
                alt="Laptop"
                width={150}
                height={150}
                className="object-contain rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div
              className="absolute bottom-10 left-10 hero-animation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100&h=100&fit=crop"
                alt="Mug"
                width={100}
                height={100}
                className="object-contain rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hero-animation"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=120&h=120&fit=crop"
                alt="Cap"
                width={120}
                height={120}
                className="object-contain rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div
              className="absolute bottom-20 right-20 hero-animation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80&h=80&fit=crop"
                alt="Jacket"
                width={80}
                height={80}
                className="object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

