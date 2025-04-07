"use client";

import { useState } from "react";
import {
  categoriesApi,
  UserCustomizationOption,
} from "@/lib/api/admin/categories";
import CategoryNameInput from "./CategoryNameInput";
import UserCustomizationOptions from "./UserCustomizationOptions";
import AllowedCustomizations from "./AllowedCustomizations";
import SubmitCancelButtons from "./SubmitCancelButtons";
import ImageUpload from "./ImageUpload";

interface CategoryFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSubmit: (category: any) => void;
  onCancel: () => void;
}

export default function CategoryForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    allowed_customizations: initialData?.allowed_customizations || {},
    user_customization_options: initialData?.user_customization_options || [],
    image: "",
    image_extension: "",
  });

  const customizationOptions: UserCustomizationOption[] = [
    "text",
    "image",
    "color",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomizationOptionChange = (option: UserCustomizationOption) => {
    setFormData((prev) => {
      const currentOptions = [...prev.user_customization_options];
      if (currentOptions.includes(option)) {
        return {
          ...prev,
          user_customization_options: currentOptions.filter(
            (opt) => opt !== option
          ),
        };
      } else {
        return {
          ...prev,
          user_customization_options: [...currentOptions, option],
        };
      }
    });
  };

  const handleCustomizationChange = (key: string, value: string) => {
    const updated = { ...formData.allowed_customizations };
    if (!value.trim()) {
      delete updated[key];
    } else {
      updated[key] = value.split(",").map((v) => v.trim());
    }
    setFormData((prev) => ({
      ...prev,
      allowed_customizations: updated,
    }));
  };

  const addCustomizationField = () => {
    const key = prompt("Enter customization field name:");
    if (key && key.trim() && !formData.allowed_customizations?.[key]) {
      setFormData((prev) => ({
        ...prev,
        allowed_customizations: {
          ...prev.allowed_customizations,
          [key]: [],
        },
      }));
    }
  };

  const removeCustomizationField = (key: string) => {
    const updated = { ...formData.allowed_customizations };
    delete updated[key];
    setFormData((prev) => ({
      ...prev,
      allowed_customizations: updated,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      const extension = file.name.split(".").pop() || "";

      setFormData((prev) => ({
        ...prev,
        image: base64String,
        image_extension: extension,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: any;

      if (isEditing && initialData) {
        result = await categoriesApi.updateCategory(initialData.id, formData);
      } else {
        result = await categoriesApi.createCategory(formData);
      }

      onSubmit(result);
    } catch (err) {
      console.error("Failed to save category:", err);
      setError(
        "Failed to save category. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <CategoryNameInput value={formData.name} onChange={handleInputChange} />

      <UserCustomizationOptions
        options={customizationOptions}
        selectedOptions={formData.user_customization_options}
        onChange={handleCustomizationOptionChange}
      />

      <AllowedCustomizations
        customizations={formData.allowed_customizations}
        onChange={handleCustomizationChange}
        onAdd={addCustomizationField}
        onRemove={removeCustomizationField}
      />
      <ImageUpload
        value={formData.image}
        extension={formData.image_extension}
        onChange={(base64, ext) =>
          setFormData((prev) => ({
            ...prev,
            image: base64,
            image_extension: ext,
          }))
        }
        onReset={() =>
          setFormData((prev) => ({ ...prev, image: "", image_extension: "" }))
        }
      />

      <SubmitCancelButtons
        onCancel={onCancel}
        onSubmit={() =>
          handleSubmit({
            preventDefault: () => {},
          } as React.FormEvent<HTMLFormElement>)
        }
        loading={loading}
        isEditing={isEditing}
        isFormInvalid={formData.user_customization_options.length === 0}
      />
    </form>
  );
}
