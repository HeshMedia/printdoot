import type { ReactNode } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-4 md:p-8 overflow-auto pt-16 lg:pt-8">

        {children}
      </div>
    </div>
  )
}