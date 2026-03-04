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
  columnId: string;
  icon?: string;
  assignee?: string;
  labels: Label[];
  created: Stamp;
  completed?: Stamp;
}

export interface Column {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  cards: Card[];
  createdAt: string;
}

export interface KanbeeData {
  version: string;
  boards: Board[];
  settings: {
    user: string;
    theme?: string;
    showIcons: boolean;
  };
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: "backlog", name: "Backlog", icon: "○", order: 0 },
  { id: "in-progress", name: "In Progress", icon: "◐", order: 1 },
  { id: "done", name: "Done", icon: "●", order: 2 },
];

export const COLUMN_POSITION_ICONS: string[] = [
  "○",
  "◐",
  "●",
  "◇",
  "◈",
  "◆",
  "◎",
  "▣",
  "⬡",
  "✦",
];

export const CARD_ICONS = ["◇", "◈", "◆", "●", "◎", "▣", "⬡", "✦", "⬢", "◉"];

export const LABEL_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
];

export type AppMode =
  | "NORMAL"
  | "INSERT"
  | "DETAIL"
  | "PROMPT"
  | "CONFIRM"
  | "THEME_SELECT";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  border: string;
  card: string;
  highlight: string;
  bg: string;
  headerBg: string;
  statusBg: string;
}

export interface AppState {
  mode: AppMode;
  board: Board;
  data: KanbeeData;
  selectedCol: number;
  selectedCard: number;
  // Prompt state
  promptText: string;
  promptLabel: string;
  promptCallback: ((value: string) => void) | null;
  // Confirm state
  confirmLabel: string;
  confirmCallback: ((yes: boolean) => void) | null;
  // Card detail state
  detailField: number;
  editingField: boolean;
  editBuffer: string;
  // Status message
  message: string;
  messageTimeout: ReturnType<typeof setTimeout> | null;
  // Multi-step card creation
  creationStep: number;
  creationTitle: string;
  // Theme selection state
  themeSelectIndex: number;
}
