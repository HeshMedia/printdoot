"use client";

import type { BulkPrice } from "@/lib/api/products";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dimension, ProductInfoForm } from "@/components/admin/products/new/ProductInfoForm";
import { CustomizationOptions } from "@/components/admin/products/new/CustomizationOptions";
import { ProductImagesForm } from "@/components/admin/products/new/ProductImagesForm";
import { FormButtons } from "@/components/admin/products/new/FormButtons";
import { productsApi, urlToBase64 } from "@/lib/api/admin/products";
import { categoriesApi, Category } from "@/lib/api/admin/categories";

interface ProductFormProps {
  initialData?: any;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(initialData?.main_image_url || null);
  const [sideImages, setSideImages] = useState<File[]>([]);
  const [sideImagePreviews, setSideImagePreviews] = useState<string[]>(initialData?.side_images_url || []);

  const [formData, setFormData] = useState<any>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    product_id: initialData?.product_id || "",
    category_id: initialData?.category_id || "",
    category_name: initialData?.category_name || "",
    description: initialData?.description || "",
    customization_options: initialData?.customization_options || {},
    status: initialData?.status || "in_stock",
    dimensions: initialData?.dimensions || {},
    bulk_prices: initialData?.bulk_prices || [
      { min_quantity: 0, max_quantity: 0, price: 0, standard_delivery_price: 0, express_delivery_price: 0 }
    ],
    material: initialData?.material || "",
    weight: initialData?.weight || 0,
    standard_delivery_time: initialData?.standard_delivery_time || "",
    express_delivery_time: initialData?.express_delivery_time || "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getCategories();
        setCategories(res.categories || []);

        // If we're editing a product
        if (initialData) {
          // Find the matching category by name if we have category_name but not category_id
          const matchingCategory = res.categories?.find(
            (c) => c.name.toLowerCase() === initialData.category_name?.toLowerCase()
          );

          if (matchingCategory) {
            // Process customization options for the form
            // Convert the nested object structure from API to the array format used by the form
            const processedCustomizations: Record<string, string[]> = {};

            if (initialData.customization_options) {
              Object.entries(initialData.customization_options).forEach(([key, options]) => {
                processedCustomizations[key] = Object.keys(options as Record<string, string>);
              });
            }

            // Update formData with the correct category_id and processed customization options
            setFormData((prev: any) => ({
              ...prev,
              category_id: matchingCategory.id,
              customization_options: processedCustomizations
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to fetch categories.");
      }
    };

    fetchCategories();
  }, [initialData]);

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
  };

  
  // Support for multiple dimensions
  const handleAddDimension = () => {
    setFormData((prev: any) => ({
      ...prev,
      dimensions: Array.isArray(prev.dimensions) 
        ? [...prev.dimensions, { }]  // Empty object without type
        : [prev.dimensions, { }]     // Empty object without type
    }));
  };

  const handleRemoveDimension = (index: number) => {
    setFormData((prev: any) => {
      if (!Array.isArray(prev.dimensions)) return prev;
      
      // If this is the last dimension, return an empty dimensions object
      if (prev.dimensions.length === 1) {
        return {
          ...prev,
          dimensions: {} // Convert to empty object when removing the last array item
        };
      }
      
      // Otherwise filter out the removed dimension
      const updatedDimensions = prev.dimensions.filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        dimensions: updatedDimensions
      };
    });
  };
// Update these functions in the ProductForm component

const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  if (name === "dimensions") {
    // When the entire dimensions object is being replaced
    setFormData((prev: any) => ({
      ...prev,
      dimensions: value,
    }));
  } else {
    // When a field within dimensions is being updated
    setFormData((prev: any) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: name === 'label' ? value : parseFloat(value) || 0,
      },
    }));
  }
};

