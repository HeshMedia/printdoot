"use client"

import { useEffect, useState } from "react"
import DashboardCard from "@/components/admin/dashboard/DashboardCard"
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrderTable"
import PopularProductsList from "@/components/admin/dashboard/PopularProductsList"
import { Package, ShoppingBag, Tag, TrendingUp, Star, Zap, Heart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BestsellingSection } from "@/components/features/home/bestselling-section"
import { OnsaleSection } from "@/components/features/home/onsale-section"
import { ShopByNeedSection } from "@/components/features/home/shop-by-need-section"

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [bestsellingCount, setBestsellingCount] = useState(12)
  const [onsaleCount, setOnsaleCount] = useState(8)
  const [trendingCount, setTrendingCount] = useState(6)
  const [needsCount, setNeedsCount] = useState(5)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products
        const productRes = await fetch("https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/products")
        const productData = await productRes.json()
        setProductCount(productData.total || 0)

        // Fetch orders
        const orderRes = await fetch("https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/admin/orders")
        const orderData = await orderRes.json()
        setOrderCount(orderData.total || 0)

        // Calculate revenue
        const totalRevenue = (orderData.orders || []).reduce(
          (sum: number, order: any) => sum + (order.total_price || 0),
          0,
        )
        setRevenue(totalRevenue)

        // Fetch categories
        const categoryRes = await fetch("https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/categories")
        const categoryData = await categoryRes.json()
        setCategoryCount(categoryData.total || 0)

        // Fetch featured section counts
        try {
          const bestsellingRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/bestselling`)
          const bestsellingData = await bestsellingRes.json()
          setBestsellingCount(bestsellingData.products?.length || 0)
        } catch (error) {
          console.error("Error fetching bestselling count:", error)
        }

        try {
          const onsaleRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/onsale`)
          const onsaleData = await onsaleRes.json()
          setOnsaleCount(onsaleData.products?.length || 0)
        } catch (error) {
          console.error("Error fetching onsale count:", error)
        }

        try {
          const shopByNeedRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/shopbyneed`)
          const shopByNeedData = await shopByNeedRes.json()
          setNeedsCount(shopByNeedData.needs?.length || 0)
        } catch (error) {
          console.error("Error fetching needs count:", error)
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="mb-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs defaultValue="store" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="store">Store Overview</TabsTrigger>
          <TabsTrigger value="featured">Featured Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              icon={<Package className="w-6 h-6" />}
              title="Total Products"
              value={productCount}
              color="blue"
            />
            <DashboardCard
              icon={<ShoppingBag className="w-6 h-6" />}
              title="Total Orders"
              value={orderCount}
              color="green"
            />
            <DashboardCard icon={<Tag className="w-6 h-6" />} title="Categories" value={categoryCount} color="purple" />
            <DashboardCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Revenue"
              value={`₹{revenue}`}
              color="yellow"
            />
          </div>
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bestselling Products</CardTitle>
                <Star className="h-4 w-4 text-[#60B5FF]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bestsellingCount}</div>
                <p className="text-xs text-muted-foreground">
                  <a href="/admin/featured/bestselling" className="text-[#60B5FF] hover:underline">
                    Manage
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Sale Products</CardTitle>
                <Zap className="h-4 w-4 text-[#60B5FF]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onsaleCount}</div>
                <p className="text-xs text-muted-foreground">
                  <a href="/admin/featured/onsale" className="text-[#60B5FF] hover:underline">
                    Manage
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trending Products</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#60B5FF]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  <a href="/admin/featured/trending" className="text-[#60B5FF] hover:underline">
                    Manage
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shop By Need Categories</CardTitle>
                <Heart className="h-4 w-4 text-[#60B5FF]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{needsCount}</div>
                <p className="text-xs text-muted-foreground">
                  <a href="/admin/featured/shopbyneed" className="text-[#60B5FF] hover:underline">
                    Manage
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentOrdersTable />
        <PopularProductsList />
      </div>

      <Tabs defaultValue="bestselling" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bestselling">Bestselling</TabsTrigger>
          <TabsTrigger value="onsale">On Sale</TabsTrigger>
          <TabsTrigger value="shopbyneed">Shop By Need</TabsTrigger>
        </TabsList>

        <TabsContent value="bestselling">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Bestselling Section Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <BestsellingSection />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onsale">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">On-Sale Section Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <OnsaleSection />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopbyneed">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Shop By Need Section Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <ShopByNeedSection />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
