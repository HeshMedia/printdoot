"use client";
import React from "react";

interface Category {
  id: number;
  name: string;
}

interface ProductFormData {
  name: string;
  price: number;
  category_id: number;
  description: string;
  status: string;
}

interface ProductInfoFormProps {
  formData: ProductFormData;
  categories: Category[];
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const ProductInfoForm: React.FC<ProductInfoFormProps> = ({
  formData,
  categories,
  handleInputChange,
  handleStatusChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Price *
        </label>
        <input
          type="number"
          id="price"
          name="price"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleInputChange}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          value={formData.category_id}
          onChange={handleInputChange}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="">Select a category</option>
          {Array.isArray(categories) &&
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status *
        </label>
        <select
          id="status"
          name="status"
          required
          value={formData.status}
          onChange={handleStatusChange}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>
    </div>
  );
};
