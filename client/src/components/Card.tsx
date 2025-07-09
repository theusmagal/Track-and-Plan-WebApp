import { useState } from 'react';

interface CardProps {
  id: number;
  title: string;
  onUpdate: (id: number, newTitle: string) => void;
}

function Card({ id, title, onUpdate }: CardProps) {
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

  return (
    <div
      className="bg-white p-2 rounded shadow hover:shadow-md cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className="border w-full p-1 rounded"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span>{title}</span>
      )}
    </div>
  );
}

export default Card;
