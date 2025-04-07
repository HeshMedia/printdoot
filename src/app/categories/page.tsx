"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoriesApi, Category } from "@/lib/api/admin/categories";

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
    <div className="bg-[#f7fbff] min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-gray-900">
          Browse Categories
        </h1>

        {!loading && !error && (
          <p className="text-center text-gray-600 mb-10">
            Browse <strong>{total}</strong> {total === 1 ? "category" : "categories"}
          </p>
        )}

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all overflow-hidden cursor-pointer">
                {/* Image */}
                <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>

                {/* Name */}
                <div className="py-4 px-3">
                  <h2 className="text-center text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    {category.name}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseCategories;