const handleDimensionFieldChange = (index: number, field: string, value: string) => {
  setFormData((prev: any) => {
    if (!Array.isArray(prev.dimensions)) {
      // If dimensions is not yet an array, just update the single dimension object
      return {
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [field]: field === 'label' ? value : (value === undefined ? undefined : parseFloat(value) || 0)
        }
      };
    }
    
    // Otherwise update the dimension at the specified index
    const updatedDimensions = [...prev.dimensions];
    if (value === undefined) {
      // If value is undefined, remove the field
      const dimension = { ...updatedDimensions[index] };
      delete dimension[field as keyof Dimension];
      updatedDimensions[index] = dimension;
    } else {
      // Otherwise update the field
      updatedDimensions[index] = {
        ...updatedDimensions[index],
        [field]: field === 'label' ? value : parseFloat(value) || 0
      };
    }
    
    return {
      ...prev,
      dimensions: updatedDimensions
    };
  });
};

  const handleBulkPriceChange = (
    index: number,
    field: "min_quantity" | "max_quantity" | "price" | "standard_delivery_price" | "express_delivery_price",
    value: string
  ) => {
    const updated = [...formData.bulk_prices];
    updated[index][field] = parseFloat(value);
    setFormData((prev: any) => ({
      ...prev,
      bulk_prices: updated,
    }));
  };
  const addBulkPrice = () => {
    setFormData((prev: any) => ({
      ...prev,
      bulk_prices: [...prev.bulk_prices, { min_quantity: 0, max_quantity: 0, price: 0, standard_delivery_price: 0, express_delivery_price: 0 }],
    }));
  };

  const removeBulkPrice = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      bulk_prices: prev.bulk_prices.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleRemoveCustomizationField = (key: string) => {
    const updated = { ...formData.customization_options };
    delete updated[key];
    setFormData({ ...formData, customization_options: updated });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "price"
        ? parseFloat(value)
        : name === "category_id"
        ? parseInt(value, 10)
        : value;

    setFormData((prev: any) => {
      if (name === "category_id") {
        return {
          ...prev,
          [name]: parsedValue,
          customization_options: {} // ✅ reset customization when category changes
        };
      }
      return { ...prev, [name]: parsedValue };
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, status: e.target.value });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSideImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSideImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setSideImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeSideImage = (index: number) => {
    setSideImages((prev) => prev.filter((_, i) => i !== index));
    setSideImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomizationChange = (key: string, values: string[]) => {
    const updated = { ...formData.customization_options };
    if (!values.length) {
      delete updated[key];
    } else {
      updated[key] = values;
    }
    setFormData({ ...formData, customization_options: updated });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // 1. Find the selected category so we know allowed_customizations
      const selectedCategory = categories.find(c => c.id === formData.category_id);

      // 2. Transform customization_options into the nested-object shape
      const transformedCustomizations = Object.entries(
        formData.customization_options as Record<string, string[]>
      ).reduce<Record<string, Record<string, string>>>((acc, [key, values]) => {
        if (!selectedCategory) return acc;
        const allowed = selectedCategory.allowed_customizations[key] || {};
        const mapped: Record<string, string> = {};
        values.forEach((val) => {
          const match = allowed[val];
          if (match) mapped[val] = match;
        });
        if (Object.keys(mapped).length > 0) {
          acc[key] = mapped;
        }
        return acc;
      }, {});

      // 3. Build the final payload
      const { category_name, ...formDataWithoutCategoryName } = formData; // Remove category_name from payload
      const payload = {
        ...formDataWithoutCategoryName,
        price: Number(formData.price),
        weight: Number(formData.weight),
        dimensions: Array.isArray(formData.dimensions)
          ? formData.dimensions.map((dim: any) => ({
              length: Number(dim.length) || 0,
              breadth: Number(dim.breadth) || 0,
              height: Number(dim.height) || 0,
              radius: Number(dim.radius) || 0,
              label: dim.label || ""
            }))
          : [{ // Wrap the single dimension object in an array
              length: Number(formData.dimensions.length) || 0,
              breadth: Number(formData.dimensions.breadth) || 0,
              height: Number(formData.dimensions.height) || 0,
              radius: Number(formData.dimensions.radius) || 0,
              label: formData.dimensions.label || ""
            }],
        bulk_prices: formData.bulk_prices.map((bp: BulkPrice) => ({
          min_quantity: Number(bp.min_quantity) || 0,
          max_quantity: Number(bp.max_quantity) || 0,
          price: Number(bp.price) || 0,
          standard_delivery_price: Number(bp.standard_delivery_price) || 0,
          express_delivery_price: Number(bp.express_delivery_price) || 0,
        })),
        customization_options: transformedCustomizations,
      };
      console.log("Payload:", payload); // Log the payload for debugging
      // 4. Call the right API and stash the returned ID
      let response;
      if (initialData) {
        response = await productsApi.updateProduct(initialData.product_id, payload);
      } else {
        response = await productsApi.createProduct(payload);
      }
      setProductId(response.product_id);
      console.log("Product ID:", response.product_id); // Log the product ID for debugging
      // 5. Advance to the image-upload step
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 80) clearInterval(interval);
        else setUploadProgress(progress);
      }, 100);

      if (initialData) {
        // For editing existing products
        if (mainImage) {
          // If a new main image was selected, use the file directly
          await productsApi.updateProductImages(productId || initialData.product_id, mainImage, sideImages);
        } else if (mainImagePreview) {
          // If we're using the existing image from cloudfront, convert URL to base64
          try {
            // Convert the cloudfront URL to base64
            const mainImageData = await urlToBase64(mainImagePreview);

            // Handle side images - convert existing URLs to base64, use files directly for new ones
            let processedSideImages: File[] = [];
            let sideImagesBase64: string[] = [];
            let sideImagesExtensions: string[] = [];

            // Process side images - for each preview, check if it's a new file or an existing URL
            for (let i = 0; i < sideImagePreviews.length; i++) {
              const preview = sideImagePreviews[i];
              // Check if this is one of our newly added files
              const correspondingFile = sideImages.find((_, index) =>
                sideImagePreviews.indexOf(preview) === index &&
                preview.startsWith('blob:') // blob URLs are from new files
              );

              if (correspondingFile) {
                // This is a new file, add it to processed files
                processedSideImages.push(correspondingFile);
              } else {
                // This is an existing URL, convert to base64
                const sideImageData = await urlToBase64(preview);
                sideImagesBase64.push(sideImageData.base64);
                sideImagesExtensions.push(sideImageData.extension);
              }
            }

            if (processedSideImages.length > 0) {
              // If we have new side image files, use the updateProductImages method
              if (mainImage) {
                // If main image is a File object
                await productsApi.updateProductImages(productId || initialData.product_id, mainImage, processedSideImages);
              } else {
                // If main image is a URL converted to base64
                await productsApi.updateProductImagesFromBase64(
                  productId || initialData.product_id,
                  mainImageData.base64,
                  mainImageData.extension,
                  sideImagesBase64,
                  sideImagesExtensions
                );
              }
            } else if (sideImagesBase64.length > 0) {
              // If we only have existing URLs for side images
              await productsApi.updateProductImagesFromBase64(
                productId || initialData.product_id,
                mainImageData.base64,
                mainImageData.extension,
                sideImagesBase64,
                sideImagesExtensions
              );
            } else {
              // If we're only updating the main image
              await productsApi.updateProductImagesFromBase64(
                productId || initialData.product_id,
                mainImageData.base64,
                mainImageData.extension,
                [],
                []
              );
            }
          } catch (err) {
            console.error("Failed to convert image URL to base64:", err);
            throw new Error("Failed to process images. Please try uploading them directly.");
          }
        } else {
          setError("Main image is required.");
          setLoading(false);
          clearInterval(interval);
          return;
        }
      } else {
        // For new products, use the original method with File objects
        if (!mainImage) {
          setError("Main image is required.");
          setLoading(false);
          clearInterval(interval);
          return;
        }
        await productsApi.uploadProductImages(productId!, mainImage, sideImages);
      }

      clearInterval(interval);
      setUploadProgress(100);
      setStep(3);

      setTimeout(() => router.push("/admin/products"), 800);
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Failed to upload images. " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.back();

  return (
    <form onSubmit={step === 1 ? handleSubmit : handleImageUpload} className="space-y-6 rounded-xl">
      {error && <div className="bg-red-100 border border-red-300 text-red-700  px-4 py-2 rounded-xl">{error}</div>}

      <div className="flex justify-between items-center rounded-xl italic text-gray-500 text-sm">
        <strong>Step {step}</strong>{" "}
        {step === 1 ? "Product Info" : step === 2 ? "Upload Images" : "Upload Complete"}
      </div>

      {step === 1 && (
        <div className="rounded-xl">
          <ProductInfoForm
            formData={formData}
            categories={categories}
            handleInputChange={handleInputChange}
            handleStatusChange={handleStatusChange}
            handleDimensionChange={handleDimensionChange} // ✅ NEW
            handleBulkPriceChange={handleBulkPriceChange} // ✅ NEW
            addBulkPrice={addBulkPrice}                   // ✅ NEW
            removeBulkPrice={removeBulkPrice}             // ✅ NEW
            handleAddDimension={handleAddDimension}       // ✅ NEW
            handleRemoveDimension={handleRemoveDimension} // ✅ NEW
            handleDimensionFieldChange={handleDimensionFieldChange} 
          />
          <CustomizationOptions
            customizationOptions={formData.customization_options}
            handleCustomizationChange={handleCustomizationChange}
            removeCustomizationField={handleRemoveCustomizationField}
            allowedCustomizations={
              categories.find((c) => c.id === formData.category_id)?.allowed_customizations || {}
            } // ✅ CORRECT
          />

          <FormButtons loading={loading} isEditing={!!initialData} handleCancel={handleCancel} />
        </div>
      )}

      {step === 2 && (
        <>
          <ProductImagesForm
            mainImagePreview={mainImagePreview}
            sideImagePreviews={sideImagePreviews}
            handleMainImageChange={handleMainImageChange}
            handleSideImagesChange={handleSideImagesChange}
            removeSideImage={removeSideImage}
            removeMainImage={removeMainImage}
          />
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          <FormButtons loading={loading} isEditing={!!initialData} handleCancel={handleCancel} />
        </>
      )}

      {step === 1 && productId && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded">
          {initialData ? (
            "Product updated. You can now upload images."
          ) : (
            <>
           Product created! ID: <strong>{productId}</strong>. Proceed to upload images.
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded">
          Images uploaded successfully!
        </div>
      )}
    </form>
  );
}
