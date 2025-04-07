"use client"

import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"
import { Product } from "@/lib/api/admin/products"

interface ProductTableProps {
  products: Product[]
  handleDelete: (productId: string) => void
}

export default function ProductTable({ products, handleDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Image", "Name", "Category", "Price", "Status", "Rating", "Actions"].map((heading) => (
              <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(products) && products.map((product) => (
            <tr key={product.product_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <img src={product.main_image_url} alt={product.name} className="w-12 h-12 object-cover" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{product.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{product.category_name}</td>
              <td className="px-4 py-3 whitespace-nowrap">₹{product.price.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${product.status === "in_stock" ? "green" : "red"}-100 text-${product.status === "in_stock" ? "green" : "red"}-800`}>
                  {product.status === "in_stock" ? "In Stock" : "Out of Stock"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{product.average_rating.toFixed(1)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/products/${product.product_id}/edit`} className="text-blue-600 hover:text-blue-900">
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(product.product_id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
