import { useState } from 'react';
import CommentSection from './CommentSection';

interface CardProps {
  id: number;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  color?: string;
  onUpdate: (id: number, newTitle: string) => void;
  onDelete: (id: number) => void;
  onColorChange: (id: number, newColor: string) => void;
}

const colorOptions = [
  '#ffffff', // white
  '#fecaca', // light red
  '#fde68a', // light yellow
  '#bbf7d0', // light green
  '#bfdbfe', // light blue
  '#e9d5ff', // light purple
  '#e5e5e5', // light gray
];

function Card({
  id,
  title,
  createdAt,
  updatedAt,
  color = '#ffffff',
  onUpdate,
  onDelete,
  onColorChange,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleBlur = () => {
    if (newTitle !== title) {
      onUpdate(id, newTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleColorChange = (selectedColor: string) => {
    if (selectedColor !== color) {
      onColorChange(id, selectedColor);
    }
  };

  return (
    <div
      className="p-2 rounded shadow hover:shadow-md flex flex-col gap-2 transition-colors"
      style={{ backgroundColor: color }}
    >
      <div className="flex justify-between items-center">
        {isEditing ? (
          <input
            className="border p-1 rounded w-full"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span
            className="flex-grow cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {title}
          </span>
        )}
        <button
          className="ml-2 text-red-500 hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          ✕
        </button>
      </div>

      {(createdAt || updatedAt) && (
        <div className="text-xs text-black">
          {createdAt && <div>Created: {new Date(createdAt).toLocaleString()}</div>}
          {updatedAt && <div>Updated: {new Date(updatedAt).toLocaleString()}</div>}
        </div>
      )}

      <div className="text-sm text-gray-600">Color:</div>
      <div className="flex gap-2 mb-1">
        {colorOptions.map((c) => (
          <button
            key={c}
            aria-label={`Set card color to ${c}`}
            onClick={() => handleColorChange(c)}
            className={`w-5 h-5 rounded-full border border-black ${color === c ? 'ring-2 ring-black' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <CommentSection cardId={id} />
    </div>
  );
}

export default Card;
