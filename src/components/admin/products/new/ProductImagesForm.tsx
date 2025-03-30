"use client";

import React from "react";

interface ProductImagesFormProps {
  mainImagePreview: string | null;
  sideImagePreviews: string[];
  handleMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSideImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeMainImage: () => void; 
  removeSideImage: (index: number) => void;
}

export const ProductImagesForm: React.FC<ProductImagesFormProps> = ({
  mainImagePreview,
  sideImagePreviews,
  handleMainImageChange,
  handleSideImagesChange,
  removeSideImage,
  removeMainImage,
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Product Images</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Image
          </label>
          <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md px-6 pt-5 pb-6 flex justify-center items-center">
            {mainImagePreview ? (
              <div className="space-y-2 text-center">
                <img
                  src={mainImagePreview}
                  alt="Main Preview"
                  className="mx-auto h-40 w-40 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={removeMainImage}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center items-center gap-1">
                  <label
                    htmlFor="main-image-upload"
                    className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="main-image-upload"
                      name="main-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="sr-only"
                    />
                  </label>
                  <span>or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Side Images
          </label>
          <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md px-6 pt-5 pb-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600 justify-center items-center gap-1 mt-2">
              <label
                htmlFor="side-images-upload"
                className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
              >
                <span>Upload files</span>
                <input
                  id="side-images-upload"
                  name="side-images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSideImagesChange}
                  className="sr-only"
                />
              </label>
              <span>or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>

          {sideImagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {sideImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Side ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeSideImage(index)}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
