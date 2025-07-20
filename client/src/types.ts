
// details of each card, columns and boards
export interface Card {
  id: number;
  title: string;
  columnId: number;
  order: number;
  color?: string;        
  createdAt?: string;   
  updatedAt?: string;    
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
  columns?: Column[]; 
}
