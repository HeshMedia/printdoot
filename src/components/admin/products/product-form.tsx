"use client";
// Import core React functions and Next.js router
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js navigation for client-side routing
import { ProductInfoForm } from "@/components/admin/products/new/ProductInfoForm";
import { CustomizationOptions } from "@/components/admin/products/new/CustomizationOptions";
import { ProductImagesForm } from "@/components/admin/products/new/ProductImagesForm";
import { FormButtons } from "@/components/admin/products/new/FormButtons";
import { productsApi } from "@/lib/api/admin/products";

interface ProductFormProps {
  initialData?: any;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: product info, 2: image upload
  const [productId, setProductId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productsApi.getCategories();
        setCategories(data);
      } catch (err) {
        setError("Failed to fetch categories.");
      }
    };
    fetchCategories();
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value),
      });
    } else if (name === "category_id") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value, 10),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      status: e.target.value,
    });
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

  const handleCustomizationChange = (key: string, value: string) => {
    const options = { ...formData.customization_options };
    if (!value.trim()) {
      if (options[key]) {
        delete options[key];
      }
    } else {
      const values = value.split(",").map((v) => v.trim());
      options[key] = values;
    }
    setFormData({
      ...formData,
      customization_options: options,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (initialData) {
        // Update existing product
        response = await productsApi.updateProduct(initialData.product_id, formData);
        setProductId(response.product_id);
      } else {
        // Create new product
        response = await productsApi.createProduct(formData);
        setProductId(response.product_id);
      }
      setStep(2); // Move to image upload step
    } catch (err) {
      setError(initialData ? "Failed to update product." : "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (productId && mainImage) {
      const formData = new FormData();
      formData.append("main_image", mainImage);
      sideImages.forEach((image, index) => {
        formData.append(`side_images[${index}]`, image);
      });

      try {
        await productsApi.uploadProductImages(productId, mainImage, sideImages);
        setStep(3); // Step 3: Image upload success
        // Ensure the router push happens after state update
        setTimeout(() => {
          router.push("/admin/products"); // Redirect after a small delay
        }, 500); // Delay to ensure state updates are applied
      } catch (err) {
        setError("Failed to upload images.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please upload a main image before submitting.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router?.back();
  };

  return (
    <form onSubmit={step === 1 ? handleSubmit : handleImageUpload} className="space-y-6">
      {/* Display error message if exists */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      {/* Step Indicator */}
      <div className="flex justify-between">
        <div className="text-sm">
          <strong>Step {step}:</strong> {step === 1 ? "Product Information" : step === 2 ? "Upload Images" : "Images Uploaded Successfully"}
        </div>
      </div>

      {/* Step 1: Product Information */}
      {step === 1 && (
        <>
          <ProductInfoForm
            formData={formData}
            categories={categories}
            handleInputChange={handleInputChange}
            handleStatusChange={handleStatusChange}
          />
          <CustomizationOptions
            customizationOptions={formData.customization_options}
            handleCustomizationChange={handleCustomizationChange}
            addCustomizationField={() => {}}
            removeCustomizationField={() => {}}
          />
          <FormButtons loading={loading} isEditing={false} handleCancel={handleCancel} />
        </>
      )}

      {/* Step 2: Upload Images */}
      {step === 2 && (
        <>
          <ProductImagesForm
            mainImagePreview={mainImagePreview}
            sideImagePreviews={sideImagePreviews}
            handleMainImageChange={handleMainImageChange}
            handleSideImagesChange={handleSideImagesChange}
            removeSideImage={() => {}}
          />
          <FormButtons loading={loading} isEditing={false} handleCancel={handleCancel} />
        </>
      )}

     {/* Success Message after Product is Created/Updated */}
{step === 1 && productId && (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
    {initialData ? "Product updated successfully!" : "Product created successfully! Your product ID is: "} 
    {!initialData && <strong>{productId}</strong>}
    {initialData ? " You can now update images if needed." : " Now, proceed to upload images."}
  </div>
)}

      {/* Success Message after Images are Uploaded */}
      {step === 3 && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Images uploaded successfully!
        </div>
      )}
    </form>
  );
}
