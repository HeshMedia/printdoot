"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Define the Product interface (or import if you already have it)
interface Product {
  product_id: string;
  name: string;
  price: number;
  main_image_url: string;
  status: string;
}

// Replace this with your real API call
async function getProducts(skip = 0, limit = 4): Promise<Product[]> {
  const res = await fetch(
    `https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod/products?skip=${skip}&limit=${limit}`
  );
  const data = await res.json();
  return data.products || [];
}

export default function PopularProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="p-8 text-center text-gray-600">No products found.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Popular Products</h2>
        <Link href="/admin/products" className="text-blue-600 hover:underline text-sm">
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.product_id}
            className="flex items-center p-3 hover:bg-gray-50 rounded-xl"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden">
              <img
                src={product.main_image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="text-xs text-gray-500">₹{product.price}</p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {product.status === "in_stock" ? "Available" : "Out of Stock"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
