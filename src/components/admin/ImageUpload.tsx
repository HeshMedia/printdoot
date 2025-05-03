"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  value: string; // base64 string
  extension: string;
  onChange: (base64: string, extension: string) => void;
  onReset: () => void;
}

export default function ImageUpload({ value, extension, onChange, onReset }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    if (toastRef.current) {
      toastRef.current.innerText = message;
      toastRef.current.classList.remove("hidden");
      setTimeout(() => toastRef.current?.classList.add("hidden"), 3000);
    }
  };

  const handleImage = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) return showToast("Only JPG, PNG, and WEBP files are allowed.");
    if (file.size > maxSize) return showToast("Image size should be under 2MB.");

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      const fileExt = file.name.split(".").pop() || "";
      onChange(base64String, fileExt);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImage(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImage(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>

      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("image-upload")?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 mt-2">Uploading...</p>
          </div>
        ) : value ? (
          <>
            <img
              src={`data:image/${extension};base64,${value}`}
              alt="Preview"
              className="max-w-xs rounded-xl shadow-md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="mt-3 text-sm text-red-600 hover:underline"
            >
              Remove Image
            </button>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 01.88-2.512l.152-.176a4.002 4.002 0 015.655-.152l1.12 1.122a2 2 0 002.828 0l3.536-3.536a4 4 0 015.656 5.656L17 21H5a2 2 0 01-2-2v-4z"
              />
            </svg>
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP up to 2MB</p>
          </>
        )}
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Toast */}
      <div
        ref={toastRef}
        className="hidden mt-2 text-sm text-red-600 transition-opacity duration-300"
      ></div>
    </div>
  );
}
