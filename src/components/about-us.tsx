"use client"

import { Leaf, Package, Phone } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: <Leaf className="h-8 w-8" />,
    title: "Large Assortment",
    description: "We offer many different types of products with fewer variations in each category.",
  },
  {
    icon: <Package className="h-8 w-8" />,
    title: "Fast & Free Shipping",
    description: "4-day or less delivery time, free shipping and an expedited delivery option.",
  },
  {
    icon: <Phone className="h-8 w-8" />,
    title: "24/7 Support",
    description: "Answers to any business related inquiry 24/7 and in real-time.",
  },
]

export default function AboutUs() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Order now and appreciate the beauty of nature</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="about-icon bg-primary rounded-full p-6 mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

