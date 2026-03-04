import {
  AppState,
  AppMode,
  ThemeColors,
  Card,
  Column,
  CARD_ICONS,
  KanbeeData,
  ColorMode,
  CustomTheme,
} from "./types";
import { parseKeypress, isPrintable } from "./input";
import { render, enterAltScreen, leaveAltScreen, hideCursor } from "./renderer";
import {
  getThemeColors,
  getAvailableThemes,
  TerminalName,
  createCustomTheme,
  updateCustomTheme,
  applyColorMode,
  mergeThemeWithOverrides,
  applyColorOverrides,
  getThemePreviewColors,
  exportThemeAsJson,
  importThemeFromJson,
} from "./theme";
import * as storage from "./storage";

// ─── State ────────────────────────────────────────────────────────────────────

let state: AppState;
let theme: ThemeColors;

function initState(data: KanbeeData): void {
  const board = data.boards[0];
  state = {
    mode: "NORMAL",
    board,
    data,
    selectedCol: 0,
    selectedCard: 0,
    promptText: "",
    promptLabel: "",
    promptCallback: null,
    confirmLabel: "",
    confirmCallback: null,
    detailField: 0,
    editingField: false,
    editBuffer: "",
    message: "",
    messageTimeout: null,
    creationStep: 0,
    creationTitle: "",
    themeSelectIndex: 0,
    themeEditorMode: null,
    themeEditorField: 0,
    selectedCustomTheme: null,
    previewThemeIndex: 0,
    previewColorMode: data.settings.colorMode || "auto",
  };
  theme = getThemeColors(data.settings.theme);
  clampSelection();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSortedColumns(): Column[] {
  return [...state.board.columns].sort((a, b) => a.order - b.order);
}

function getCardsInColumn(col: Column): Card[] {
  return state.board.cards.filter((card) => card.columnId === col.id);
}

function clampSelection(): void {
  const cols = getSortedColumns();
  if (cols.length === 0) {
    state.selectedCol = 0;
    state.selectedCard = 0;
    return;
  }
  state.selectedCol = Math.max(0, Math.min(state.selectedCol, cols.length - 1));
  const cards = getCardsInColumn(cols[state.selectedCol]);
  state.selectedCard =
    cards.length > 0
      ? Math.max(0, Math.min(state.selectedCard, cards.length - 1))
      : 0;
}

function showMessage(msg: string): void {
  state.message = msg;
  if (state.messageTimeout) clearTimeout(state.messageTimeout);
  state.messageTimeout = setTimeout(() => {
    state.message = "";
    redraw();
  }, 2500);
}

function selectedCard(): Card | null {
  const cols = getSortedColumns();
  if (cols.length === 0) return null;
  const col = cols[state.selectedCol];
  const cards = getCardsInColumn(col);
  return cards[state.selectedCard] || null;
}

function selectedColumn(): Column | null {
  const cols = getSortedColumns();
  return cols[state.selectedCol] || null;
}

// ─── Prompt Helpers ───────────────────────────────────────────────────────────

function enterPrompt(
  label: string,
  callback: (value: string) => void,
  initial = "",
): void {
  state.mode = "PROMPT";
  state.promptLabel = label;
  state.promptText = initial;
  state.promptCallback = callback;
}

function enterConfirm(label: string, callback: (yes: boolean) => void): void {
  state.mode = "CONFIRM";
  state.confirmLabel = label;
  state.confirmCallback = callback;
}

function exitPrompt(): void {
  state.mode = "NORMAL";
  state.promptText = "";
  state.promptLabel = "";
  state.promptCallback = null;
  state.creationStep = 0;
  state.creationTitle = "";
}

function exitConfirm(): void {
  state.mode = "NORMAL";
  state.confirmLabel = "";
  state.confirmCallback = null;
}

// ─── Key Handlers by Mode ─────────────────────────────────────────────────────

function handleThemeSelectKey(key: string): void {
  const themes = getAvailableThemes();

  switch (key) {
    case "j":
    case "down":
      state.themeSelectIndex = (state.themeSelectIndex + 1) % themes.length;
      break;
    case "k":
    case "up":
      state.themeSelectIndex =
        (state.themeSelectIndex - 1 + themes.length) % themes.length;
      break;
    case "return":
    case " ": {
      const selectedTheme = themes[state.themeSelectIndex];
      state.data.settings.theme = selectedTheme;
      storage.saveData(state.data);
      theme = getThemeColors(selectedTheme);
      state.mode = "NORMAL";
      showMessage(`✓ Theme changed to ${selectedTheme}`);
      break;
    }
    case "c": {
      // Create new custom theme
      const availableThemes = getAvailableThemes();
      state.themeEditorMode = "create";
      state.mode = "THEME_EDITOR";
      enterPrompt("Custom theme name", (name) => {
        if (name.trim()) {
          const selectedTheme = availableThemes[state.themeSelectIndex];
          const newTheme = createCustomTheme(
            name.trim(),
            selectedTheme,
            state.previewColorMode,
          );
          if (!state.data.settings.customThemes) {
            state.data.settings.customThemes = [];
          }
          state.data.settings.customThemes.push(newTheme);
          storage.saveData(state.data);
          state.selectedCustomTheme = newTheme;
          state.themeEditorMode = "edit";
          showMessage(`✓ Theme "${name.trim()}" created`);
        }
        exitPrompt();
      });
      break;
    }
    case "p": {
      // Preview theme
      state.mode = "THEME_PREVIEW";
      state.previewThemeIndex = state.themeSelectIndex;
      break;
    }
    case "escape":
    case "q":
      state.mode = "NORMAL";
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
  }
}

function handleThemeEditorKey(key: string): void {
  switch (key) {
    case "escape":
    case "q":
      state.themeEditorMode = null;
      state.selectedCustomTheme = null;
      state.mode = "NORMAL";
      break;
    case "j":
    case "down":
      state.themeEditorField = (state.themeEditorField + 1) % 10;
      break;
    case "k":
    case "up":
      state.themeEditorField = (state.themeEditorField - 1 + 10) % 10;
      break;
    case "return":
    case "i":
      if (state.selectedCustomTheme) {
        enterPrompt("Color value (hex format #RRGGBB)", (value) => {
          if (state.selectedCustomTheme) {
            const colorFields = [
              "primary",
              "secondary",
              "accent",
              "muted",
              "border",
              "card",
              "highlight",
              "bg",
              "headerBg",
              "statusBg",
            ];
            const field = colorFields[state.themeEditorField];
            if (/^#[0-9a-fA-F]{6}$/.test(value)) {
              state.selectedCustomTheme.colors[field as keyof ThemeColors] =
                value;
              state.selectedCustomTheme = updateCustomTheme(
                state.selectedCustomTheme,
                {},
              );
              const customThemes = state.data.settings.customThemes || [];
              const idx = customThemes.findIndex(
                (t) => t.id === state.selectedCustomTheme?.id,
              );
              if (idx >= 0) {
                customThemes[idx] = state.selectedCustomTheme;
              }
              state.data.settings.customThemes = customThemes;
              storage.saveData(state.data);
              showMessage("✓ Color updated");
            } else {
              showMessage("✗ Invalid hex color format");
            }
          }
          exitPrompt();
        });
      }
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
  }
}

function handleThemePreviewKey(key: string): void {
  const themes = getAvailableThemes();

  switch (key) {
    case "j":
    case "down":
      state.previewThemeIndex = (state.previewThemeIndex + 1) % themes.length;
      break;
    case "k":
    case "up":
      state.previewThemeIndex =
        (state.previewThemeIndex - 1 + themes.length) % themes.length;
      break;
    case "l":
    case "right":
      // Cycle color mode
      const modes: ColorMode[] = ["auto", "light", "dark"];
      const currentIdx = modes.indexOf(state.previewColorMode);
      state.previewColorMode = modes[(currentIdx + 1) % modes.length];
      break;
    case "h":
    case "left":
      // Reverse cycle color mode
      const modes2: ColorMode[] = ["auto", "light", "dark"];
      const currentIdx2 = modes2.indexOf(state.previewColorMode);
      state.previewColorMode =
        modes2[(currentIdx2 - 1 + modes2.length) % modes2.length];
      break;
    case "return":
    case " ": {
      const selectedTheme = themes[state.previewThemeIndex];
      state.data.settings.theme = selectedTheme;
      state.data.settings.colorMode = state.previewColorMode;
      storage.saveData(state.data);
      theme = getThemePreviewColors(selectedTheme, state.previewColorMode);
      state.mode = "NORMAL";
      showMessage(`✓ Theme & mode applied`);
      break;
    case "escape":
    case "q":
      state.mode = "NORMAL";
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
  }
}

function handleNormalKey(key: string): void {
  const cols = getSortedColumns();

  switch (key) {
    // ── Navigation ──
    case "h":
    case "left":
      if (state.selectedCol > 0) {
        state.selectedCol--;
        state.selectedCard = 0;
        clampSelection();
      }
      break;
    case "l":
    case "right":
      if (state.selectedCol < cols.length - 1) {
        state.selectedCol++;
        state.selectedCard = 0;
        clampSelection();
      }
      break;
    case "j":
    case "down": {
      const col = cols[state.selectedCol];
      if (col) {
        const cards = getCardsInColumn(col);
        if (state.selectedCard < cards.length - 1) {
          state.selectedCard++;
        }
      }
      break;
    }
    case "k":
    case "up":
      if (state.selectedCard > 0) {
        state.selectedCard--;
      }
      break;

    // ── Card actions ──
    case "n":
      startCardCreation();
      break;
    case "return": {
      const card = selectedCard();
      if (card) openDetail();
      break;
    }
    case "d": {
      const card = selectedCard();
      if (card) {
        enterConfirm(`Delete "${card.title}"?`, (yes) => {
          if (yes) {
            storage.deleteCard(state.data, state.board.id, card.id);
            clampSelection();
            showMessage("✓ Card deleted");
          }
          exitConfirm();
        });
      }
      break;
    }
    case "m": {
      const card = selectedCard();
      if (card && cols.length > 1) {
        const currentColIdx = cols.findIndex((c) => c.id === card.columnId);
        if (currentColIdx < cols.length - 1) {
          storage.moveCard(
            state.data,
            state.board.id,
            card.id,
            cols[currentColIdx + 1].id,
          );
          state.selectedCol = currentColIdx + 1;
          clampSelection();
          showMessage("→ Moved forward");
        }
      }
      break;
    }
    case "M": {
      const card = selectedCard();
      if (card && cols.length > 1) {
        const currentColIdx = cols.findIndex((c) => c.id === card.columnId);
        if (currentColIdx > 0) {
          storage.moveCard(
            state.data,
            state.board.id,
            card.id,
            cols[currentColIdx - 1].id,
          );
          state.selectedCol = currentColIdx - 1;
          clampSelection();
          showMessage("← Moved back");
        }
      }
      break;
    }

    // ── Column actions ──
    case "A":
      enterPrompt("New column name", (name) => {
        if (name.trim()) {
          storage.addColumn(state.data, state.board.id, name.trim());
          showMessage(`✓ Column "${name.trim()}" added`);
        }
        exitPrompt();
      });
      break;
    case "R": {
      const col = selectedColumn();
      if (col) {
        enterPrompt(
          "Rename column",
          (name) => {
            if (name.trim()) {
              storage.renameColumn(
                state.data,
                state.board.id,
                col.id,
                name.trim(),
              );
              showMessage(`✓ Column renamed to "${name.trim()}"`);
            }
            exitPrompt();
          },
          col.name,
        );
      }
      break;
    }
    case "X": {
      const col = selectedColumn();
      if (col && cols.length > 1) {
        enterConfirm(
          `Delete column "${col.name}"? Cards will move to first column.`,
          (yes) => {
            if (yes) {
              storage.deleteColumn(state.data, state.board.id, col.id);
              state.selectedCol = 0;
              clampSelection();
              showMessage("✓ Column deleted");
            }
            exitConfirm();
          },
        );
      } else if (cols.length <= 1) {
        showMessage("Cannot delete the last column");
      }
      break;
    }

    // ── Settings ──
    case "t":
      state.mode = "THEME_SELECT";
      state.themeSelectIndex = getAvailableThemes().findIndex(
        (t) => t === state.data.settings.theme,
      );
      if (state.themeSelectIndex < 0) state.themeSelectIndex = 0;
      break;

    // ── Quit ──
    case "q":
      cleanup();
      process.exit(0);
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
  }
}

function handleDetailKey(key: string): void {
  switch (key) {
    case "tab":
      state.detailField = (state.detailField + 1) % 3;
      break;
    case "return":
    case "i":
      startFieldEdit();
      break;
    case "escape":
      state.mode = "NORMAL";
      state.detailField = 0;
      break;
    case "q":
      state.mode = "NORMAL";
      state.detailField = 0;
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
  }
}

function handleInsertKey(key: string): void {
  switch (key) {
    case "return":
      saveFieldEdit();
      break;
    case "escape":
      state.editingField = false;
      state.mode = "DETAIL";
      break;
    case "backspace":
      state.editBuffer = state.editBuffer.slice(0, -1);
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
    default:
      if (isPrintable(key)) {
        state.editBuffer += key;
      }
      break;
  }
}

function handlePromptKey(key: string): void {
  switch (key) {
    case "return":
      if (state.promptCallback) {
        state.promptCallback(state.promptText);
      }
      break;
    case "escape":
      exitPrompt();
      break;
    case "backspace":
      state.promptText = state.promptText.slice(0, -1);
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
    default:
      if (isPrintable(key)) {
        state.promptText += key;
      }
      break;
  }
}

function handleConfirmKey(key: string): void {
  switch (key) {
    case "y":
    case "Y":
      if (state.confirmCallback) state.confirmCallback(true);
      break;
    case "n":
    case "N":
    case "escape":
      if (state.confirmCallback) state.confirmCallback(false);
      else exitConfirm();
      break;
    case "C-c":
      cleanup();
      process.exit(0);
      break;
  }
}

// ─── Card Creation ────────────────────────────────────────────────────────────

function startCardCreation(): void {
  state.creationStep = 1;
  enterPrompt("Card title", (title) => {
    if (!title.trim()) {
      exitPrompt();
      return;
    }
    state.creationTitle = title.trim();
    state.creationStep = 2;
    enterPrompt("Description (optional)", (desc) => {
      const cols = getSortedColumns();
      const targetCol = cols[state.selectedCol];
      if (targetCol) {
        storage.addCard(
          state.data,
          state.board.id,
          state.creationTitle,
          desc.trim(),
          targetCol.id,
        );
        clampSelection();
        showMessage(`✓ Card "${state.creationTitle}" created`);
      }
      exitPrompt();
    });
  });
}

// ─── Card Detail ──────────────────────────────────────────────────────────────

function openDetail(): void {
  state.mode = "DETAIL";
  state.detailField = 0;
  state.editingField = false;
}

function startFieldEdit(): void {
  const card = selectedCard();
  if (!card) return;

  state.mode = "INSERT";
  state.editingField = true;

  switch (state.detailField) {
    case 0: // title
      state.editBuffer = card.title;
      break;
    case 1: // description
      state.editBuffer = card.description;
      break;
    case 2: // icon
      state.editBuffer = card.icon || "";
      break;
  }
}

function saveFieldEdit(): void {
  const card = selectedCard();
  if (!card) {
    state.editingField = false;
    state.mode = "DETAIL";
    return;
  }

  const updates: Partial<Pick<Card, "title" | "description" | "icon">> = {};
  switch (state.detailField) {
    case 0:
      if (state.editBuffer.trim()) {
        updates.title = state.editBuffer.trim();
      }
      break;
    case 1:
      updates.description = state.editBuffer;
      break;
    case 2:
      updates.icon = state.editBuffer.trim() || undefined;
      break;
  }

  storage.updateCard(state.data, state.board.id, card.id, updates);
  state.editingField = false;
  state.mode = "DETAIL";
  showMessage("✓ Saved");
}

// ─── Render ───────────────────────────────────────────────────────────────────

function redraw(): void {
  render(state, theme);
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

function cleanup(): void {
  if (state.messageTimeout) clearTimeout(state.messageTimeout);
  leaveAltScreen();
  process.stdin.setRawMode?.(false);
  process.stdin.pause();
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

export async function startTUI(data: KanbeeData): Promise<void> {
  initState(data);

  // Enter alternate screen
  enterAltScreen();
  hideCursor();

  // Handle resize
  process.stdout.on("resize", () => redraw());

  // Handle exit signals
  const onExit = () => {
    cleanup();
    process.exit(0);
  };
  process.on("SIGINT", onExit);
  process.on("SIGTERM", onExit);
  process.on("exit", () => {
    leaveAltScreen();
  });

  // Initial render
  redraw();

  // Raw mode input loop
  process.stdin.setRawMode?.(true);
  process.stdin.resume();

  return new Promise<void>((resolve) => {
    process.stdin.on("data", (buf: Buffer) => {
      const key = parseKeypress(buf);
      if (!key) return;

      switch (state.mode) {
        case "NORMAL":
          handleNormalKey(key);
          break;
        case "DETAIL":
          handleDetailKey(key);
          break;
        case "INSERT":
          handleInsertKey(key);
          break;
        case "PROMPT":
          handlePromptKey(key);
          break;
        case "CONFIRM":
          handleConfirmKey(key);
          break;
        case "THEME_SELECT":
          handleThemeSelectKey(key);
          break;
        case "THEME_EDITOR":
          handleThemeEditorKey(key);
          break;
        case "THEME_PREVIEW":
          handleThemePreviewKey(key);
          break;
      }

      redraw();
    });
  });
}
