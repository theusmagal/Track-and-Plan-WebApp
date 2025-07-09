export interface Card {
  id: number;
  title: string;
  columnId: number;
  order: number;
  createdAt: string;
}

export interface Column {
  id: number;
  title: string;
  boardId: number;
  order: number;
  cards: Card[];
}
