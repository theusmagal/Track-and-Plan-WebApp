export interface Card {
  id: number;
  title: string;
  columnId: number;
  order: number;
  color?: string;        // ✅ Added this line
  createdAt?: string;    // ✅ Already included
  updatedAt?: string;    // ✅ Already included
}

export interface Column {
  id: number;
  title: string;
  boardId: number;
  order: number;
  cards: Card[];
}

export interface Board {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  columns?: Column[]; // Optional, used when fetched with include: { columns: true }
}
