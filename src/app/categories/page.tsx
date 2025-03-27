"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

const BrowseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://pleasant-mullet-unified.ngrok-free.app/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load categories");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">Browse Categories</h1>
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${category.id}`}>
            <div className="bg-white border rounded-xl p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-700 text-center">{category.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrowseCategories;
