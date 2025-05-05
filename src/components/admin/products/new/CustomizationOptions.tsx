"use client";
import React from "react";

interface CustomizationOptionsProps {
  customizationOptions: Record<string, string[]>; // e.g., { color: ["Red"], size: ["M"] }
  allowedCustomizations: Record<string, Record<string, string>>; // e.g., { color: { Red: #FF0000 }, size: { M: "36" } }
  handleCustomizationChange: (key: string, values: string[]) => void;
  removeCustomizationField: (key: string) => void;
}

export interface Category {
  id: number;
  name: string;
  image_url: string;
  allowed_customizations: Record<string, Record<string, string>>;
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

      {customizationKeys.map((key) => {
        const valuesObj = allowedCustomizations[key];
        const values = Object.keys(valuesObj);

        return (
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
              {values.map((value) => {
                const isSelected = customizationOptions[key]?.includes(value) ?? false;
                const extraValue = valuesObj[value];

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleOption(key, value)}
                    className={`group relative px-3 py-1 rounded-full text-sm border transition-all duration-200 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                    title={extraValue}
                  >
                    {key === "color" ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: extraValue }}
                        />
                        <span>{value}</span>
                      </div>
                    ) : key === "size" ? (
                      <div className="flex flex-col items-center transition-all duration-200 group-hover:scale-110">
                        <span className="font-medium">{value}</span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {extraValue}
                        </span>
                      </div>
                    ) : (
                      <span>{value}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
