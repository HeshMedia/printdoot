"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    role: "Designation here",
    rating: 4.5,
    content:
      "User-friendly platform with great customer support. \n Printdoot made it incredibly easy to design and order custom items. Their design tools are intuitive, and when I had a question about image resolution, the support team responded quickly and helpfully. The final products looked exactly how I envisioned them!",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "James Thomson",
    role: "Designation here",
    rating: 5,
    content:
      "🌟 Amazing quality and seamless experience!\n I ordered a set of custom mugs and t-shirts from Printdoot, and I’m genuinely impressed with the print clarity and fabric quality. The customization process was super easy, and everything arrived right on time. Highly recommended for personal gifts or small business branding!",
    avatar: "/placeholder.svg?height=100&width=100",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          What customers say about
          <br />
          Printdoot?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card bg-primary rounded-xl p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <p className="mb-6 text-foreground/80">{testimonial.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
               
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-foreground text-foreground" />
                  <span className="ml-1 font-medium">{testimonial.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

