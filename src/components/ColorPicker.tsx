interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const presetColors = [
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#ffffff', // White
  '#000000', // Black
];

export function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-lg">
      {presetColors.map(color => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={`w-8 h-8 rounded-full border-2 ${
            currentColor === color ? 'border-gray-800' : 'border-gray-300'
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}

      <input
        type="color"
        value={currentColor}
        onChange={e => onColorChange(e.target.value)}
        className="w-8 h-8 cursor-pointer"
        title="Custom color"
      />
    </div>
  );
}
