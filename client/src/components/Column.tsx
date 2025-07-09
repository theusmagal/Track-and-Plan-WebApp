import Card from './Card';
import type { Column as ColumnType } from '../types';
import { Droppable, Draggable } from '@hello-pangea/dnd';


interface Props {
  column: ColumnType;
  refreshColumns: () => void;
}

function Column({ column, refreshColumns }: Props) {
  const updateCardTitle = async (cardId: number, newTitle: string) => {
    try {
      await fetch(`http://localhost:3001/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      refreshColumns(); // Refresh after update
    } catch (err) {
      console.error('Error updating card:', err);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow w-64">
      <h2 className="text-xl font-semibold mb-2">{column.title}</h2>
      <Droppable droppableId={column.id.toString()}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 min-h-[50px]"
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
                      onUpdate={updateCardTitle}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Column;
