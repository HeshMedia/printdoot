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
  const [allProducts, setAllProducts] = useState<Product[]>([]); // All products from API
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Products after search filtering
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Products for current page
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
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoryResponse = await categoriesApi.getCategories();
        setCategories(categoryResponse.categories);

        // Fetch products with filters except search term
        const { products, total } =
          selectedCategory || minPrice || maxPrice || minRating
            ? await productsApi.filterProducts({
                category_id: selectedCategory || undefined,
                min_price: minPrice || undefined,
                max_price: maxPrice || undefined,
                min_rating: minRating || undefined,
              })
            : await productsApi.getProducts(0, 1000); // Get all products for frontend search

        setAllProducts(products);
        setTotalCount(total);

        // Apply client-side search filter
        const searchFiltered = searchTerm
          ? products.filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : products;

        setFilteredProducts(searchFiltered);
        setTotalPages(Math.ceil(searchFiltered.length / itemsPerPage));
        
        // Calculate products for the current page
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setDisplayedProducts(searchFiltered.slice(start, end));
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to fetch products.");
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, minPrice, maxPrice, minRating]);

  // Handle search term changes
  useEffect(() => {
    // Apply search filter to all products
    const searchFiltered = searchTerm
      ? allProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allProducts;

    setFilteredProducts(searchFiltered);
    setTotalPages(Math.ceil(searchFiltered.length / itemsPerPage));
    
    // Reset to first page when search changes
    setCurrentPage(1);
    
    // Calculate products for the first page
    setDisplayedProducts(searchFiltered.slice(0, itemsPerPage));
  }, [searchTerm, allProducts]);

  // Update displayed products when page changes
  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedProducts(filteredProducts.slice(start, end));
  }, [currentPage, filteredProducts]);

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsApi.deleteProduct(productId);
        
        // Update all product lists
        const updatedProducts = allProducts.filter((product) => product.product_id !== productId);
        setAllProducts(updatedProducts);
        
        const updatedFiltered = filteredProducts.filter((product) => product.product_id !== productId);
        setFilteredProducts(updatedFiltered);
        
        setTotalPages(Math.ceil(updatedFiltered.length / itemsPerPage));
        
        // Recalculate displayed products
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setDisplayedProducts(updatedFiltered.slice(start, end));
        
        // If the current page is now empty and not the first page, go back one page
        if (
          currentPage > 1 &&
          updatedFiltered.length <= (currentPage - 1) * itemsPerPage
        ) {
          setCurrentPage(currentPage - 1);
        }
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
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
        ) : displayedProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No products found.</div>
        ) : (
          <>
            <ProductTable products={displayedProducts} handleDelete={handleDelete} />
            <div className="px-4 py-5 border-t">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
              <div className="text-center text-sm text-gray-500 mt-2">
                Showing {displayedProducts.length} of {filteredProducts.length} products
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
