import chalk from 'chalk';
import boxen from 'boxen';
import inquirer from 'inquirer';
import { WorklyData, Board, Card, ColumnType, COLUMN_LABELS, Label, LABEL_COLORS } from './types';
import * as storage from './storage';

export async function mainMenu(data: WorklyData): Promise<void> {
  while (true) {
    const currentBoard = data.boards[0];
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `📋 ${chalk.bold(currentBoard.name)}`,
        choices: [
          { name: 'View Board', value: 'view' },
          { name: 'Add Card', value: 'add' },
          { name: 'Move Card', value: 'move' },
          { name: 'Edit Card', value: 'edit' },
          { name: 'Delete Card', value: 'delete' },
          { name: 'Add Label', value: 'label' },
          { name: 'List Boards', value: 'boards' },
          { name: 'Create Board', value: 'create-board' },
          { name: 'Push to Git', value: 'push' },
          { name: 'Pull from Git', value: 'pull' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (answer.action) {
      case 'view':
        await viewBoard(data, currentBoard);
        break;
      case 'add':
        await addCardPrompt(data, currentBoard);
        break;
      case 'move':
        await moveCardPrompt(data, currentBoard);
        break;
      case 'edit':
        await editCardPrompt(data, currentBoard);
        break;
      case 'delete':
        await deleteCardPrompt(data, currentBoard);
        break;
      case 'label':
        await labelCardPrompt(data, currentBoard);
        break;
      case 'boards':
        await listBoards(data);
        break;
      case 'create-board':
        await createBoardPrompt(data);
        break;
      case 'push':
        console.log(chalk.green('💨 Pushing to Git...'));
        break;
      case 'pull':
        console.log(chalk.green('📥 Pulling from Git...'));
        break;
      case 'exit':
        console.log(chalk.gray('👋 Bye!'));
        return;
    }
  }
}

export async function viewBoard(data: WorklyData, board: Board): Promise<void> {
  console.log('\n');
  const cols: ColumnType[] = ['backlog', 'in-progress', 'done'];
  
  for (const col of cols) {
    const cards = board.cards.filter(c => c.column === col);
    console.log(chalk.bold.cyan(`\n📌 ${COLUMN_LABELS[col]} (${cards.length})`));
    console.log(chalk.gray('─'.repeat(40)));
    
    if (cards.length === 0) {
      console.log(chalk.gray('  (empty)'));
    } else {
      for (const card of cards) {
        printCard(card, data.settings.user);
      }
    }
  }
  console.log('\n');
}

function printCard(card: Card, currentUser: string): void {
  const labels = card.labels.map(l => chalk.keyword(l.color)(`● ${l.name}`)).join(' ');
  const assignee = card.assignee ? chalk.yellow(`@${card.assignee}`) : '';
  const completed = card.completed ? chalk.green('✓') : '○';
  
  let line = `  ${completed} ${chalk.white(card.title)}`;
  if (assignee) line += ` ${assignee}`;
  if (labels) line += ` ${labels}`;
  
  console.log(line);
  
  if (card.description) {
    const desc = card.description.length > 50 
      ? card.description.substring(0, 47) + '...'
      : card.description;
    console.log(chalk.gray(`     └─ ${desc}`));
  }
  
  const createdBy = card.created.by === currentUser ? 'you' : card.created.by;
  const createdAt = new Date(card.created.at).toLocaleDateString();
  const stamp = `     created ${createdAt} by ${createdBy}`;
  console.log(chalk.gray(stamp));
  
  if (card.completed) {
    const doneBy = card.completed.by === currentUser ? 'you' : card.completed.by;
    const doneAt = new Date(card.completed.at).toLocaleDateString();
    console.log(chalk.green(`     ✓ completed ${doneAt} by ${doneBy}`));
  }
}

export async function addCardPrompt(data: WorklyData, board: Board): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Card title:',
      validate: (input) => input.trim().length > 0 || 'Title is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):'
    },
    {
      type: 'input',
      name: 'assignee',
      message: 'Assignee (optional):'
    }
  ]);

  const card = storage.addCard(data, board.id, answers.title, answers.description);
  if (card && answers.assignee) {
    storage.updateCard(data, board.id, card.id, { assignee: answers.assignee });
  }
  console.log(chalk.green(`✅ Card added: "${answers.title}"`));
}

