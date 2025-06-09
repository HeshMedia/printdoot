"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useClerk } from "@clerk/clerk-react"
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
  PanelBottomDashed,
  Image as ImageIcon,
  Menu,
  X,
  LayoutGrid
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

function NavLink({ href, icon, label, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
        isActive && "bg-blue-50 text-blue-700 font-medium border-r-4 border-blue-700"
      )}
      onClick={onClick}
    >
      <div className="w-5 h-5 mr-3">{icon}</div>
      {label}
    </Link>
  )
}

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { signOut } = useClerk()
  const router = useRouter()
  
  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)
  
  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Mobile toggle button */}
      <button 
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md lg:hidden" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-white shadow-md z-40 transition-transform duration-300 ease-in-out overflow-y-auto",
          "w-64 lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-6 pb-24">
          <NavLink href="/admin" icon={<LayoutDashboard />} label="Dashboard" onClick={closeSidebar} />
          <NavLink href="/admin/products" icon={<Package />} label="Products" onClick={closeSidebar} />
          <NavLink href="/admin/categories" icon={<Tag />} label="Categories" onClick={closeSidebar} />
          <NavLink href="/admin/orders" icon={<ShoppingBag />} label="Orders" onClick={closeSidebar} />
          <NavLink href="/admin/coupons" icon={<Ticket />} label="Coupons" onClick={closeSidebar} />

          {/* Featured Sections */}
          <div className="border-t border-gray-200 my-4"></div>
          <div className="px-6 py-2 text-sm font-medium text-gray-500">FEATURED SECTIONS</div>

          <NavLink href="/admin/featured/bestselling" icon={<Star />} label="Bestselling" onClick={closeSidebar} />
          <NavLink href="/admin/featured/text-banner" icon={<PanelBottomDashed />} label="Text Banner" onClick={closeSidebar} />
          <NavLink href="/admin/featured/image-banner" icon={<ImageIcon />} label="Image Banner" onClick={closeSidebar} />
          <NavLink href="/admin/featured/onsale" icon={<Zap />} label="On Sale" onClick={closeSidebar} />
          <NavLink href="/admin/featured/trending" icon={<TrendingUp />} label="Trending" onClick={closeSidebar} />
          <NavLink href="/admin/featured/newarrivals" icon={<ShoppingCart />} label="New Arrivals" onClick={closeSidebar} />
          <NavLink href="/admin/featured/shopbyneed" icon={<Heart />} label="Shop By Need" onClick={closeSidebar} />

          <div className="border-t border-gray-200 my-4"></div>          <NavLink href="/admin/topbar" icon={<LayoutGrid className="h-5 w-5" />} label="Topbar Management" onClick={closeSidebar} />

          <div className="border-t border-gray-200 my-4"></div>

          <button 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
            onClick={handleLogout}
          >
            <div className="w-5 h-5 mr-3"><LogOut className="text-red-600" /></div>
            Logout
          </button>
        </nav>
      </aside>
    </>
  )
}