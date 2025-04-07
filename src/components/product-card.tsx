import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/api/products"
import { Star } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.product_id}`}>
      <div className="product-card h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={product.main_image_url || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-medium text-lg">{product.name}</h3>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.average_rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < product.average_rating
                        ? "text-yellow-400 fill-yellow-400 opacity-50"
                        : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-1">({product.average_rating.toFixed(1)})</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{product.description}</p>
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="font-semibold">₹{product.price.toFixed(2)}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                product.status === "in_stock"
                  ? "bg-green-100 text-green-800"
                  : product.status === "out_of_stock"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {product.status === "in_stock"
                ? "In Stock"
                : product.status === "out_of_stock"
                  ? "Out of Stock"
                  : "Discontinued"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

