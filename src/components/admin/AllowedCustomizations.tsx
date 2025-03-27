// components/product/AllowedCustomizations.tsx
"use client"

interface AllowedCustomizationsProps {
  customizations: Record<string, string[]>
  onChange: (key: string, value: string) => void
  onAdd: () => void
  onRemove: (key: string) => void
}

export default function AllowedCustomizations({
  customizations,
  onChange,
  onAdd,
  onRemove,
}: AllowedCustomizationsProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Allowed Customizations</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Field
        </button>
      </div>

      {Object.keys(customizations).length === 0 ? (
        <p className="text-gray-500 text-sm">No customization fields added yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(customizations).map(([key, values]) => (
            <div key={key} className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                <input
                  type="text"
                  value={values.join(", ")}
                  onChange={(e) => onChange(key, e.target.value)}
                  placeholder="Enter values separated by commas"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(key)}
                className="mt-7 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
