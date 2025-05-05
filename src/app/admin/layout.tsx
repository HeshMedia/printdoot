import type { ReactNode } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  LogOut,
  Star,
  Zap,
  TrendingUp,
  ShoppingCart,
  Heart,
  Ticket,
} from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Package className="w-5 h-5 mr-3" />
            Products
          </Link>
          <Link href="/admin/categories" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Tag className="w-5 h-5 mr-3" />
            Categories
          </Link>
          <Link href="/admin/orders" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <ShoppingBag className="w-5 h-5 mr-3" />
            Orders
          </Link>
          <Link href="/admin/coupons" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Ticket className="w-5 h-5 mr-3" />
            Coupons
          </Link>

          {/* Featured Sections */}
          <div className="border-t border-gray-200 my-4"></div>
          <div className="px-6 py-2 text-sm font-medium text-gray-500">FEATURED SECTIONS</div>

          <Link
            href="/admin/featured/bestselling"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <Star className="w-5 h-5 mr-3" />
            Bestselling
          </Link>
          <Link href="/admin/featured/onsale" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Zap className="w-5 h-5 mr-3" />
            On Sale
          </Link>
          <Link href="/admin/featured/trending" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <TrendingUp className="w-5 h-5 mr-3" />
            Trending
          </Link>
          <Link
            href="/admin/featured/newarrivals"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            New Arrivals
          </Link>
          <Link
            href="/admin/featured/shopbyneed"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <Heart className="w-5 h-5 mr-3" />
            Shop By Need
          </Link>

          <div className="border-t border-gray-200 my-4"></div>

          <Link href="/logout" className="flex items-center px-6 py-3 text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  )
}

