"use client"
import React from 'react';

interface FormButtonsProps {
  loading: boolean;
  isEditing: boolean;
  handleCancel: () => void;
}

export const FormButtons: React.FC<FormButtonsProps> = ({ loading, isEditing, handleCancel }) => {
  return (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={handleCancel}
        className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
      </button>
    </div>
  );
};