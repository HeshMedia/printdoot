"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { productsApi, type Product } from "@/lib/api/admin/products";
import { categoriesApi, type Category } from "@/lib/api/admin/categories";
import ProductFilters from "@/components/admin/products/ProductFilters";
import ProductTable from "@/components/admin/products/ProductTable";
import PaginationControls from "@/components/admin/products/PaginationControls";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoryResponse = await categoriesApi.getCategories();
        setCategories(categoryResponse);

        // Fetch products
        const { products, total } =
          selectedCategory || minPrice || maxPrice || minRating
            ? await productsApi.filterProducts({
                category_id: selectedCategory || undefined,
                min_price: minPrice || undefined,
                max_price: maxPrice || undefined,
                min_rating: minRating || undefined,
                skip: (currentPage - 1) * itemsPerPage,
                limit: itemsPerPage,
              })
            : await productsApi.getProducts((currentPage - 1) * itemsPerPage, itemsPerPage);

        const filtered = searchTerm
          ? products.filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : products;

        setProducts(filtered);
        setTotalPages(Math.ceil(total / itemsPerPage));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to fetch products.");
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm, selectedCategory, minPrice, maxPrice, minRating]);

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsApi.deleteProduct(productId);
        setProducts((prev) => prev.filter((product) => product.product_id !== productId));
      } catch (err) {
        console.error(err);
        alert("Failed to delete product");
      }
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinPrice(null);
    setMaxPrice(null);
    setMinRating(null);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          minRating={minRating}
          setMinRating={setMinRating}
          handleFilter={handleFilter}
          clearFilters={clearFilters}
        />

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No products found.</div>
        ) : (
          <>
            <ProductTable products={products} handleDelete={handleDelete} />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
