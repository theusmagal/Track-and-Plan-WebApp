import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Used to redirect user
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import Column from '../components/Column';
import BoardSelector from '../components/BoardSelector';
import type { Column as ColumnType } from '../types';

function Dashboard() {
  //state to hold columns, selected board, and input fields
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const navigate = useNavigate(); 

  //redirect to login page if token is missing
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); //redirect if not authenticated
    }
  }, [navigate]);

  //fetch boards on first load
  useEffect(() => {
    fetchBoards();
  }, []);

  //Fetch columns whenever selected board changes
  useEffect(() => {
    fetchColumns();
  }, [selectedBoardId]);

  //get all boards from the API
  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.length > 0) {
        setSelectedBoardId(data[0].id); 
      }
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  };

  // Get columns for the selected board
  const fetchColumns = async () => {
    if (!selectedBoardId) return;
    try {
      const res = await fetch(`/api/columns/${selectedBoardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setColumns(data);
    } catch (err) {
      console.error('Error fetching columns:', err);
    }
  };

  //create a new column in the selected board
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || selectedBoardId === null) return;
    try {
      await fetch('/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: newColumnTitle,
          boardId: selectedBoardId,
          order: columns.length,
        }),
      });
      setNewColumnTitle('');
      fetchColumns();
    } catch (err) {
      console.error('Error adding column:', err);
    }
  };

  //create a new board and select it
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title: newBoardTitle }),
      });
      const board = await res.json();
      setSelectedBoardId(board.id);
      setNewBoardTitle('');
      window.location.reload(); 
    } catch (err) {
      console.error('Error creating board:', err);
    }
  };

  //delete selected board
  const handleDeleteBoard = async () => {
    if (!selectedBoardId || !confirm('Are you sure you want to delete this board?')) return;
    try {
      await fetch(`/api/boards/${selectedBoardId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSelectedBoardId(null);
      setColumns([]);
      window.location.reload(); 
    } catch (err) {
      console.error('Error deleting board:', err);
    }
  };

  //handle drag and drop for both columns and cards
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === 'column') {
      const reordered = Array.from(columns);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setColumns(reordered);

      //update column order in DB
      await fetch('/api/columns/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          columns: reordered.map((col, index) => ({ id: col.id, order: index })),
        }),
      });

      return;
    }

    //dragging cards betweem columns
    const sourceColId = Number(source.droppableId);
    const destColId = Number(destination.droppableId);
    const sourceCol = columns.find((c) => c.id === sourceColId);
    const destCol = columns.find((c) => c.id === destColId);
    if (!sourceCol || !destCol) return;

    const sourceCards = [...sourceCol.cards];
    const destCards = sourceColId === destColId ? sourceCards : [...destCol.cards];

    const [movedCard] = sourceCards.splice(source.index, 1);
    movedCard.columnId = destColId;
    destCards.splice(destination.index, 0, movedCard);

    const newColumns = columns.map((col) => {
      if (col.id === sourceColId) return { ...col, cards: sourceColId === destColId ? destCards : sourceCards };
      if (col.id === destColId) return { ...col, cards: destCards };
      return col;
    });

    setColumns(newColumns);

    //send card order updates to backend
    const updates = newColumns.flatMap((col) =>
      col.cards.map((card, index) => ({
        id: card.id,
        columnId: col.id,
        order: index,
      }))
    );

    await fetch('/api/cards/reorder', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ cards: updates }),
    });
  };

  //update card color
  const onLocalCardColorChange = (cardId: number, newColor: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, color: newColor } : card
        ),
      }))
    );
  };

  // ---------- UI ----------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <span role="img" aria-label="clipboard">📋</span> Activities
      </h1>

      {/* board selection and deletion */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <BoardSelector selectedBoardId={selectedBoardId} setSelectedBoardId={setSelectedBoardId} />
        <button onClick={handleDeleteBoard} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Delete Board
        </button>
      </div>

      {/*new board input */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="New board title"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button onClick={handleCreateBoard} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
          Add Board
        </button>
      </div>

      {/*empty state */}
      {!selectedBoardId && (
        <div className="text-center text-gray-500 mt-10">
          Please select or create a board to get started.
        </div>
      )}

      {/*main board */}
      {selectedBoardId && (
        <>
          {/* add new column */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="New column title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={handleAddColumn}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Column
            </button>
          </div>

          {/* drag-and-drop board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns" direction="horizontal" type="column">
              {(provided) => (
                <div
                  className="flex gap-4 overflow-x-auto pb-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {columns.map((col, index) => (
                    <Draggable draggableId={`column-${col.id}`} index={index} key={col.id}>
                      {(provided) => (
                        <div className="min-w-[260px]" ref={provided.innerRef} {...provided.draggableProps}>
                          <div {...provided.dragHandleProps}>
                            <Column
                              column={col}
                              refreshColumns={fetchColumns}
                              onLocalCardColorChange={onLocalCardColorChange}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </div>
  );
}

export default Dashboard;
