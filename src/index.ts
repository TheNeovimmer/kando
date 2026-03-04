#!/usr/bin/env node

import chalk from "chalk";
import * as storage from "./storage";
import { startTUI } from "./tui";

async function main() {
  const args = process.argv.slice(2);
  const data = storage.loadData();

  if (args.length === 0) {
    await startTUI(data);
    return;
  }

  const command = args[0];

  switch (command) {
    case "add": {
      const title = args.slice(1).join(" ");
      if (!title) {
        console.log(chalk.red('Usage: kanbee add "Task title"'));
        process.exit(1);
      }
      const board = data.boards[0];
      const card = storage.addCard(data, board.id, title);
      if (card) {
        console.log(chalk.green(`✓ Card added: "${title}"`));
      }
      break;
    }

    case "move": {
      const cardId = args[1];
      const columnId = args[2];
      if (!cardId || !columnId) {
        console.log(chalk.red("Usage: kanbee move <card-id> <column-id>"));
        process.exit(1);
      }
      const success = storage.moveCard(
        data,
        data.boards[0].id,
        cardId,
        columnId,
      );
      if (success) {
        console.log(chalk.green("✓ Card moved"));
      } else {
        console.log(chalk.red("✗ Card not found"));
      }
      break;
    }

    case "list":
    case "ls": {
      console.log(chalk.bold.cyan("\n✦ Kanbee Boards\n"));
      for (const board of data.boards) {
        const total = board.cards.length;
        const cols = board.columns.sort((a, b) => a.order - b.order);
        const lastCol = cols[cols.length - 1];
        const done = lastCol
          ? board.cards.filter((c) => c.columnId === lastCol.id).length
          : 0;
        console.log(
          `  ${chalk.white(board.name)} ${chalk.gray(`(${done}/${total} done)`)}`,
        );
        for (const col of cols) {
          const cards = board.cards.filter((c) => c.columnId === col.id);
          const icon = col.icon || "●";
          console.log(
            `    ${chalk.gray("├─")} ${icon} ${col.name}: ${cards.length}`,
          );
        }
      }
      console.log("");
      break;
    }

    case "view": {
      await startTUI(data);
      break;
    }

    case "boards": {
      console.log(chalk.bold.cyan("\n✦ Your Boards\n"));
      for (const board of data.boards) {
        const total = board.cards.length;
        console.log(
          `  ${chalk.white(board.name)} ${chalk.gray(`(${total} cards, ${board.columns.length} columns)`)}`,
        );
      }
      console.log("");
      break;
    }

    case "create-board": {
      const name = args.slice(1).join(" ");
      if (!name) {
        console.log(chalk.red('Usage: kanbee create-board "Board Name"'));
        process.exit(1);
      }
      storage.createBoard(data, name);
      console.log(chalk.green(`✓ Board "${name}" created`));
      break;
    }

    case "delete": {
      const cardId = args[1];
      if (!cardId) {
        console.log(chalk.red("Usage: kanbee delete <card-id>"));
        process.exit(1);
      }
      const success = storage.deleteCard(data, data.boards[0].id, cardId);
      if (success) {
        console.log(chalk.green("✓ Card deleted"));
      } else {
        console.log(chalk.red("✗ Card not found"));
      }
      break;
    }

    case "add-column": {
      const colName = args.slice(1).join(" ");
      if (!colName) {
        console.log(chalk.red('Usage: kanbee add-column "Column Name"'));
        process.exit(1);
      }
      storage.addColumn(data, data.boards[0].id, colName);
      console.log(chalk.green(`✓ Column "${colName}" added`));
      break;
    }

    case "data-path": {
      console.log(storage.getDataPath());
      break;
    }

    case "help":
    case "--help":
    case "-h":
    default: {
      console.log(`
${chalk.hex("#e0af68")("✦")} ${chalk.bold.hex("#7aa2f7")("Kanbee")} — terminal kanban board

${chalk.bold("Usage:")}
  kanbee                       Launch interactive TUI
  kanbee add "Task"            Add card to first column
  kanbee move <id> <col-id>    Move card to column
  kanbee delete <id>           Delete a card
  kanbee list                  List boards with columns
  kanbee view                  Open TUI board view
  kanbee boards                List all boards
  kanbee create-board "Name"   Create new board
  kanbee add-column "Name"     Add column to current board
  kanbee data-path             Show data file path

${chalk.bold("TUI Keys:")}
  h/j/k/l  Navigate columns and cards
  n        New card (title → description)
  Enter    Open card detail
  Tab      Cycle detail fields
  i/Enter  Edit field inline
  m/M      Move card forward/backward
  d        Delete card
  A        Add column
  R        Rename column
  X        Delete column
  t        Change theme
  q        Quit

${chalk.bold("Theme Selection:")}
  j/k      Navigate themes
  Enter    Apply selected theme
  Esc      Cancel
      `);
      break;
    }
  }
}

main().catch(console.error);
