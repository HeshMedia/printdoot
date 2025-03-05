"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const categories = [
  { 
    name: "Pens", 
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&h=500&fit=crop" 
  },
  { 
    name: "Pencils", 
    image: "https://images.unsplash.com/photo-1518826778770-a729fb53327c?w=500&h=500&fit=crop" 
  },
  { 
    name: "Notebooks", 
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&h=500&fit=crop" 
  },
  { 
    name: "Notepads", 
    image: "https://images.unsplash.com/photo-1606791422814-b32c705e3e2f?w=500&h=500&fit=crop" 
  },
  { 
    name: "Planners", 
    image: "https://images.unsplash.com/photo-1506784926709-22f1ec395907?w=500&h=500&fit=crop" 
  },
  { 
    name: "Highlighters", 
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&h=500&fit=crop" 
  },
  { 
    name: "Journals", 
    image: "https://images.unsplash.com/photo-1577375729152-4c8b5fcda381?w=500&h=500&fit=crop" 
  },
  { 
    name: "To-do Lists", 
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=500&fit=crop" 
  },
  { 
    name: "Sticky Notes", 
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&h=500&fit=crop" 
  },
]

export default function Categories() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Browse All Categories
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              className="category-card flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <Link href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}`} className="w-full">
                <div className="aspect-square relative mb-3 overflow-hidden rounded-lg border">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="text-center font-medium text-sm sm:text-base">{category.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

