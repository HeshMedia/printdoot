"use client ";
import React from "react";

// Define the props interface for the component
interface ProductImagesFormProps {
  mainImagePreview: string | null; // URL for the main image preview; null if not set
  sideImagePreviews: string[]; // Array of URLs for side images previews
  handleMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Handler for main image file changes
  handleSideImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Handler for side images file changes
  removeSideImage: (index: number) => void; // Function to remove a side image by its index
}

export const ProductImagesForm: React.FC<ProductImagesFormProps> = ({
  mainImagePreview,
  sideImagePreviews,
  handleMainImageChange,
  handleSideImagesChange,
  removeSideImage,
}) => {
  return (
    <div>
      {/* Section Title */}
      <h3 className="text-lg font-medium mb-2">Product Images</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Image Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {mainImagePreview ? (
              // Display the main image preview if available
              <div className="space-y-2">
                <img
                  src={mainImagePreview}
                  alt="Main product"
                  className="mx-auto h-40 w-40 object-cover rounded-md"
                />
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Placeholder for main image removal functionality
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              // Display upload options if no main image preview is available
              <div className="space-y-1 text-center">
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
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="main-image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    {/* Trigger file upload for main image */}
                    <span>Upload a file</span>
                    <input
                      id="main-image-upload"
                      name="main-image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleMainImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side Images Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Side Images
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
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
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="side-images-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  {/* Trigger file upload for side images */}
                  <span>Upload files</span>
                  <input
                    id="side-images-upload"
                    name="side-images-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    multiple
                    onChange={handleSideImagesChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* Display side images previews if available */}
          {sideImagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {sideImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Side ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  {/* Button to remove the side image */}
                  <button
                    type="button"
                    onClick={() => removeSideImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
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
