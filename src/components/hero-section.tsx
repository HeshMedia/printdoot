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
    <div className="flex items-center justify-center mt-5">
    <section className="w-[90%] bg-primary py-12 md:py-16 lg:py-20 overflow-hidden pl-10 rounded-3xl">
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

          {/* right side */}
          <div className="relative h-[300px] md:h-[400px]">
            <Image
              src="/printdoot-hero.png"
              alt="Description of the image"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}
