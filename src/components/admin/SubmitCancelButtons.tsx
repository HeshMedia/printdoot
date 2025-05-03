// components/product/SubmitCancelButtons.tsx
"use client"

interface SubmitCancelButtonsProps {
  onCancel: () => void
  onSubmit: () => void
  loading: boolean
  isEditing: boolean
  isFormInvalid: boolean
}

export default function SubmitCancelButtons({
  onCancel,
  onSubmit,
  loading,
  isEditing,
  isFormInvalid,
}: SubmitCancelButtonsProps) {
  return (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading || isFormInvalid}
        onClick={onSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
      </button>
    </div>
  )
}
