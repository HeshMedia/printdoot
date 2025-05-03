"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ordersApi, type Order } from "@/lib/api/admin/orders";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await ordersApi.getOrderById(id);
        setOrder(orderData);
      } catch {
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  const downloadOrderPdf = async () => {
    if (!id) return;
    try {
      const { pdf_data, filename } = await ordersApi.generateSingleOrderPdf(id);
      const byteCharacters = atob(pdf_data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
        byteArrays.push(new Uint8Array(byteNumbers));
      }

      const blob = new Blob(byteArrays, { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename || `order_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      setError("Failed to download order PDF.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen bg-[#f9f9fb]">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">🧾 Order Details</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : !order ? (
        <p className="text-center text-gray-500">Order not found.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-8 space-y-8">
          {/* Order Summary */}
          <div className="grid gap-2 border-b pb-6">
            <h2 className="text-2xl font-semibold text-blue-800">Order #{order.order_id}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-sm text-gray-700">
              <p><strong>Customer:</strong> {order.user_name}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Phone:</strong> {order.phone_number}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ₹{order.total_price.toFixed(2)}</p>
              <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p className="sm:col-span-2">
                <strong>Address:</strong> {order.address}, {order.city}, {order.state}, {order.country} - {order.pin_code}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🛒 Items</h3>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="border bg-gray-50 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-6 items-start md:items-center"
                >
                  {(item.user_customization_type === "image" || item.user_customization_type === "logo") &&
                  item.user_customization_value.startsWith("http") ? (
                    <img
                      src={item.user_customization_value}
                      alt="Customization Preview"
                      className="w-40 h-40 object-contain rounded-xl border bg-white"
                    />
                  ) : null}

                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Product ID:</strong> {item.product_id}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Price:</strong> ₹{item.individual_price.toFixed(2)}</p>
                    <p><strong>Customizations:</strong> {JSON.stringify(item.selected_customizations)}</p>
                    <p><strong>Type:</strong> {item.user_customization_type}</p>
                    <p>
                      <strong>Value:</strong>{" "}
                      {(item.user_customization_type === "image" || item.user_customization_type === "logo") &&
                      item.user_customization_value.startsWith("http") ? (
                        <span className="text-gray-400 italic">(Image shown)</span>
                      ) : (
                        <span className="italic text-gray-600">{item.user_customization_value}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="text-right pt-4">
            <button
              onClick={downloadOrderPdf}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              📄 Download Order PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
