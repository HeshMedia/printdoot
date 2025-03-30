"use client";
import React, { useState } from "react";

interface CustomizationOptionsProps {
  customizationOptions: Record<string, string[]>;
  allowedCustomizations: Record<string, string[]>; // 🔹 coming from selected category
  handleCustomizationChange: (key: string, value: string) => void;
  addCustomizationField: () => void;
  removeCustomizationField: (key: string) => void;
}

export const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({
  customizationOptions,
  allowedCustomizations,
  handleCustomizationChange,
  addCustomizationField,
  removeCustomizationField,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleAddFromAllowed = () => {
    if (
      selectedOption &&
      allowedCustomizations[selectedOption] &&
      !customizationOptions.hasOwnProperty(selectedOption)
    ) {
      const values = allowedCustomizations[selectedOption];
      handleCustomizationChange(selectedOption, values.join(", "));
      setSelectedOption("");
    }
  };

  const availableOptions = Object.keys(allowedCustomizations).filter(
    (key) => !customizationOptions.hasOwnProperty(key)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Customization Options</h3>
        <button
          type="button"
          onClick={addCustomizationField}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Manual Option
        </button>
      </div>

      {/* Dropdown for allowed customizations */}
      {availableOptions.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Select from category options</option>
            {availableOptions.map((optionKey) => (
              <option key={optionKey} value={optionKey}>
                {optionKey}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddFromAllowed}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      {/* Existing customization fields */}
      {Object.keys(customizationOptions ?? {}).length === 0 ? (
        <p className="text-gray-500 text-sm">No customization options added yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(customizationOptions).map(([key, values]) => (
            <div key={key} className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                <input
                  type="text"
                  value={values.join(", ")}
                  onChange={(e) => handleCustomizationChange(key, e.target.value)}
                  placeholder="Enter values separated by commas"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCustomizationField(key)}
                className="mt-7 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
