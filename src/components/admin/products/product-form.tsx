"use client";

import type { BulkPrice } from "@/lib/api/products";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductInfoForm } from "@/components/admin/products/new/ProductInfoForm";
import { CustomizationOptions } from "@/components/admin/products/new/CustomizationOptions";
import { ProductImagesForm } from "@/components/admin/products/new/ProductImagesForm";
import { FormButtons } from "@/components/admin/products/new/FormButtons";
import { productsApi, fileToBase64, urlToBase64 } from "@/lib/api/admin/products";
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
    dimensions: initialData?.dimensions || { length: 0, breadth: 0, height: 0 },
    bulk_prices: initialData?.bulk_prices || [
      { min_quantity: 0, max_quantity: 0, price: 0 }
    ],
    material: initialData?.material || "",
    weight: initialData?.weight || 0,
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

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: parseFloat(value),
      },
    }));
  };

  const handleBulkPriceChange = (
    index: number,
    field: "min_quantity" | "max_quantity" | "price",
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
      bulk_prices: [...prev.bulk_prices, { min_quantity: 0, max_quantity: 0, price: 0 }],
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
        dimensions: {
          length: Number(formData.dimensions.length),
          breadth: Number(formData.dimensions.breadth),
          height: Number(formData.dimensions.height),
        },
        bulk_prices: formData.bulk_prices.map((bp: BulkPrice) => ({
          min_quantity: Number(bp.min_quantity),
          max_quantity: Number(bp.max_quantity),
          price: Number(bp.price),
        })),
        customization_options: transformedCustomizations,
      };

      // 4. Call the right API and stash the returned ID
      let response;
      if (initialData) {
        response = await productsApi.updateProduct(initialData.product_id, payload);
      } else {
        response = await productsApi.createProduct(payload);
      }
      setProductId(response.product_id);

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
          // If we're using the existing images from cloudfront, just proceed without uploading
          // This prevents CORS issues when trying to fetch the images for base64 conversion
          if (initialData.main_image_url && !sideImages.length) {
            // Skip image upload if we're using existing cloudfront images and not adding new side images
            setUploadProgress(100);
            clearInterval(interval);
            setStep(3);
            setTimeout(() => router.push("/admin/products"), 800);
            return;
          }
          
          // If adding new side images only, update just those
          if (sideImages.length > 0) {
            try {
              await productsApi.updateSideImagesOnly(productId || initialData.product_id, sideImages);
            } catch (err) {
              console.error("Failed to update side images:", err);
              throw new Error("Failed to update side images. Please try again.");
            }
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
