# Kanbee

A keyboard-driven terminal Kanban board with Vim navigation, designed for developers who value efficiency, control, and seamless integration with their development workflow.

## Overview

Kanbee is a minimalist, terminal-native Kanban utility engineered for developers who value speed, precision, and local ownership of their workflow. It eliminates the cognitive overhead of web-based project management tools by providing an interface that resides directly within the development environment.

Rather than context-switching to a web browser, Kanbee brings task management into your terminal—where your code already lives. This eliminates friction, reduces cognitive load, and ensures your project's progress is versioned alongside its source code.

## Philosophy

Task management should be an extension of the development process, not a departure from it. By leveraging a local-first data model and seamless Git integration, Kanbee ensures that your project's progress is versioned alongside its source code.

The core principles driving Kanbee:

- **Velocity First**: Remove friction between thought and action. Navigate with vim keybindings, no mouse required.
- **Local Ownership**: All data stored in your repository as standard JSON. No cloud vendor lock-in.
- **Git Native**: Your Kanban board follows the same branching and merging logic as your codebase.
- **Extensibility**: Modular architecture designed for simplicity and integration into custom pipelines.

## Features

### Terminal-Native Interface

Kanbee provides a high-performance interactive TUI optimized for rapid data entry and manipulation. The interface is built from the ground up to prioritize keyboard efficiency and minimal visual overhead.

### Vim-Driven Navigation

All navigation uses standard Vim keybindings. No learning curve if you're already in Neovim or Vim:

- `h` / `l` — Move between columns (or arrow keys)
- `j` / `k` — Move between cards (or arrow keys)
- Muscle memory carries directly from your editor

### Comprehensive Card Management

Create, edit, and manage cards with full feature support:

- **Create**: Multi-step card creation with title and optional description
- **View**: Open card detail view with all metadata at a glance
- **Edit**: Modify title, description, and icons inline
- **Move**: Slide cards between columns with `m` (forward) and `M` (backward)
- **Delete**: Remove cards with confirmation safeguards
- **Metadata**: Support for assignees, labels, colors, timestamps, and custom icons

### Dynamic Column Management

Fully customize your workflow on the fly:

- **Add Columns**: Create new workflow stages (`A`)
- **Rename Columns**: Update column names as your process evolves (`R`)
- **Delete Columns**: Remove columns with automatic card relocation to the first column (`X`)
- **Preserve State**: All changes are persisted to your repository

### Multiple Interaction Modes

Kanbee provides different modes optimized for different tasks:

#### Normal Mode

Your primary interface for navigating and managing the board. Supports card operations, column management, and application control.

#### Detail Mode

Access comprehensive card information and make edits:

- `Tab` — Navigate between editable fields (title, description, icon)
- `i` or `Return` — Enter edit mode for the focused field
- `Escape` — Exit detail view and return to normal mode

#### Insert Mode

Direct text editing within card fields:

- Type to modify content
- `Return` — Save changes
- `Escape` — Discard changes
- `Backspace` — Delete characters

#### Prompt Mode

Interactive input dialogs for card and column creation:

- Type to enter information
- `Return` — Confirm input
- `Escape` — Cancel operation
- `Backspace` — Delete characters

#### Confirm Mode

Safety verification before destructive operations:

- `y` — Confirm action
- `n` or `Escape` — Cancel action

### Data Persistence and Version Control

Kanbee stores all state in `./data/boards.json` using standard JSON format. Your Kanban board becomes part of your repository's version history:

- Full Git integration for tracking board evolution
- Complete offline availability—no network dependency
- Data portability with human-readable JSON format
- Distributed team synchronization via `git push` and `git pull`

### Extensible Architecture

The codebase is organized into focused modules:

- `input.ts` — Keyboard event parsing and handling
- `renderer.ts` — Terminal output and screen rendering
- `storage.ts` — Persistence layer and data management
- `theme.ts` — Color and appearance customization
- `tui.ts` — Application state and mode management
- `types.ts` — TypeScript interface definitions

This modular approach makes it straightforward to extend Kanbee or integrate it into custom development pipelines.

## Installation

### Prerequisites

- Node.js 14.0 or later
- npm or yarn

### Install Globally

```bash
npm install -g kanbee
```

This installs the `kanbee` command globally, making it available from any directory.

### Install Locally

To use Kanbee within a specific project:

```bash
npm install --save-dev kanbee
npx kanbee
```

## Usage

### Interactive TUI

Launch the full terminal interface:

```bash
kanbee
```

This opens the interactive Kanban board with all features enabled.

### Direct Commands

For scripted or non-interactive operations, Kanbee provides a command interface:

```bash
# Create a new card
kanbee add "Implement authentication system"

# Move a card to a specific column
kanbee move <card-id> <column-id>

# Display all cards and boards
kanbee list

# Show current board state
kanbee view

# List all available boards
kanbee boards

# Create a new board
kanbee create-board "Project Name"

# Delete a card
kanbee delete <card-id>

# Synchronize with Git
kanbee push
```

## Keyboard Reference

### Navigation

| Binding | Action |
|---------|--------|
| `h` or `<Left>` | Move to previous column |
| `l` or `<Right>` | Move to next column |
| `j` or `<Down>` | Move to next card |
| `k` or `<Up>` | Move to previous card |

### Card Operations

| Binding | Action |
|---------|--------|
| `n` | Create new card (multi-step: title, optional description) |
| `<Return>` | Open selected card in detail view |
| `d` | Delete selected card (requires confirmation) |
| `m` | Move card forward to next column |
| `M` | Move card backward to previous column |

### Column Operations

| Binding | Action |
|---------|--------|
| `A` | Add new column to board |
| `R` | Rename current column |
| `X` | Delete current column (cards relocate to first column) |

### Edit and Navigation (Detail/Insert Modes)

| Binding | Action |
|---------|--------|
| `<Tab>` | Cycle between editable fields in detail view |
| `i` or `<Return>` | Enter insert mode to edit focused field |
| `<Escape>` | Exit current mode (detail or insert) |
| `<Backspace>` | Delete character (insert mode) |

### General

| Binding | Action |
|---------|--------|
| `q` | Exit application gracefully |
| `C-c` | Force exit |

## Command Line Reference

| Command | Description |
|---------|-------------|
| `kanbee` | Launch interactive terminal interface |
| `kanbee add [title]` | Create new card with given title |
| `kanbee move [id] [column]` | Move card to specified column |
| `kanbee delete [id]` | Remove card from board |
| `kanbee list` | Display all cards in formatted table |
| `kanbee view` | Render static snapshot of current board |
| `kanbee boards` | List all available boards |
| `kanbee create-board [name]` | Initialize new board |
| `kanbee push` | Execute Git synchronization |

## Data Storage

### Location and Format

Board state is stored in `./data/boards.json`. The file uses standard JSON format for complete portability and human readability.

### Example Structure

```json
{
  "version": "1.0.0",
  "boards": [
    {
      "id": "default",
      "name": "Product Development",
      "columns": [
        {
          "id": "backlog",
          "name": "Backlog",
          "icon": "○",
          "order": 0
        },
        {
          "id": "in-progress",
          "name": "In Progress",
          "icon": "◐",
          "order": 1
        },
        {
          "id": "done",
          "name": "Done",
          "icon": "●",
          "order": 2
        }
      ],
      "cards": [
        {
          "id": "card-001",
          "title": "Implement JWT authentication",
          "description": "Add JWT-based authentication to API endpoints with refresh token support",
          "columnId": "in-progress",
          "icon": "