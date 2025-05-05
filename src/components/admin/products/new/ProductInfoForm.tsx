"use client";
import React from "react";

interface Category {
  id: number;
  name: string;
}

export interface BulkPrice {
  min_quantity: number;
  max_quantity: number;
  price: number;
}

export interface Dimensions {
  length: number;
  breadth: number;
  height: number;
}

interface ProductFormData {
  product_id: string; 
  name: string;
  price: number;
  category_id: number;
  category_name?: string;
  description: string;
  status: string;
  dimensions: Dimensions;
  bulk_prices: BulkPrice[];
  material: string;
  weight: number;
}

interface ProductInfoFormProps {
  formData: ProductFormData;
  categories: Category[];
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDimensionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBulkPriceChange: (index: number, field: "min_quantity" | "max_quantity" | "price", value: string) => void;
  addBulkPrice: () => void;
  removeBulkPrice: (index: number) => void;
}


export const ProductInfoForm: React.FC<ProductInfoFormProps> = ({
  formData,
  categories,
  handleInputChange,
  handleStatusChange,
  handleDimensionChange,
  handleBulkPriceChange,
  addBulkPrice,
  removeBulkPrice,
}) => {
  const dimFields: (keyof Dimensions)[] = ["length", "breadth", "height"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 rounded-xl gap-6">
      
      {/* Product ID */}
      <div>
        <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
          Product ID *
        </label>
        <input
          type="text"
          id="product_id"
          name="product_id"
          value={formData.product_id || ""}
          onChange={handleInputChange}
          className="w-full border rounded-xl px-3 py-2"
          placeholder=""
        />
      </div>

      
      {/* Name */}
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
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>

      {/* Price */}
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
          value={formData.price === 0 ? "" : formData.price}
          onChange={handleInputChange}
          className="w-full border rounded-xl px-3 py-2"
        />

      </div>

      {/* Category */}
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
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700"
        >
          <option value="" disabled hidden className="text-gray-400 italic text-sm">
            {formData.category_name || "Select a category"}
          </option>
          {Array.isArray(categories) &&
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>


      {/* Status */}
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
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700"
        >
          <option value="" disabled hidden className="text-gray-400">
            Select a status
          </option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      {/* Dimensions */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
      {dimFields.map((dim) => (
          <div key={dim}>
            <label className="block text-sm font-medium text-gray-700 ">
              {dim.charAt(0).toUpperCase() + dim.slice(1)} <span className="italic text-xs">(in cm)</span> *
            </label>
            <input
              type="number"
              name={dim}
              value={formData.dimensions[dim] === 0 ? "" : formData.dimensions[dim] }
              onChange={handleDimensionChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2"
              step="any"
            />
          </div>
        ))}

      </div>

      {/* Bulk Prices */}
      <div className="md:col-span-2 mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Prices *</label>
        {formData.bulk_prices.map((bp, index) => (
          <div key={index} className="flex gap-2 items-center mb-2">
           <input
              type="number"
              placeholder="Min Qty"
              value={bp.min_quantity === 0 ? "" : bp.min_quantity}
              onChange={(e) => handleBulkPriceChange(index, "min_quantity", e.target.value)}
              className="w-1/3 border p-2 rounded-xl"
            />

            <input
              type="number"
              placeholder="Max Qty"
              value={bp.max_quantity === 0 ? "" : bp.max_quantity}
              onChange={(e) => handleBulkPriceChange(index, "max_quantity", e.target.value)}
              className="w-1/3 border p-2 rounded-xl"
            />

            <input
              type="number"
              placeholder="Price per piece"
              value={bp.price === 0 ? "" : bp.price}
              onChange={(e) => handleBulkPriceChange(index, "price", e.target.value)}
              className="w-1/3 border p-2 rounded-xl"
            />


            {formData.bulk_prices.length > 1 && (
              <button
                type="button"
                onClick={() => removeBulkPrice(index)}
                className="text-red-500 font-bold text-lg"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addBulkPrice} className="mt-2 text-blue-600 font-medium">
          + Add More
        </button>
      </div>

      {/* Material */}
      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
        <input
          type="text"
          id="material"
          name="material"
          required
          value={formData.material}
          onChange={handleInputChange}
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (gms) *</label>
        <input
          type="number"
          id="weight"
          name="weight"
          required
          min="0"
          value={formData.weight === 0 ? "" : formData.weight}
          onChange={handleInputChange}
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>


      {/* Description */}
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
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>
    </div>
  );
};
