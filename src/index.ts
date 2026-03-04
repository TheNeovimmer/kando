#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import * as storage from './storage';
import * as tui from './tui';
import { ColumnType } from './types';

async function main() {
  const args = process.argv.slice(2);
  const data = storage.loadData();

  if (args.length === 0) {
    tui.printBanner();
    await tui.mainMenu(data);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'add': {
      const title = args.slice(1).join(' ');
      if (!title) {
        console.log(chalk.red('Usage: kando add "Task title"'));
        process.exit(1);
      }
      const card = storage.addCard(data, data.boards[0].id, title);
      if (card) {
        console.log(chalk.green(`✅ Card added: "${title}"`));
      }
      break;
    }

    case 'move': {
      const cardId = args[1];
      const column = args[2] as ColumnType;
      if (!cardId || !column) {
        console.log(chalk.red('Usage: kando move <card-id> <backlog|in-progress|done>'));
        process.exit(1);
      }
      const success = storage.moveCard(data, data.boards[0].id, cardId, column);
      if (success) {
        console.log(chalk.green('✅ Card moved!'));
      } else {
        console.log(chalk.red('❌ Card not found'));
      }
      break;
    }

    case 'list':
    case 'ls': {
      console.log(chalk.bold.cyan('\n📋 Your Boards:\n'));
      for (const board of data.boards) {
        const total = board.cards.length;
        const done = board.cards.filter(c => c.column === 'done').length;
        console.log(`  ${chalk.white(board.name)} ${chalk.gray(`(${done}/${total} done)`)}`);
        for (const col of ['backlog', 'in-progress', 'done'] as ColumnType[]) {
          const cards = board.cards.filter(c => c.column === col);
          if (cards.length > 0) {
            console.log(`    ${chalk.gray('├─')} ${col}: ${cards.length}`);
          }
        }
      }
      console.log('');
      break;
    }

    case 'board': {
      const boardName = args[1];
      if (!boardName) {
        console.log(chalk.yellow('Usage: kando board <name>'));
        console.log(chalk.gray('Available boards:'));
        data.boards.forEach(b => console.log(`  - ${b.name}`));
        break;
      }
      const board = data.boards.find(b => b.name.toLowerCase() === boardName.toLowerCase());
      if (board) {
        tui.printBanner();
        await tui.mainMenu(data);
      } else {
        console.log(chalk.red(`Board "${boardName}" not found`));
      }
      break;
    }

    case 'view': {
      const board = data.boards[0];
      await tui.viewBoard(data, board);
      break;
    }

    case 'delete': {
      const cardId = args[1];
      if (!cardId) {
        console.log(chalk.red('Usage: kando delete <card-id>'));
        process.exit(1);
      }
      const success = storage.deleteCard(data, data.boards[0].id, cardId);
      if (success) {
        console.log(chalk.green('✅ Card deleted!'));
      } else {
        console.log(chalk.red('❌ Card not found'));
      }
      break;
    }

    case 'boards': {
      await tui.listBoards(data);
      break;
    }

    case 'create-board': {
      const name = args.slice(1).join(' ');
      if (!name) {
        console.log(chalk.red('Usage: kando create-board "Board Name"'));
        process.exit(1);
      }
      storage.createBoard(data, name);
      console.log(chalk.green(`✅ Board "${name}" created!`));
      break;
    }

    case 'push': {
      console.log(chalk.yellow('Pushing to Git...'));
      console.log(chalk.gray('(Configure git remote first: git remote add origin <url>)'));
      break;
    }

    case 'pull': {
      console.log(chalk.yellow('Pulling from Git...'));
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    default: {
      console.log(`
${chalk.cyan('📋 Kando')} - A minimal kanban CLI for developers

${chalk.bold('Usage:')}
  kando                    Start interactive mode
  kando add "Task"          Add card to backlog
  kando move <id> <col>     Move card (backlog/in-progress/done)
  kando delete <id>         Delete a card
  kando list                List boards and cards
  kando view                View current board
  kando boards              List all boards
  kando create-board "Name" Create new board
  kando board <name>        Switch to board
  kando push                Push changes to Git
  kando pull                Pull changes from Git

${chalk.bold('Examples:')}
  kando add "Fix login bug"
  kando move abc123 in-progress
  kando delete xyz789
      `);
      break;
    }
  }
}

main().catch(console.error);