export async function moveCardPrompt(data: WorklyData, board: Board): Promise<void> {
  const cards = board.cards;
  if (cards.length === 0) {
    console.log(chalk.yellow('No cards to move.'));
    return;
  }

  const choices = cards.map(c => ({
    name: `${c.title} (${COLUMN_LABELS[c.column]})`,
    value: c.id
  }));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'cardId',
      message: 'Select card:',
      choices
    },
    {
      type: 'list',
      name: 'column',
      message: 'Move to:',
      choices: [
        { name: 'Backlog', value: 'backlog' },
        { name: 'In Progress', value: 'in-progress' },
        { name: 'Done', value: 'done' }
      ]
    }
  ]);

  storage.moveCard(data, board.id, answers.cardId, answers.column);
  console.log(chalk.green('✅ Card moved!'));
}

export async function editCardPrompt(data: WorklyData, board: Board): Promise<void> {
  const cards = board.cards;
  if (cards.length === 0) {
    console.log(chalk.yellow('No cards to edit.'));
    return;
  }

  const choices = cards.map(c => ({ name: c.title, value: c.id }));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'cardId',
      message: 'Select card:',
      choices
    },
    {
      type: 'input',
      name: 'title',
      message: 'New title:'
    },
    {
      type: 'input',
      name: 'description',
      message: 'New description:'
    },
    {
      type: 'input',
      name: 'assignee',
      message: 'Assignee:'
    }
  ]);

  storage.updateCard(data, board.id, answers.cardId, {
    title: answers.title || undefined,
    description: answers.description || undefined,
    assignee: answers.assignee || undefined
  });
  console.log(chalk.green('✅ Card updated!'));
}

export async function deleteCardPrompt(data: WorklyData, board: Board): Promise<void> {
  const cards = board.cards;
  if (cards.length === 0) {
    console.log(chalk.yellow('No cards to delete.'));
    return;
  }

  const choices = cards.map(c => ({ name: c.title, value: c.id }));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'cardId',
      message: 'Delete card:',
      choices
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?',
      default: false
    }
  ]);

  if (answers.confirm) {
    storage.deleteCard(data, board.id, answers.cardId);
    console.log(chalk.green('✅ Card deleted!'));
  }
}

export async function labelCardPrompt(data: WorklyData, board: Board): Promise<void> {
  const cards = board.cards;
  if (cards.length === 0) {
    console.log(chalk.yellow('No cards to label.'));
    return;
  }

  const choices = cards.map(c => ({ name: c.title, value: c.id }));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'cardId',
      message: 'Select card:',
      choices
    },
    {
      type: 'list',
      name: 'action',
      message: 'Action:',
      choices: [
        { name: 'Add Label', value: 'add' },
        { name: 'Remove Label', value: 'remove' }
      ]
    }
  ]);

  if (answers.action === 'add') {
    const labelAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Label name:',
        validate: (input) => input.trim().length > 0 || 'Name is required'
      },
      {
        type: 'list',
        name: 'color',
        message: 'Color:',
        choices: LABEL_COLORS.map(c => ({ name: c, value: c }))
      }
    ]);

    storage.addLabel(data, board.id, answers.cardId, {
      name: labelAnswers.name,
      color: labelAnswers.color
    });
    console.log(chalk.green(`✅ Label "${labelAnswers.name}" added!`));
  } else {
    const card = board.cards.find(c => c.id === answers.cardId);
    if (!card || card.labels.length === 0) {
      console.log(chalk.yellow('No labels to remove.'));
      return;
    }

    const labelChoices = card.labels.map(l => ({ name: `${l.name} (${l.color})`, value: l.name }));
    const labelAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: 'Remove label:',
        choices: labelChoices
      }
    ]);

    storage.removeLabel(data, board.id, answers.cardId, labelAnswer.name);
    console.log(chalk.green('✅ Label removed!'));
  }
}

export async function listBoards(data: WorklyData): Promise<void> {
  console.log(chalk.bold.cyan('\n📋 Your Boards:\n'));
  for (const board of data.boards) {
    const total = board.cards.length;
    const done = board.cards.filter(c => c.column === 'done').length;
    console.log(`  ${chalk.white(board.name)} ${chalk.gray(`(${done}/${total} done)`)}`);
  }
  console.log('');
}

export async function createBoardPrompt(data: WorklyData): Promise<void> {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Board name:',
      validate: (input) => input.trim().length > 0 || 'Name is required'
    }
  ]);

  storage.createBoard(data, answer.name);
  console.log(chalk.green(`✅ Board "${answer.name}" created!`));
}

export function printBanner(): void {
  const banner = boxen(
    chalk.cyan('📋  Workly') + '\n\n' + 
    chalk.gray('A minimal kanban for devs'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  );
  console.log(banner);
}
