"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductInfoForm } from "@/components/admin/products/new/ProductInfoForm";
import { CustomizationOptions } from "@/components/admin/products/new/CustomizationOptions";
import { ProductImagesForm } from "@/components/admin/products/new/ProductImagesForm";
import { FormButtons } from "@/components/admin/products/new/FormButtons";
import { productsApi } from "@/lib/api/admin/products";
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
    category_id: initialData?.category_id || "",
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
      } catch {
        setError("Failed to fetch categories.");
      }
    };
    fetchCategories();
  }, []);

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
  
  

  const handleAddCustomizationField = () => {
    const updated = { ...formData.customization_options };
    let newKeyIndex = 1;
    let newKey = `option_${newKeyIndex}`;
  
    // Ensure new key doesn't exist yet
    while (updated.hasOwnProperty(newKey)) {
      newKeyIndex++;
      newKey = `option_${newKeyIndex}`;
    }
  
    updated[newKey] = [];
    setFormData({ ...formData, customization_options: updated });
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
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (initialData) {
        response = await productsApi.updateProduct(initialData.product_id, formData);
        setProductId(response.product_id);
      } else {
        response = await productsApi.createProduct(formData);
        setProductId(response.product_id);
      }
      setStep(2);
    } catch (err) {
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

  if (!productId || !mainImage) {
    setError("Main image is required.");
    setLoading(false);
    return;
  }

  try {
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 80) clearInterval(interval);
      else setUploadProgress(progress);
    }, 100);

    if (initialData) {
      await productsApi.updateProductImages(productId, mainImage, sideImages); // 🆕 update
    } else {
      await productsApi.uploadProductImages(productId, mainImage, sideImages); // ✅ upload
    }

    setUploadProgress(100);
    setStep(3);

    setTimeout(() => router.push("/admin/products"), 800);
  } catch (err) {
    setError("Failed to upload images.");
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
            }
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
