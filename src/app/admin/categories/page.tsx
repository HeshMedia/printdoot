"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, ChevronDown, ChevronUp, X } from "lucide-react";
import { categoriesApi, type Category } from "@/lib/api/admin/categories";
import CategoryForm from "@/components/admin/category-form";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [modalImage, setModalImage] = useState<{ src: string; name: string } | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { categories } = await categoriesApi.getCategories();
      setCategories(categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    setIsFormOpen(false);
    await fetchCategories();
  };

  const handleUpdateCategory = async () => {
    setEditingCategory(null);
    await fetchCategories();
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen((prev) => !prev);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {isFormOpen && !editingCategory && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
          <CategoryForm onSubmit={handleCreateCategory} onCancel={() => setIsFormOpen(false)} />
        </div>
      )}

      {editingCategory && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Category: {editingCategory.name}</h2>
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditingCategory(null)}
            isEditing
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    {category.image_url && (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded-xl border cursor-pointer"
                        onClick={() => setModalImage({ src: category.image_url!, name: category.name })}
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedCategories[category.id] && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">User Customization Options</h4>
                      <div className="flex flex-wrap gap-2">
                        
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Allowed Customizations</h4>
                      {Object.keys(category.allowed_customizations).length === 0 ? (
                        <p className="text-sm text-gray-500">No customizations defined</p>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(category.allowed_customizations).map(([key, values]) => (
                            <div key={key}>
                              <span className="text-sm font-medium">{key}:</span>
                              {/* <div className="flex flex-wrap gap-1 mt-1">
                                {values.map((value, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                                  >
                                    {value}
                                  </span>
                                ))}
                              </div> */}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 max-w-3xl w-full relative">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold mb-4">{modalImage.name}</h2>
            <img
              src={modalImage.src}
              alt={modalImage.name}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
