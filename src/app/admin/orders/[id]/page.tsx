"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ordersApi, type Order } from "@/lib/api/admin/orders"

// Define the correct type for the PDF generation response
interface GeneratePdfResponse {
  pdf_data: string;
  filename: string;
}

export default function OrderDetailsPage() {
  const params = useParams()
  const id = params.id as string  // Type assertion if necessary
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      const fetchOrderDetails = async () => {
        try {
          setLoading(true)
          const orderData = await ordersApi.getOrderById(id)
          setOrder(orderData)
          setLoading(false)
        } catch (err) {
          setError("Failed to fetch order details")
          setLoading(false)
        }
      }

      fetchOrderDetails()
    }
  }, [id])

  const downloadOrderPdf = async () => {
    if (!id) return
    try {
      // Get the response from the API
      const responseString = await ordersApi.generateSingleOrderPdf(id)
  
      // Log the raw response string to check what we're receiving
      console.log("Raw API response:", responseString)
  
      // Check if the response is empty or invalid
      if (!responseString) {
        setError("Received empty response from the API")
        console.error("Received empty response:", responseString)
        return
      }
  
      // Parse the response as JSON
      const response: GeneratePdfResponse = JSON.parse(responseString)
    
      // Log the full response to see its structure
      console.log("Parsed API response:", response)
    
      // Ensure the response contains both the pdf_data and filename properties
      if (!response || !response.pdf_data || !response.filename) {
        setError("Invalid response format")
        console.error("Invalid response format:", response)
        return
      }
    
      const { pdf_data, filename } = response
    
      // Log the length of base64 data to confirm it's received properly
      console.log(`Received PDF data (length: ${pdf_data.length})`)
    
      // Convert base64 data to a Blob
      const byteCharacters = atob(pdf_data) // Decode base64 string into bytes
    
      // Check for empty base64 data
      if (byteCharacters.length === 0) {
        setError("Base64 data is empty")
        console.error("Base64 data is empty")
        return
      }
    
      const byteArrays = []
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024)
        const byteNumbers = new Array(slice.length)
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }
    
      const blob = new Blob(byteArrays, { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob) // Create a temporary URL for the Blob
      link.download = filename || `order_${id}.pdf` // Use filename from response, or default to `order_id.pdf`
      link.click() // Trigger the download
    } catch (error) {
      setError("Failed to download order PDF")
      console.error("Error during PDF download:", error)
    }
  }
  
  

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : order ? (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h2 className="text-xl font-semibold mb-4">Order #{order.order_id}</h2>
            <p><strong>Customer:</strong> {order.user_name}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Phone:</strong> {order.phone_number}</p>
            <p><strong>Address:</strong> {order.address}, {order.city}, {order.state}, {order.country}, {order.pin_code}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Price:</strong> ${order.total_price.toFixed(2)}</p>
            <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>

            <h3 className="text-lg font-semibold mt-6">Items</h3>
            <ul>
              {order.items.map((item, index) => (
                <li key={index} className="mb-2">
                  <p><strong>Product ID:</strong> {item.product_id}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Price:</strong> ${item.individual_price.toFixed(2)}</p>
                  <p><strong>Customizations:</strong> {JSON.stringify(item.selected_customizations)}</p>
                  <p><strong>Customization Type:</strong> {item.user_customization_type}</p>
                  <p><strong>Customization Value:</strong> {item.user_customization_value}</p>
                </li>
              ))}
            </ul>

            <button
              onClick={downloadOrderPdf}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Download Order Details PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-600">Order not found.</div>
      )}
    </div>
  )
}
