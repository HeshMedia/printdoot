"use client";
import React from "react";

interface CustomizationOptionsProps {
  customizationOptions: Record<string, string[]>; // e.g., { color: ["RED"], size: ["M"] }
  allowedCustomizations: Record<string, string[]>; // e.g., { color: ["RED", "BLUE"], size: ["S", "M", "L"] }
  handleCustomizationChange: (key: string, values: string[]) => void;
  removeCustomizationField: (key: string) => void;
}

export const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({
  customizationOptions,
  allowedCustomizations,
  handleCustomizationChange,
  removeCustomizationField,
}) => {
  const toggleOption = (key: string, value: string) => {
    const existing = customizationOptions[key] || [];
    const isSelected = existing.includes(value);
    const updated = isSelected
      ? existing.filter((v) => v !== value)
      : [...existing, value];

    handleCustomizationChange(key, updated);
  };

  const customizationKeys = Object.keys(allowedCustomizations || {});

  if (customizationKeys.length === 0) {
    return <p className="text-gray-500 italic">No customization options available for this category.</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-medium">Customization Options</h3>

      {customizationKeys.map((key) => (
        <div key={key}>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-700 capitalize">{key}</label>
            {customizationOptions[key]?.length > 0 && (
              <button
                type="button"
                onClick={() => removeCustomizationField(key)}
                className="text-red-500 text-sm"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {allowedCustomizations[key].map((value) => {
              const isSelected = customizationOptions[key]?.includes(value) ?? false;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleOption(key, value)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
