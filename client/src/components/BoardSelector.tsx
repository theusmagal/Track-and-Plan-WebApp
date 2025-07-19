import { useEffect, useState } from 'react';

interface Board {
  id: number;
  title: string;
}

interface Props {
  selectedBoardId: number | null;
  setSelectedBoardId: (id: number) => void;
}

function BoardSelector({ selectedBoardId, setSelectedBoardId }: Props) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      const res = await fetch('/api/boards', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setBoards(data);
      if (!selectedBoardId && data.length > 0) {
        setSelectedBoardId(data[0].id);
      }
    };

    fetchBoards();
  }, []);

  const handleTitleClick = (board: Board) => {
    setEditingBoardId(board.id);
    setEditedTitle(board.title);
  };

  const handleTitleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;

    try {
      await fetch(`/api/boards/${editingBoardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title: editedTitle }),
      });

      const updatedBoards = boards.map((board) =>
        board.id === editingBoardId ? { ...board, title: editedTitle } : board
      );

      setBoards(updatedBoards);
      setEditingBoardId(null);
    } catch (err) {
      console.error('Failed to update board title:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="board" className="text-base font-semibold">
        Select Board:
      </label>
      <select
        id="board"
        className="border px-3 py-1 rounded min-w-[160px]"
        value={selectedBoardId ?? ''}
        onChange={(e) => setSelectedBoardId(Number(e.target.value))}
      >
        {boards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.title}
          </option>
        ))}
      </select>

      {selectedBoardId && (
        <div>
          {editingBoardId === selectedBoardId ? (
            <form onSubmit={handleTitleChange} className="flex gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <button type="submit" className="text-sm text-blue-600 hover:underline">
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() =>
                handleTitleClick(boards.find((b) => b.id === selectedBoardId)!)
              }
              className="text-sm text-gray-600 hover:underline"
            >
              ✏️ Rename Board
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default BoardSelector;
