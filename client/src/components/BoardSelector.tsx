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

  useEffect(() => {
    const fetchBoards = async () => {
      const res = await fetch('http://localhost:3001/api/boards', {
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

  return (
    <div className="mb-4">
      <label className="mr-2 font-medium">Select Board:</label>
      <select
        className="border px-2 py-1 rounded"
        value={selectedBoardId || ''}
        onChange={(e) => setSelectedBoardId(Number(e.target.value))}
      >
        {boards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BoardSelector;
