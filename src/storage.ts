import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  KanbeeData,
  Board,
  Card,
  Column,
  Stamp,
  Label,
  DEFAULT_COLUMNS,
} from "./types";

const DATA_DIR = path.join(os.homedir(), ".kanflow");
const DATA_FILE = path.join(DATA_DIR, "data.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ─── Migration ────────────────────────────────────────────────────────────────

function migrateData(raw: any): KanbeeData {
  // Migrate boards without columns array
  if (raw.boards) {
    for (const board of raw.boards) {
      if (!board.columns) {
        board.columns = DEFAULT_COLUMNS.map((c) => ({ ...c }));
      }
      // Migrate cards: rename 'column' → 'columnId'
      if (board.cards) {
        for (const card of board.cards) {
          if ("column" in card && !("columnId" in card)) {
            card.columnId = card.column;
            delete card.column;
          }
          // Ensure labels array exists
          if (!card.labels) card.labels = [];
        }
      }
    }
  }
  // Ensure settings
  if (!raw.settings) {
    raw.settings = {
      user: process.env.USER || "dev",
      showIcons: true,
      colorMode: "auto",
    };
  }
  if (raw.settings.showIcons === undefined) raw.settings.showIcons = true;
  if (raw.settings.colorMode === undefined) raw.settings.colorMode = "auto";
  // Ensure custom themes array
  if (!raw.settings.customThemes) raw.settings.customThemes = [];
  // Remove old settings.columns if present
  delete raw.settings.columns;
  // Update version
  raw.version = "1.1.0";
  return raw as KanbeeData;
}

// ─── Load / Save ──────────────────────────────────────────────────────────────

function getDefaultData(): KanbeeData {
  return {
    version: "1.1.0",
    boards: [
      {
        id: generateId(),
        name: "My Board",
        columns: DEFAULT_COLUMNS.map((c) => ({ ...c })),
        cards: [],
        createdAt: new Date().toISOString(),
      },
    ],
    settings: {
      user: process.env.USER || process.env.USERNAME || "dev",
      showIcons: true,
      colorMode: "auto",
      customThemes: [],
    },
  };
}

export function loadData(): KanbeeData {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    const data = getDefaultData();
    saveData(data);
    return data;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    const raw = JSON.parse(content);
    const data = migrateData(raw);
    saveData(data);
    return data;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: KanbeeData): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ─── Board CRUD ───────────────────────────────────────────────────────────────

export function getBoard(data: KanbeeData, boardId: string): Board | undefined {
  return data.boards.find((b) => b.id === boardId);
}

export function createBoard(data: KanbeeData, name: string): Board {
  const board: Board = {
    id: generateId(),
    name,
    columns: DEFAULT_COLUMNS.map((c) => ({ ...c })),
    cards: [],
    createdAt: new Date().toISOString(),
  };
  data.boards.push(board);
  saveData(data);
  return board;
}

export function deleteBoard(data: KanbeeData, boardId: string): boolean {
  const idx = data.boards.findIndex((b) => b.id === boardId);
  if (idx !== -1) {
    data.boards.splice(idx, 1);
    saveData(data);
    return true;
  }
  return false;
}

// ─── Column CRUD ──────────────────────────────────────────────────────────────

export function addColumn(
  data: KanbeeData,
  boardId: string,
  name: string,
  icon?: string,
): Column | null {
  const board = getBoard(data, boardId);
  if (!board) return null;

  const maxOrder = board.columns.reduce((max, c) => Math.max(max, c.order), -1);
  const col: Column = {
    id: generateId(),
    name,
    icon,
    order: maxOrder + 1,
  };
  board.columns.push(col);
  saveData(data);
  return col;
}

export function renameColumn(
  data: KanbeeData,
  boardId: string,
  columnId: string,
  newName: string,
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const col = board.columns.find((c) => c.id === columnId);
  if (!col) return false;

  col.name = newName;
  saveData(data);
  return true;
}

export function deleteColumn(
  data: KanbeeData,
  boardId: string,
  columnId: string,
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const idx = board.columns.findIndex((c) => c.id === columnId);
  if (idx === -1) return false;

  // Move cards from deleted column to first remaining column
  const remaining = board.columns.filter((c) => c.id !== columnId);
  if (remaining.length > 0) {
    const targetCol = remaining.sort((a, b) => a.order - b.order)[0];
    for (const card of board.cards) {
      if (card.columnId === columnId) {
        card.columnId = targetCol.id;
      }
    }
  } else {
    // Last column — remove all cards
    board.cards = board.cards.filter((c) => c.columnId !== columnId);
  }

  board.columns.splice(idx, 1);
  // Reindex order
  board.columns
    .sort((a, b) => a.order - b.order)
    .forEach((c, i) => (c.order = i));
  saveData(data);
  return true;
}

// ─── Card CRUD ────────────────────────────────────────────────────────────────

export function addCard(
  data: KanbeeData,
  boardId: string,
  title: string,
  description: string = "",
  targetColumnId?: string,
): Card | null {
  const board = getBoard(data, boardId);
  if (!board) return null;

  const cols = board.columns.sort((a, b) => a.order - b.order);
  const colId = targetColumnId || (cols.length > 0 ? cols[0].id : "backlog");

  const card: Card = {
    id: generateId(),
    title,
    description,
    columnId: colId,
    labels: [],
    created: {
      by: data.settings.user,
      at: new Date().toISOString(),
    },
  };
  board.cards.push(card);
  saveData(data);
  return card;
}

export function moveCard(
  data: KanbeeData,
  boardId: string,
  cardId: string,
  columnId: string,
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find((c) => c.id === cardId);
  if (!card) return false;

  // Find if the target column is the last column (for auto-complete)
  const cols = board.columns.sort((a, b) => a.order - b.order);
  const lastCol = cols[cols.length - 1];

  card.columnId = columnId;
  if (lastCol && columnId === lastCol.id && !card.completed) {
    card.completed = { by: data.settings.user, at: new Date().toISOString() };
  } else if (lastCol && columnId !== lastCol.id) {
    card.completed = undefined;
  }
  saveData(data);
  return true;
}

export function updateCard(
  data: KanbeeData,
  boardId: string,
  cardId: string,
  updates: Partial<Pick<Card, "title" | "description" | "assignee" | "icon">>,
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find((c) => c.id === cardId);
  if (!card) return false;

  if (updates.title !== undefined) card.title = updates.title;
  if (updates.description !== undefined) card.description = updates.description;
  if (updates.assignee !== undefined) card.assignee = updates.assignee;
  if (updates.icon !== undefined) card.icon = updates.icon;
  saveData(data);
  return true;
}

export function deleteCard(
  data: KanbeeData,
  boardId: string,
  cardId: string,
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const idx = board.cards.findIndex((c) => c.id === cardId);
  if (idx !== -1) {
    board.cards.splice(idx, 1);
    saveData(data);
    return true;
  }
  return false;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export function addLabel(
  data: KanbeeData,
  boardId: string,
  cardId: string,
  label: Label,
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find((c) => c.id === cardId);
  if (!card) return false;

  if (!card.labels.find((l) => l.name === label.name)) {
    card.labels.push(label);
    saveData(data);
  }
  return true;
}

export function removeLabel(
  data: KanbeeData,
  boardId: string,
  cardId: string,
  labelName: string,
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find((c) => c.id === cardId);
  if (!card) return false;

  const idx = card.labels.findIndex((l) => l.name === labelName);
  if (idx !== -1) {
    card.labels.splice(idx, 1);
    saveData(data);
    return true;
  }
  return false;
}

// ─── Custom Themes ────────────────────────────────────────────────────────────

export function getCustomThemes(data: KanbeeData): any[] {
  return data.settings.customThemes || [];
}

export function addCustomTheme(data: KanbeeData, theme: any): boolean {
  if (!data.settings.customThemes) {
    data.settings.customThemes = [];
  }
  data.settings.customThemes.push(theme);
  saveData(data);
  return true;
}

export function updateCustomTheme(
  data: KanbeeData,
  themeId: string,
  updates: any,
): boolean {
  const customThemes = data.settings.customThemes || [];
  const idx = customThemes.findIndex((t) => t.id === themeId);

  if (idx === -1) return false;

  customThemes[idx] = {
    ...customThemes[idx],
    ...updates,
    modified: new Date().toISOString(),
  };

  data.settings.customThemes = customThemes;
  saveData(data);
  return true;
}

export function deleteCustomTheme(data: KanbeeData, themeId: string): boolean {
  if (!data.settings.customThemes) return false;

  const idx = data.settings.customThemes.findIndex((t) => t.id === themeId);
  if (idx === -1) return false;

  data.settings.customThemes.splice(idx, 1);
  saveData(data);
  return true;
}

export function getCustomThemeById(
  data: KanbeeData,
  themeId: string,
): any | null {
  const customThemes = data.settings.customThemes || [];
  return customThemes.find((t) => t.id === themeId) || null;
}

export function exportCustomTheme(
  data: KanbeeData,
  themeId: string,
): string | null {
  const theme = getCustomThemeById(data, themeId);
  if (!theme) return null;

  return JSON.stringify(
    {
      name: theme.name,
      description: theme.description,
      baseTheme: theme.baseTheme,
      colorMode: theme.colorMode,
      colors: theme.colors,
      overrides: theme.overrides,
    },
    null,
    2,
  );
}

export function importCustomTheme(
  data: KanbeeData,
  jsonStr: string,
): any | null {
  try {
    const parsed = JSON.parse(jsonStr);

    if (!parsed.name || !parsed.colors) {
      return null;
    }

    const theme = {
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: parsed.name,
      description: parsed.description || "",
      baseTheme: parsed.baseTheme || "default",
      colors: {
        primary: parsed.colors.primary || "#7aa2f7",
        secondary: parsed.colors.secondary || "#9ece6a",
        accent: parsed.colors.accent || "#e0af68",
        muted: parsed.colors.muted || "#565f89",
        border: parsed.colors.border || "#3b4261",
        card: parsed.colors.card || "#c0caf5",
        highlight: parsed.colors.highlight || "#7aa2f7",
        bg: parsed.colors.bg || "#1a1b26",
        headerBg: parsed.colors.headerBg || "#24283b",
        statusBg: parsed.colors.statusBg || "#1f2335",
      },
      colorMode: parsed.colorMode || "auto",
      overrides: parsed.overrides || {},
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };

    addCustomTheme(data, theme);
    return theme;
  } catch {
    return null;
  }
}

export function getDataPath(): string {
  return DATA_FILE;
}
