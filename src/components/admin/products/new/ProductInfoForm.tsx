"use client";
import React, { useState } from "react";

interface Category {
  id: number;
  name: string;
}

export interface BulkPrice {
  min_quantity: number;
  max_quantity: number;
  price: number;
  standard_delivery_price?: number;
  express_delivery_price?: number;
}

export interface Dimension {
  length?: number;
  breadth?: number;
  height?: number;
  radius?: number;
  label?: string;
}

interface ProductFormData {
  product_id: string; 
  name: string;
  price: number;
  category_id: number;
  category_name?: string;
  description: string;
  status: string;
  dimensions: Dimension[] | Dimension;
  bulk_prices: BulkPrice[];
  material: string;
  weight: number;
  standard_delivery_time: string;
  express_delivery_time: string;
  hsn_code?: string;
  gst_percentage?: number;
}

interface ProductInfoFormProps {
  formData: ProductFormData;
  categories: Category[];
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDimensionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBulkPriceChange: (
    index: number, 
    field: "min_quantity" | "max_quantity" | "price" | "standard_delivery_price" | "express_delivery_price", 
    value: string
  ) => void;
  addBulkPrice: () => void;
  removeBulkPrice: (index: number) => void;
  handleAddDimension?: () => void;
  handleRemoveDimension?: (index: number) => void;
  handleDimensionFieldChange?: (index: number, field: string, value: string) => void;
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
  handleAddDimension,
  handleRemoveDimension,
  handleDimensionFieldChange,
}) => {
  const isDimensionsArray = (dimensions: Dimension[] | Dimension): dimensions is Dimension[] => {
    return Array.isArray(dimensions);
  };
 
  const removeDimensionField = (index: number | null, field: string) => {
    if (index !== null && handleDimensionFieldChange) {
      // For array of dimensions
      handleDimensionFieldChange(index, field, undefined as any);
    } else if (!isDimensionsArray(formData.dimensions)) {
      // For single dimension, create a new object without the specified field
      const updatedDimension = { ...formData.dimensions } as any;
      delete updatedDimension[field]; // Properly remove the field
      
      handleDimensionChange({
        target: { name: "dimensions", value: updatedDimension }
      } as any);
    }
  };
  
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
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Product Dimensions</h3>
        </div>
        
        {isDimensionsArray(formData.dimensions) ? (
          // Multiple dimensions handling with tabs
          <div className="space-y-4">
            {formData.dimensions.map((dimension: Dimension, index: number) => (
              <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Size name (e.g. Small, Medium, Large)"
                    value={dimension.label || ""}
                    onChange={(e) => handleDimensionFieldChange?.(index, "label", e.target.value)}
                    className="bg-transparent border-0 focus:ring-0 text-sm font-medium p-0 w-full"
                  />
                  
                  {/* Remove dimension button */}
                  {isDimensionsArray(formData.dimensions) && formData.dimensions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDimension?.(index)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Length */}
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Length (cm)</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dimension.length !== undefined}
                            onChange={() => {
                              if (dimension.length !== undefined) {
                                removeDimensionField(index, "length");
                              } else {
                                handleDimensionFieldChange?.(index, "length", "0");
                              }
                            }}
                            className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {dimension.length !== undefined && (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={dimension.length || ""}
                          onChange={(e) => handleDimensionFieldChange?.(index, "length", e.target.value)}
                          className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        />
                      )}
                    </div>
                    
                    {/* Breadth */}
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Breadth (cm)</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dimension.breadth !== undefined}
                            onChange={() => {
                              if (dimension.breadth !== undefined) {
                                removeDimensionField(index, "breadth");
                              } else {
                                handleDimensionFieldChange?.(index, "breadth", "0");
                              }
                            }}
                            className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {dimension.breadth !== undefined && (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={dimension.breadth || ""}
                          onChange={(e) => handleDimensionFieldChange?.(index, "breadth", e.target.value)}
                          className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        />
                      )}
                    </div>
                    
                    {/* Height */}
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dimension.height !== undefined}
                            onChange={() => {
                              if (dimension.height !== undefined) {
                                removeDimensionField(index, "height");
                              } else {
                                handleDimensionFieldChange?.(index, "height", "0");
                              }
                            }}
                            className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {dimension.height !== undefined && (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={dimension.height || ""}
                          onChange={(e) => handleDimensionFieldChange?.(index, "height", e.target.value)}
                          className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        />
                      )}
                    </div>
                    
                    {/* Radius */}
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Radius (cm)</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dimension.radius !== undefined}
                            onChange={() => {
                              if (dimension.radius !== undefined) {
                                removeDimensionField(index, "radius");
                              } else {
                                handleDimensionFieldChange?.(index, "radius", "0");
                              }
                            }}
                            className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {dimension.radius !== undefined && (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={dimension.radius || ""}
                          onChange={(e) => handleDimensionFieldChange?.(index, "radius", e.target.value)}
                          className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Single dimension handling
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <input
                type="text"
                name="label"
                placeholder="Size name (e.g. Standard Size)"
                value={!isDimensionsArray(formData.dimensions) ? formData.dimensions.label || "" : ""}
                onChange={(e) => {
                  if (!isDimensionsArray(formData.dimensions)) {
                    handleDimensionChange({
                      target: { name: "label", value: e.target.value }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                className="bg-transparent border-0 focus:ring-0 text-sm font-medium p-0 w-full"
              />
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Length */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Length (cm)</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!isDimensionsArray(formData.dimensions) && formData.dimensions.length !== undefined}
                        onChange={() => {
                          if (!isDimensionsArray(formData.dimensions)) {
                            if (formData.dimensions.length !== undefined) {
                              removeDimensionField(null, "length");
                            } else {
                              handleDimensionChange({
                                target: { name: "length", value: "0" }
                              } as React.ChangeEvent<HTMLInputElement>);
                            }
                          }
                        }}
                        className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {!isDimensionsArray(formData.dimensions) && formData.dimensions.length !== undefined && (
                    <input
                      type="number"
                      name="length"
                      min="0"
                      step="any"
                      value={formData.dimensions.length === 0 ? "" : formData.dimensions.length}
                      onChange={handleDimensionChange}
                      className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                    />
                  )}
                </div>
                
                {/* Breadth */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Breadth (cm)</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!isDimensionsArray(formData.dimensions) && formData.dimensions.breadth !== undefined}
                        onChange={() => {
                          if (!isDimensionsArray(formData.dimensions)) {
                            if (formData.dimensions.breadth !== undefined) {
                              removeDimensionField(null, "breadth");
                            } else {
                              handleDimensionChange({
                                target: { name: "breadth", value: "0" }
                              } as React.ChangeEvent<HTMLInputElement>);
                            }
                          }
                        }}
                        className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {!isDimensionsArray(formData.dimensions) && formData.dimensions.breadth !== undefined && (
                    <input
                      type="number"
                      name="breadth"
                      min="0"
                      step="any"
                      value={formData.dimensions.breadth === 0 ? "" : formData.dimensions.breadth}
                      onChange={handleDimensionChange}
                      className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                    />
                  )}
                </div>
                
                {/* Height */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!isDimensionsArray(formData.dimensions) && formData.dimensions.height !== undefined}
                        onChange={() => {
                          if (!isDimensionsArray(formData.dimensions)) {
                            if (formData.dimensions.height !== undefined) {
                              removeDimensionField(null, "height");
                            } else {
                              handleDimensionChange({
                                target: { name: "height", value: "0" }
                              } as React.ChangeEvent<HTMLInputElement>);
                            }
                          }
                        }}
                        className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {!isDimensionsArray(formData.dimensions) && formData.dimensions.height !== undefined && (
                    <input
                      type="number"
                      name="height"
                      min="0"
                      step="any"
                      value={formData.dimensions.height === 0 ? "" : formData.dimensions.height}
                      onChange={handleDimensionChange}
                      className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                    />
                  )}
                </div>
                
                {/* Radius */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Radius (cm)</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!isDimensionsArray(formData.dimensions) && formData.dimensions.radius !== undefined}
                        onChange={() => {
                          if (!isDimensionsArray(formData.dimensions)) {
                            if (formData.dimensions.radius !== undefined) {
                              removeDimensionField(null, "radius");
                            } else {
                              handleDimensionChange({
                                target: { name: "radius", value: "0" }
                              } as React.ChangeEvent<HTMLInputElement>);
                            }
                          }
                        }}
                        className="h-4 w-4 mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {!isDimensionsArray(formData.dimensions) && formData.dimensions.radius !== undefined && (
                    <input
                      type="number"
                      name="radius"
                      min="0"
                      step="any"
                      value={formData.dimensions.radius === 0 ? "" : formData.dimensions.radius}
                      onChange={handleDimensionChange}
                      className="mt-1.5 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add another size option button */}
        <button 
          type="button" 
          onClick={handleAddDimension} 
          className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 bg-background text-gray-700"
        >
          <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Size Option
        </button>
      </div>

      {/* Bulk Prices */}
      <div className="md:col-span-2 mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Prices *</label>
        {formData.bulk_prices.map((bp, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 items-center mb-4 border-b pb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Min Qty</label>
              <input
                type="number"
                placeholder="Min Qty"
                value={bp.min_quantity === 0 ? "" : bp.min_quantity}
                onChange={(e) => handleBulkPriceChange(index, "min_quantity", e.target.value)}
                className="w-full border p-2 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Max Qty</label>
              <input
                type="number"
                placeholder="Max Qty"
                value={bp.max_quantity === 0 ? "" : bp.max_quantity}
                onChange={(e) => handleBulkPriceChange(index, "max_quantity", e.target.value)}
                className="w-full border p-2 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Price</label>
              <input
                type="number"
                placeholder="Price per piece"
                value={bp.price === 0 ? "" : bp.price}
                onChange={(e) => handleBulkPriceChange(index, "price", e.target.value)}
                className="w-full border p-2 rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Std. Delivery ₹</label>
              <input
                type="number"
                placeholder="Std. Delivery Cost"
                value={bp.standard_delivery_price === 0 || bp.standard_delivery_price === undefined ? "" : bp.standard_delivery_price}
                onChange={(e) => handleBulkPriceChange(index, "standard_delivery_price", e.target.value)}
                className="w-full border p-2 rounded-xl"
              />
            </div>
            
            <div className="flex items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Exp. Delivery ₹</label>
                <input
                  type="number"
                  placeholder="Express Delivery Cost"
                  value={bp.express_delivery_price === 0 || bp.express_delivery_price === undefined ? "" : bp.express_delivery_price}
                  onChange={(e) => handleBulkPriceChange(index, "express_delivery_price", e.target.value)}
                  className="w-full border p-2 rounded-xl"
                />
              </div>
              
              {formData.bulk_prices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBulkPrice(index)}
                  className="text-red-500 font-bold text-lg ml-2 mb-2"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addBulkPrice} className="mt-2 text-blue-600 font-medium">
          + Add Bulk Price Option
        </button>
      </div>

      {/* Material */}
      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Material </label>
        <input
          type="text"
          id="material"
          name="material"
          value={formData.material}
          onChange={handleInputChange}
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (gms) </label>
        <input
          type="number"
          id="weight"
          name="weight"
          min="0"
          value={formData.weight === 0 ? "" : formData.weight}
          onChange={handleInputChange}
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>

      {/* Standard Delivery Time */}
      <div>
        <label htmlFor="standard_delivery_time" className="block text-sm font-medium text-gray-700 mb-1">
          Standard Delivery Time
        </label>
        <input
          type="text"
          id="standard_delivery_time"
          name="standard_delivery_time"
          value={formData.standard_delivery_time || ""}
          onChange={handleInputChange}
          placeholder="e.g. 2-3 business days"
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>      {/* Express Delivery Time */}
      <div>
        <label htmlFor="express_delivery_time" className="block text-sm font-medium text-gray-700 mb-1">
          Express Delivery Time
        </label>
        <input
          type="text"
          id="express_delivery_time"
          name="express_delivery_time"
          value={formData.express_delivery_time || ""}
          onChange={handleInputChange}
          placeholder="e.g. 1-2 business days"
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>
      
      {/* HSN Code - Admin Only */}
      <div>
        <label htmlFor="hsn_code" className="block text-sm font-medium text-gray-700 mb-1">
          HSN Code
        </label>
        <input
          type="text"
          id="hsn_code"
          name="hsn_code"
          value={formData.hsn_code || ""}
          onChange={handleInputChange}
          placeholder="e.g. 1234"
          className="w-full border rounded-xl px-3 py-2"
        />
        <p className="text-xs text-gray-400 mt-1">For tax classification purposes</p>
      </div>

      {/* GST Percentage - Admin Only */}
      <div>
        <label htmlFor="gst_percentage" className="block text-sm font-medium text-gray-700 mb-1">
          GST Percentage (%)
        </label>
        <input
          type="number"
          id="gst_percentage"
          name="gst_percentage"
          min="0"
          max="100"
          value={formData.gst_percentage === 0 || formData.gst_percentage === undefined ? "" : formData.gst_percentage}
          onChange={handleInputChange}
          placeholder="e.g. 18"
          className="w-full border rounded-xl px-3 py-2"
        />
        <p className="text-xs text-gray-400 mt-1">Applicable GST rate for this product</p>
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