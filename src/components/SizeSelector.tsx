import React from 'react';

interface SizeSelectorProps {
  currentSize: number;
  onSizeChange: (size: number) => void;
}

const sizes = [1, 2, 3, 5, 8];

export function SizeSelector({ currentSize, onSizeChange }: SizeSelectorProps) {
  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-lg items-center">
      <span className="text-sm text-gray-600">Size:</span>
      {sizes.map(size => (
        <button
          key={size}
          onClick={() => onSizeChange(size)}
          className={`w-8 h-8 rounded flex items-center justify-center ${
            currentSize === size
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
