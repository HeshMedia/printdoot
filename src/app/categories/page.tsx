"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoriesApi, Category } from "@/lib/api/categories"; // adjust the path if needed

const BrowseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await categoriesApi.getCategories();
        setCategories(data.categories);
        setTotal(data.total);
      } catch {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
        Browse Categories
      </h1>

      {/* Show total categories */}
      {!loading && !error && (
        <p className="text-center text-gray-600 mb-8">
          Browse <strong>{total}</strong> {total === 1 ? "category" : "categories"}
        </p>
      )}

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${category.id}`}>
            <div className="bg-white border rounded-xl p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-700 text-center">
                {category.name}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrowseCategories;
