"use client"

import type React from "react"

import { useState } from "react"
import { Download, FileText, Calendar, Loader2 } from "lucide-react"
import { ordersApi } from "@/lib/api/admin/orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface DownloadOrdersPdfProps {
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

const DownloadOrdersPdf: React.FC<DownloadOrdersPdfProps> = ({ setError }) => {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("recent")

  const handleDownloadAllOrders = async () => {
    try {
      setLoading(true)
      const { pdf_data, filename } = await ordersApi.generateOrdersPdf()
      downloadPdf(pdf_data, filename || "all_orders.pdf")
    } catch (error) {
      setError("Failed to download all orders PDF.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadRecentOrders = async () => {
    try {
      setLoading(true)
      const { pdf_data, filename } = await ordersApi.generateRecentOrdersPdf(days)
      downloadPdf(pdf_data, filename || `recent_orders_${days}_days.pdf`)
    } catch (error) {
      setError("Failed to download recent orders PDF.")
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = (pdfData: string, filename: string) => {
    try {
      const byteCharacters = atob(pdfData)
      const byteArrays = []

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024)
        const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0))
        byteArrays.push(new Uint8Array(byteNumbers))
      }

      const blob = new Blob(byteArrays, { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error("Error during PDF download:", error)
      setError("Failed to download PDF.")
    }
  }

  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export Orders
        </CardTitle>
        <CardDescription>Download your orders data as PDF files</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="recent">Recent Orders</TabsTrigger>
            <TabsTrigger value="all">All Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="days" className="text-sm font-medium">
                  Last {days} days
                </label>
                <Input
                  id="days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Math.min(365, +e.target.value)))}
                  min="1"
                  max="365"
                  className="w-20 h-8 text-center"
                />
              </div>
              <Slider
                value={[days]}
                min={1}
                max={365}
                step={1}
                onValueChange={(value) => setDays(value[0])}
                className="py-4"
              />
            </div>
            <Button onClick={handleDownloadRecentOrders} disabled={loading} className=" bg-[#60B5FF] text-black rounded-3xl"  size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Download Last {days} Days
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will generate a PDF containing all orders in your database. This may take a moment for large
                datasets.
              </p>
              <Button onClick={handleDownloadAllOrders} disabled={loading} className="  bg-[#60B5FF] text-black rounded-3xl " size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download All Orders
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default DownloadOrdersPdf

