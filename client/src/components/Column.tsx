import { useState } from 'react';
import Card from './Card';
import type { Column as ColumnType } from '../types';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface Props {
  column: ColumnType;
  refreshColumns: () => void;
  onLocalCardColorChange: (cardId: number, newColor: string) => void;
}

function Column({ column, refreshColumns, onLocalCardColorChange }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

  const updateCardTitle = async (cardId: number, newTitle: string) => {
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      refreshColumns();
    } catch (err) {
      console.error('Error updating card title:', err);
    }
  };

  const updateCardColor = async (cardId: number, newColor: string) => {
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ color: newColor }),
      });
      onLocalCardColorChange(cardId, newColor); // update immediately
    } catch (err) {
      console.error('Error updating card color:', err);
    }
  };

  const deleteCard = async (cardId: number) => {
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      refreshColumns();
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const createCard = async () => {
    if (!newTitle.trim()) return;

    try {
      await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: newTitle,
          columnId: column.id,
          order: column.cards.length,
        }),
      });

      setNewTitle('');
      refreshColumns();
    } catch (err) {
      console.error('Error creating card:', err);
    }
  };

  const updateColumnTitle = async () => {
    if (editedTitle !== column.title) {
      try {
        await fetch(`/api/columns/${column.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ title: editedTitle }),
        });
        refreshColumns();
      } catch (err) {
        console.error('Error updating column title:', err);
      }
    }
    setIsEditingTitle(false);
  };

  const deleteColumn = async () => {
    const confirmed = confirm('Delete this column and all its cards?');
    if (!confirmed) return;

    try {
      await fetch(`/api/columns/${column.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      refreshColumns();
    } catch (err) {
      console.error('Error deleting column:', err);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow w-64 border border-gray-400">
      <div className="flex justify-between items-center mb-2">
        {isEditingTitle ? (
          <input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={updateColumnTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                updateColumnTitle();
              }
            }}
            autoFocus
            className="border w-full p-1 rounded"
          />
        ) : (
          <h2
            className="text-xl font-semibold cursor-pointer"
            onClick={() => setIsEditingTitle(true)}
          >
            {column.title}
          </h2>
        )}
        <button
          onClick={deleteColumn}
          className="text-red-500 text-sm hover:underline ml-2"
        >
          ✕
        </button>
      </div>

      <Droppable droppableId={column.id.toString()}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 min-h-[50px] mb-4"
          >
            {column.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card
                      id={card.id}
                      title={card.title}
                      createdAt={card.createdAt}
                      updatedAt={card.updatedAt}
                      color={card.color}
                      onUpdate={updateCardTitle}
                      onDelete={deleteCard}
                      onColorChange={updateCardColor}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border w-full p-1 rounded mb-2"
          placeholder="New task..."
        />
        <button
          onClick={createCard}
          className="bg-blue-500 text-white px-2 py-1 rounded w-full hover:bg-blue-600"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default Column;
