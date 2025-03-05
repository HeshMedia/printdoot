"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const needsCategories = [
  {
    id: 1,
    name: "For Startups",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=600&fit=crop",
  },
  {
    id: 2,
    name: "Events and Promotions",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=600&fit=crop",
  },
  {
    id: 3,
    name: "Cafe & Restaurant Essentials",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=600&fit=crop",
  },
]

export default function ShopByNeeds() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop By Needs</h2>
          <p className="text-muted-foreground">Find what you are looking for</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          {needsCategories.map((category, index) => (
            <motion.div
              key={category.id}
              className="relative overflow-hidden rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="aspect-[3/4] relative">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <h3 className="text-lg font-medium bg-white/90 backdrop-blur-sm p-2 rounded-md">{category.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button className="group bg-white text-black">
            Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

