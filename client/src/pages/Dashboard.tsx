import { useEffect, useState } from 'react';
import Column from '../components/Column';
import BoardSelector from '../components/BoardSelector';
import type { Column as ColumnType } from '../types';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';


function Dashboard() {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);

  const fetchColumns = async (boardId: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/columns/${boardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      setColumns(data);
      console.log('Fetched columns:', data);
    } catch (err) {
      console.error('Error fetching columns:', err);
    }
  };

  useEffect(() => {
    if (selectedBoardId) {
      fetchColumns(selectedBoardId);
    }
  }, [selectedBoardId]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColIndex = columns.findIndex(col => col.id.toString() === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id.toString() === destination.droppableId);

    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];

    const draggedCard = sourceCol.cards[source.index];

    // Remove from source
    const newSourceCards = [...sourceCol.cards];
    newSourceCards.splice(source.index, 1);

    // Add to destination
    const newDestCards = [...destCol.cards];
    newDestCards.splice(destination.index, 0, draggedCard);

    // Update state optimistically
    const newCols = [...columns];
    newCols[sourceColIndex] = { ...sourceCol, cards: newSourceCards };
    newCols[destColIndex] = { ...destCol, cards: newDestCards };
    setColumns(newCols);

    // Call backend to update
    try {
      await fetch('http://localhost:3001/api/cards/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cards: newDestCards.map((card, index) => ({
            id: card.id,
            order: index,
            columnId: destCol.id,
          })),
        }),
      });
    } catch (err) {
      console.error('Failed to update card order:', err);
      fetchColumns(selectedBoardId!); // fallback
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📋 My Kanban Board</h1>
      <BoardSelector
        selectedBoardId={selectedBoardId}
        setSelectedBoardId={setSelectedBoardId}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-auto">
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              refreshColumns={() => {
                if (selectedBoardId) fetchColumns(selectedBoardId);
              }}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Dashboard;
