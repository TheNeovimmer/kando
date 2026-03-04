export type ColumnType = 'backlog' | 'in-progress' | 'done';

export interface Stamp {
  by: string;
  at: string;
}

export interface Label {
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  column: ColumnType;
  assignee?: string;
  labels: Label[];
  created: Stamp;
  completed?: Stamp;
}

export interface Board {
  id: string;
  name: string;
  cards: Card[];
  createdAt: string;
}

export interface WorklyData {
  version: string;
  boards: Board[];
  settings: {
    user: string;
    columns: ColumnType[];
  };
}

export const COLUMNS: ColumnType[] = ['backlog', 'in-progress', 'done'];

export const COLUMN_LABELS: Record<ColumnType, string> = {
  'backlog': 'Backlog',
  'in-progress': 'In Progress',
  'done': 'Done'
};

export const LABEL_COLORS = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'
];
