import * as fs from 'fs';
import * as path from 'path';
import { KandoData, Board, Card, ColumnType, Stamp, Label } from './types';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'boards.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultData(): KandoData {
  return {
    version: '1.0.0',
    boards: [
      {
        id: generateId(),
        name: 'My Board',
        cards: [],
        createdAt: new Date().toISOString()
      }
    ],
    settings: {
      user: process.env.USER || process.env.USERNAME || 'dev',
      columns: ['backlog', 'in-progress', 'done']
    }
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function loadData(): KandoData {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    const data = getDefaultData();
    saveData(data);
    return data;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: KandoData): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getBoards(data: KandoData): Board[] {
  return data.boards;
}

export function getBoard(data: KandoData, boardId: string): Board | undefined {
  return data.boards.find(b => b.id === boardId);
}

export function createBoard(data: KandoData, name: string): Board {
  const board: Board = {
    id: generateId(),
    name,
    cards: [],
    createdAt: new Date().toISOString()
  };
  data.boards.push(board);
  saveData(data);
  return board;
}

export function deleteBoard(data: KandoData, boardId: string): boolean {
  const index = data.boards.findIndex(b => b.id === boardId);
  if (index !== -1) {
    data.boards.splice(index, 1);
    saveData(data);
    return true;
  }
  return false;
}

export function addCard(
  data: KandoData,
  boardId: string,
  title: string,
  description: string = ''
): Card | null {
  const board = getBoard(data, boardId);
  if (!board) return null;

  const card: Card = {
    id: generateId(),
    title,
    description,
    column: 'backlog',
    labels: [],
    created: {
      by: data.settings.user,
      at: new Date().toISOString()
    }
  };
  board.cards.push(card);
  saveData(data);
  return card;
}

export function moveCard(
  data: KandoData,
  boardId: string,
  cardId: string,
  column: ColumnType
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find(c => c.id === cardId);
  if (!card) return false;

  card.column = column;
  if (column === 'done' && !card.completed) {
    card.completed = {
      by: data.settings.user,
      at: new Date().toISOString()
    };
  } else if (column !== 'done') {
    card.completed = undefined;
  }
  saveData(data);
  return true;
}

export function updateCard(
  data: KandoData,
  boardId: string,
  cardId: string,
  updates: Partial<Pick<Card, 'title' | 'description' | 'assignee'>>
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find(c => c.id === cardId);
  if (!card) return false;

  if (updates.title !== undefined) card.title = updates.title;
  if (updates.description !== undefined) card.description = updates.description;
  if (updates.assignee !== undefined) card.assignee = updates.assignee;
  saveData(data);
  return true;
}

export function deleteCard(
  data: KandoData,
  boardId: string,
  cardId: string
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const index = board.cards.findIndex(c => c.id === cardId);
  if (index !== -1) {
    board.cards.splice(index, 1);
    saveData(data);
    return true;
  }
  return false;
}

export function addLabel(
  data: KandoData,
  boardId: string,
  cardId: string,
  label: Label
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find(c => c.id === cardId);
  if (!card) return false;

  const existing = card.labels.find(l => l.name === label.name);
  if (!existing) {
    card.labels.push(label);
    saveData(data);
  }
  return true;
}

export function removeLabel(
  data: KandoData,
  boardId: string,
  cardId: string,
  labelName: string
): boolean {
  const board = getBoard(data, boardId);
  if (!board) return false;

  const card = board.cards.find(c => c.id === cardId);
  if (!card) return false;

  const index = card.labels.findIndex(l => l.name === labelName);
  if (index !== -1) {
    card.labels.splice(index, 1);
    saveData(data);
    return true;
  }
  return false;
}

export function getDataPath(): string {
  return DATA_FILE;
}
