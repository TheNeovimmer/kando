import chalk from 'chalk';
import { AppState, ThemeColors, COLUMN_POSITION_ICONS, CARD_ICONS, Column, Card } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function visLen(str: string): number {
  return stripAnsi(str).length;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  if (max <= 3) return str.substring(0, max);
  return str.substring(0, max - 1) + '…';
}

function padRight(str: string, width: number, ch = ' '): string {
  const vl = visLen(str);
  if (vl >= width) return str;
  return str + ch.repeat(width - vl);
}

function centerText(str: string, width: number): string {
  const vl = visLen(str);
  if (vl >= width) return str;
  const left = Math.floor((width - vl) / 2);
  return ' '.repeat(left) + str + ' '.repeat(width - vl - left);
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function c(hex: string, text: string): string {
  return chalk.hex(hex)(text);
}

function bg(hexBg: string, hexFg: string, text: string): string {
  return chalk.bgHex(hexBg).hex(hexFg)(text);
}

function dim(text: string, theme: ThemeColors): string {
  return c(theme.muted, text);
}

function getColIcon(col: Column, colIndex: number): string {
  return col.icon || COLUMN_POSITION_ICONS[colIndex % COLUMN_POSITION_ICONS.length] || '●';
}

function getCardIcon(card: Card, col: Column, colIndex: number): string {
  return card.icon || getColIcon(col, colIndex);
}

function getSortedColumns(state: AppState): Column[] {
  return [...state.board.columns].sort((a, b) => a.order - b.order);
}

function getCardsInColumn(state: AppState, col: Column): Card[] {
  return state.board.cards.filter(card => card.columnId === col.id);
}

// ─── Screen primitives ───────────────────────────────────────────────────────

const ESC = '\x1b';
const CSI = `${ESC}[`;

export function enterAltScreen(): void {
  process.stdout.write(`${CSI}?1049h`);
  process.stdout.write(`${CSI}?25l`); // hide cursor
}

export function leaveAltScreen(): void {
  process.stdout.write(`${CSI}?25h`); // show cursor
  process.stdout.write(`${CSI}?1049l`);
}

export function showCursor(): void {
  process.stdout.write(`${CSI}?25h`);
}

export function hideCursor(): void {
  process.stdout.write(`${CSI}?25l`);
}

function moveTo(row: number, col: number): string {
  return `${CSI}${row};${col}H`;
}

function clearScreen(): string {
  return `${CSI}2J${CSI}H`;
}

// ─── Header ───────────────────────────────────────────────────────────────────

function renderHeader(state: AppState, theme: ThemeColors, width: number): string {
  const title = c(theme.accent, '✦') + ' ' + chalk.bold.hex(theme.primary)('KanFlow');
  const boardName = c(theme.card, state.board.name);
  const quitHint = dim('q: quit', theme);

  const rightSide = `${boardName}  ${quitHint}`;
  const rightLen = visLen(rightSide);
  const leftLen = visLen(title);
  const gap = Math.max(1, width - leftLen - rightLen - 2);

  return ' ' + title + ' '.repeat(gap) + rightSide + ' ';
}

// ─── Column Board ─────────────────────────────────────────────────────────────

function renderBoard(state: AppState, theme: ThemeColors, width: number, height: number): string[] {
  const cols = getSortedColumns(state);
  const numCols = cols.length;

  if (numCols === 0) {
    const msg = dim('  No columns. Press A to add one.', theme);
    return [msg, ...Array(Math.max(0, height - 1)).fill('')];
  }

  const colWidth = Math.max(14, Math.floor((width - 1) / numCols));
  const contentHeight = Math.max(1, height);

  // Build each column as array of plain-text lines + styled lines
  const columnBuffers: string[] = [];

  // Row 0: Column headers
  let headerLine = '';
  for (let ci = 0; ci < numCols; ci++) {
    const col = cols[ci];
    const cards = getCardsInColumn(state, col);
    const icon = getColIcon(col, ci);
    const isSelected = ci === state.selectedCol;
    const headerText = `${icon} ${truncate(col.name, colWidth - 8)} (${cards.length})`;
    const padded = truncate(headerText, colWidth - 1).padEnd(colWidth - 1);

    if (isSelected) {
      headerLine += ' ' + chalk.bold.hex(theme.primary)(padded);
    } else {
      headerLine += ' ' + c(theme.muted, padded);
    }
  }
  columnBuffers.push(headerLine);

  // Row 1: Separator
  let sepLine = '';
  for (let ci = 0; ci < numCols; ci++) {
    const isSelected = ci === state.selectedCol;
    const line = '─'.repeat(colWidth - 2);
    sepLine += ' ' + (isSelected ? c(theme.border, line) : dim(line, theme));
  }
  columnBuffers.push(sepLine);

  // Rows 2+: Cards
  // First, find the max card count to determine rows
  const cardsPerCol: Card[][] = cols.map(col => getCardsInColumn(state, col));
  const maxCards = Math.max(1, ...cardsPerCol.map(c => c.length));
  const cardRows = Math.min(maxCards, contentHeight - 2);

  for (let row = 0; row < cardRows; row++) {
    let line = '';
    for (let ci = 0; ci < numCols; ci++) {
      const col = cols[ci];
      const cards = cardsPerCol[ci];

      if (row < cards.length) {
        const card = cards[row];
        const isSelected = ci === state.selectedCol && row === state.selectedCard;
        const icon = getCardIcon(card, col, ci);
        const labelDots = card.labels.length > 0
          ? ' ' + card.labels.map(l => chalk.keyword(l.color)('●')).join('')
          : '';
        const cardText = `${icon} ${truncate(card.title, colWidth - 6 - card.labels.length * 2)}${labelDots}`;
        const padded = cardText.padEnd(colWidth - 1);

        if (isSelected) {
          line += ' ' + bg(theme.highlight, theme.bg, padded.substring(0, colWidth - 1));
        } else {
          line += ' ' + c(theme.card, padded);
        }
      } else if (row === 0 && cards.length === 0) {
        const empty = dim('(empty)', theme);
        line += ' ' + empty.padEnd(colWidth - 1 + (visLen(empty) === 0 ? 0 : empty.length - visLen(empty)));

        // padRight for styled text
        const emptyPadded = padRight(empty, colWidth - 1);
        line = line.substring(0, line.length - empty.padEnd(colWidth - 1 + (empty.length - visLen(empty))).length);
        line += ' ' + emptyPadded;
      } else {
        line += ' ' + ' '.repeat(colWidth - 1);
      }
    }
    columnBuffers.push(line);
  }

  // Fill remaining content height
  const emptyLine = ' '.repeat(width);
  while (columnBuffers.length < contentHeight) {
    columnBuffers.push(emptyLine);
  }

  return columnBuffers;
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

function renderStatusBar(state: AppState, theme: ThemeColors, width: number): string {
  const modeLabels: Record<string, string> = {
    NORMAL: ' NORMAL ',
    INSERT: ' INSERT ',
    DETAIL: ' DETAIL ',
    PROMPT: ' PROMPT ',
    CONFIRM: ' CONFIRM ',
  };

  const modeStr = bg(theme.primary, theme.bg, chalk.bold(modeLabels[state.mode] || ' NORMAL '));

  let hints = '';
  switch (state.mode) {
    case 'NORMAL':
      hints = dim('  hjkl: navigate  n: new  ↵: detail  m/M: move  d: del  A: add col  R: rename  X: del col', theme);
      break;
    case 'DETAIL':
      hints = dim('  Tab: cycle fields  ↵/i: edit  Esc: close', theme);
      break;
    case 'INSERT':
      hints = dim('  type to edit  ↵: save  Esc: cancel', theme);
      break;
    case 'PROMPT':
      hints = dim('  type text  ↵: submit  Esc: cancel', theme);
      break;
    case 'CONFIRM':
      hints = dim('  y: yes  n/Esc: cancel', theme);
      break;
  }

  const msgStr = state.message ? '  ' + c(theme.accent, state.message) : '';

  const content = modeStr + hints + msgStr;
  return padRight(content, width + (content.length - visLen(content)));
}

// ─── Prompt / Confirm ─────────────────────────────────────────────────────────

function renderPrompt(state: AppState, theme: ThemeColors, width: number): string {
  const label = c(theme.accent, state.promptLabel + ': ');
  const text = c(theme.card, state.promptText);
  const cursor = bg(theme.card, theme.bg, ' ');
  return ' ' + label + text + cursor;
}

function renderConfirm(state: AppState, theme: ThemeColors, width: number): string {
  const label = c(theme.accent, state.confirmLabel);
  const hint = dim('  (y/n)', theme);
  return ' ' + label + hint;
}

// ─── Card Detail Overlay ──────────────────────────────────────────────────────

function renderDetailOverlay(state: AppState, theme: ThemeColors, width: number, height: number): string[] {
  const cols = getSortedColumns(state);
  if (cols.length === 0) return [];
  const col = cols[state.selectedCol];
  if (!col) return [];
  const cards = getCardsInColumn(state, col);
  const card = cards[state.selectedCard];
  if (!card) return [];

  const boxWidth = Math.min(60, width - 4);
  const startCol = Math.max(1, Math.floor((width - boxWidth) / 2));

  const icon = getCardIcon(card, col, state.selectedCol);
  const border = c(theme.border, '│');
  const lines: string[] = [];

  // Top border
  lines.push(c(theme.border, '┌' + '─'.repeat(boxWidth - 2) + '┐'));

  // Title
  const titleLabel = state.detailField === 0 ? chalk.bold.hex(theme.primary)('Title') : dim('Title', theme);
  lines.push(border + ' ' + titleLabel + ' '.repeat(boxWidth - 9) + border);

  const titleContent = state.detailField === 0 && state.editingField
    ? c(theme.card, state.editBuffer) + bg(theme.card, theme.bg, ' ')
    : chalk.bold.hex(theme.card)(`${icon} ${truncate(card.title, boxWidth - 6)}`);
  lines.push(border + ' ' + padRight(titleContent, boxWidth - 4) + ' ' + border);

  // Separator
  lines.push(c(theme.border, '├' + '─'.repeat(boxWidth - 2) + '┤'));

  // Description
  const descLabel = state.detailField === 1 ? chalk.bold.hex(theme.primary)('Description') : dim('Description', theme);
  lines.push(border + ' ' + descLabel + ' '.repeat(Math.max(0, boxWidth - 15)) + border);

  const descContent = state.detailField === 1 && state.editingField
    ? c(theme.card, state.editBuffer) + bg(theme.card, theme.bg, ' ')
    : c(theme.card, truncate(card.description || '(none)', boxWidth - 6));
  lines.push(border + ' ' + padRight(descContent, boxWidth - 4) + ' ' + border);

  // Separator
  lines.push(c(theme.border, '├' + '─'.repeat(boxWidth - 2) + '┤'));

  // Icon selector
  const iconLabel = state.detailField === 2 ? chalk.bold.hex(theme.primary)('Icon') : dim('Icon', theme);
  const iconValue = state.detailField === 2 && state.editingField
    ? c(theme.card, state.editBuffer) + bg(theme.card, theme.bg, ' ')
    : c(theme.accent, card.icon || icon);
  const iconAvailable = dim(`  available: ${CARD_ICONS.join(' ')}`, theme);
  lines.push(border + ' ' + iconLabel + ': ' + iconValue + padRight(iconAvailable, Math.max(0, boxWidth - 30 - visLen(iconValue))) + ' ' + border);

  // Separator
  lines.push(c(theme.border, '├' + '─'.repeat(boxWidth - 2) + '┤'));

  // Metadata
  const colName = c(theme.secondary, col.name);
  lines.push(border + ' ' + padRight(`Column: ${colName}`, boxWidth - 4 + (colName.length - visLen(colName))) + ' ' + border);

  if (card.labels.length > 0) {
    const labelStr = card.labels.map(l => chalk.keyword(l.color)(`● ${l.name}`)).join('  ');
    lines.push(border + ' ' + padRight(`Labels: ${labelStr}`, boxWidth - 4 + (labelStr.length - visLen(labelStr))) + ' ' + border);
  }

  const createdAt = new Date(card.created.at).toLocaleDateString();
  const created = dim(`Created ${createdAt} by ${card.created.by}`, theme);
  lines.push(border + ' ' + padRight(created, boxWidth - 4 + (created.length - visLen(created))) + ' ' + border);

  if (card.completed) {
    const doneAt = new Date(card.completed.at).toLocaleDateString();
    const done = c(theme.secondary, `✓ Completed ${doneAt} by ${card.completed.by}`);
    lines.push(border + ' ' + padRight(done, boxWidth - 4 + (done.length - visLen(done))) + ' ' + border);
  }

  // Bottom border
  lines.push(c(theme.border, '└' + '─'.repeat(boxWidth - 2) + '┘'));

  // Center the overlay vertically
  const startRow = Math.max(2, Math.floor((height - lines.length) / 2));
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    output.push(moveTo(startRow + i, startCol) + lines[i]);
  }

  return output;
}

// ─── Full Render ──────────────────────────────────────────────────────────────

export function render(state: AppState, theme: ThemeColors): void {
  const width = process.stdout.columns || 80;
  const height = process.stdout.rows || 24;

  let output = clearScreen();

  // Header (row 1)
  output += moveTo(1, 1) + renderHeader(state, theme, width);

  // Thin separator
  output += moveTo(2, 1) + dim('─'.repeat(width), theme);

  // Board content (rows 3 to height-2)
  const boardHeight = height - 4;
  const boardLines = renderBoard(state, theme, width, boardHeight);
  for (let i = 0; i < boardLines.length && i < boardHeight; i++) {
    output += moveTo(3 + i, 1) + boardLines[i];
  }

  // Prompt/Confirm line (row height-1)
  if (state.mode === 'PROMPT') {
    output += moveTo(height - 1, 1) + renderPrompt(state, theme, width);
  } else if (state.mode === 'CONFIRM') {
    output += moveTo(height - 1, 1) + renderConfirm(state, theme, width);
  } else {
    output += moveTo(height - 1, 1) + ' '.repeat(width);
  }

  // Status bar (row height)
  output += moveTo(height, 1) + renderStatusBar(state, theme, width);

  // Card detail overlay (centered)
  if (state.mode === 'DETAIL' || (state.mode === 'INSERT' && state.detailField >= 0)) {
    const overlay = renderDetailOverlay(state, theme, width, height);
    output += overlay.join('');
  }

  process.stdout.write(output);

  // Show cursor when typing
  if (state.mode === 'PROMPT' || (state.mode === 'INSERT' && state.editingField)) {
    showCursor();
  } else {
    hideCursor();
  }
}
