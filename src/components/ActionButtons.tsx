import React from 'react';

interface ActionButtonsProps {
  onCopy: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ActionButtons({ onCopy, onSave, onCancel }: ActionButtonsProps) {
  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-lg">
      <button
        onClick={onCopy}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Copy
      </button>
      
      <button
        onClick={onSave}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Save
      </button>
      
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Cancel
      </button>
    </div>
  );
}