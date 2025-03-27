import DashboardCard from "@/components/admin/dashboard/DashboardCard";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrderTable";
import PopularProductsList from "@/components/admin/dashboard/PopularProductsList";
import { Package, ShoppingBag, Tag, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard icon={<Package className="w-6 h-6" />} title="Total Products" value={120} color="blue" />
        <DashboardCard icon={<ShoppingBag className="w-6 h-6" />} title="Total Orders" value={45} color="green" />
        <DashboardCard icon={<Tag className="w-6 h-6" />} title="Categories" value={12} color="purple" />
        <DashboardCard icon={<TrendingUp className="w-6 h-6" />} title="Revenue" value="$12,500" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable />
        <PopularProductsList />
      </div>
    </div>
  );
}
