import type { ReactNode } from "react"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut } from "lucide-react"

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
          <div className="border-t border-gray-200 my-4"></div>
          <Link href="/logout" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden p-6">
        {children}
      </main>
    </div>
  )
}


