"use client"
import React from 'react';

interface CustomizationOptionsProps {
  customizationOptions: Record<string, string[]>;
  handleCustomizationChange: (key: string, value: string) => void;
  addCustomizationField: () => void;
  removeCustomizationField: (key: string) => void;
}

export const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({ customizationOptions, handleCustomizationChange, addCustomizationField, removeCustomizationField }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Customization Options</h3>
        <button type="button" onClick={addCustomizationField} className="text-blue-600 hover:text-blue-800 text-sm">
          + Add Option
        </button>
      </div>

      {Object.keys(customizationOptions ?? {}).length === 0 ? (
        <p className="text-gray-500 text-sm">No customization options added yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(customizationOptions ?? {}).map(([key, values]) => (
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
              <button type="button" onClick={() => removeCustomizationField(key)} className="mt-7 text-red-600 hover:text-red-800">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
