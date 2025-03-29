'use client';

import { useEffect, useState } from 'react';
import DashboardCard from "@/components/admin/dashboard/DashboardCard";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrderTable";
import PopularProductsList from "@/components/admin/dashboard/PopularProductsList";
import { Package, ShoppingBag, Tag, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products
        const productRes = await fetch('https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/products');
        const productData = await productRes.json();
        setProductCount(productData.total || 0);

        // Fetch orders
        const orderRes = await fetch('https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/admin/orders');
        const orderData = await orderRes.json();
        setOrderCount(orderData.total || 0);

        // Calculate revenue
        const totalRevenue = (orderData.orders || []).reduce(
          (sum: number, order: any) => sum + (order.total_price || 0),
          0
        );
        setRevenue(totalRevenue);

        // Fetch categories
        const categoryRes = await fetch('https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/categories');
        const categoryData = await categoryRes.json();
        setCategoryCount(categoryData.total || 0);

      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard icon={<Package className="w-6 h-6" />} title="Total Products" value={productCount} color="blue" />
        <DashboardCard icon={<ShoppingBag className="w-6 h-6" />} title="Total Orders" value={orderCount} color="green" />
        <DashboardCard icon={<Tag className="w-6 h-6" />} title="Categories" value={categoryCount} color="purple" />
        <DashboardCard icon={<TrendingUp className="w-6 h-6" />} title="Revenue" value={`₹${revenue}`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable />
        <PopularProductsList />
      </div>
    </div>
  );
}
