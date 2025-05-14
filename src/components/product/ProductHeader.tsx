import React from 'react'
import Link from 'next/link'
import { ChevronRight, Star } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import type { Product } from '@/lib/api/products'
import type { Category } from '@/lib/api/categories'

interface ProductHeaderProps {
  product: Product | null
  category: Category | null
  reviewCount: number
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  product, 
  category, 
  reviewCount 
}) => {
  // Handle missing product data gracefully
  if (!product) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded-md w-3/4"></div>
        <div className="h-4 bg-muted rounded-md w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center text-sm">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
          <li>
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Products
            </Link>
          </li>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
              <li>
                <Link 
                  href={`/categories?category=${category.id}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
          <li className="font-medium text-foreground" aria-current="page">
            {product.name || "Product Details"}
          </li>
        </ol>
      </nav>

      {/* Title & Price Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name || "Product Details"}</h1>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.average_rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < (product.average_rating || 0)
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
            
            <span className="text-muted-foreground">•</span>
            
            <Badge 
              className={product.status === "in_stock" ? "bg-green-500 hover:bg-green-600" : ""}
              variant={
                product.status === "in_stock" 
                  ? "default" 
                  : product.status === "out_of_stock" 
                  ? "destructive" 
                  : "outline"
              }
            >
              {product.status === "in_stock" 
                ? "In Stock" 
                : product.status === "out_of_stock" 
                ? "Out of Stock" 
                : "Discontinued"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductHeader