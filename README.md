# 🐝 Kanbee

> *A keyboard-driven terminal kanban board with Vim navigation*

---

## ✨ What is Kanbee?

Kanbee is a **minimalist, terminal-native Kanban utility** engineered for developers who value speed, precision, and local ownership of their workflow. It eliminates the cognitive overhead of web-based project management tools by providing an interface that resides directly within your development environment.

Think of it as your Kanban board living right in your terminal, synced with Git, and completely in your hands.

---

## 🎯 Philosophy

Kanbee is built upon the principle that **task management should be an extension of the development process**, not a departure from it. By leveraging a local-first data model and seamless Git integration, Kanbee ensures that your project's progress is versioned alongside its source code.

Your workflow. Your data. Your rules.

---

## 🚀 Core Features

### 🖥️ **Terminal-Native Interface**
A high-performance interactive TUI optimized for rapid data entry and manipulation. Never leave your terminal.

### ⌨️ **Vim Navigation**
Navigate with familiar Vim keybindings:
- `h`/`l` or `←`/`→` — Move between columns
- `j`/`k` or `↓`/`↑` — Move between cards
- Lightning-fast workflow without reaching for the mouse

### 📋 **Full Card Management**
- **Create cards** (`n`) — Multi-step creation with title and description
- **Edit cards** (`return` → `i`) — Modify title, description, and icons
- **Delete cards** (`d`) — Confirm and remove with a keystroke
- **Move cards** (`m`/`M`) — Slide cards forward/backward between columns

### 🏗️ **Column Management**
- **Add columns** (`A`) — Expand your workflow with new columns
- **Rename columns** (`R`) — Change column names on the fly
- **Delete columns** (`X`) — Remove columns (cards safely move to the first column)
- Fully customizable workflow structure

### 🎨 **Rich Card Details**
Each card supports:
- **Title** — The card headline
- **Description** — Detailed task information
- **Icons** — Visual markers for quick identification
- **Labels & Colors** — Organize and categorize
- **Assignees** — Know who's responsible
- **Timestamps** — Track creation and completion
- **Metadata** — Complete audit trail

### 📱 **Multiple Display Modes**

#### Normal Mode
Your primary interaction mode. Navigate, create, edit, and manage everything.

#### Detail Mode
Deep-dive into individual cards:
- Press `return` on a card to enter Detail mode
- `tab` — Navigate between fields (title, description, icon)
- `i` or `return` — Edit the focused field
- `escape` — Exit detail view
- Full card metadata at your fingertips

#### Insert/Edit Mode
Direct text editing:
- Type to modify card content
- `return` — Save changes
- `escape` — Discard changes
- `backspace` — Delete characters

#### Prompt Mode
Interactive input dialogs:
- Create cards with title and description prompts
- Add and rename columns with guided input
- `return` — Confirm
- `escape` — Cancel

#### Confirm Mode
Safety checks before destructive actions:
- `y` — Confirm deletion or action
- `n` or `escape` — Cancel
- Clear, intentional operations

### 🔄 **Git Synchronization**
Integrated synchronization mechanisms that allow for automated tracking of project state across distributed teams.

### 💾 **Local Sovereignty**
All data is stored in standard JSON format within the repository (`./data/boards.json`), ensuring complete offline availability and data portability. Your Kanban board follows the same branching and merging logic as your codebase.

### 🔧 **Extensible Design**
Modular architecture focused on simplicity and clarity, making it easy to integrate into custom development pipelines.

---

## 📥 Installation

Install Kanbee globally via npm:

```bash
npm install -g kanbee
```

---

## 🎮 Quick Start

### Launch the TUI

Enter the interactive terminal interface:

```bash
kanbee
```

This opens the full-featured Kanban board with all keyboard controls ready.

### Command Palette

For non-interactive operations, use direct subcommands:

```bash
# Create a new card
kanbee add "Implement feature X"

# Move a card to a different column
kanbee move <card-id> <backlog | in-progress | done>

# View all cards in a table format
kanbee list

# Push changes to Git
kanbee push
```

---

## ⌨️ Keyboard Shortcuts

### Navigation
| Key | Action |
|-----|--------|
| `h` / `←` | Move to previous column |
| `l` / `→` | Move to next column |
| `j` / `↓` | Move to next card |
| `k` / `↑` | Move to previous card |

### Card Operations
| Key | Action |
|-----|--------|
| `n` | Create new card |
| `return` | Open card details |
| `d` | Delete card (with confirmation) |
| `m` | Move card forward |
| `M` | Move card backward |

### Column Operations
| Key | Action |
|-----|--------|
| `A` | Add new column |
| `R` | Rename current column |
| `X` | Delete current column |

### Editing
| Key | Action |
|-----|--------|
| `i` / `return` | Edit focused field (in detail mode) |
| `tab` | Switch between fields |
| `escape` | Cancel editing |
| `backspace` | Delete character |

### General
| Key | Action |
|-----|--------|
| `q` / `C-c` | Quit application |

---

## 📚 Command Reference

| Command | Description |
|---------|-------------|
| `kanbee` | Launch interactive TUI |
| `kanbee add [title]` | Create a new card |
| `kanbee move [id] [col]` | Move card to column |
| `kanbee delete [id]` | Remove a card |
| `kanbee list` | Display all cards in table format |
| `kanbee view` | Show static board snapshot |
| `kanbee boards` | List all boards |
| `kanbee create-board` | Initialize a new board |
| `kanbee push` | Sync with Git |

---

## 💾 Data Persistence

Kanbee maintains state within `./data/boards.json`. This approach ensures that your Kanban board follows the same branching and merging logic as your codebase, providing a **unified history of both code and intent**.

Example structure:
```json
{
  "version": "1.0.0",
  "boards": [{
    "id": "default",
    "name": "My Project",
    "columns": [
      { "id": "backlog", "name": "Backlog", "icon": "○", "order": 0 },
      { "id": "in-progress", "name": "In Progress", "icon": "◐", "order": 1 },
      { "id": "done", "name": "Done", "icon": "●", "order": 2 }
    ],
    "cards": [
      {
        "id": "card-1",
        "title": "Build authentication",
        "description": "Implement JWT-based auth",
        "columnId": "in-progress",
        "icon": "◆",
        "assignee": "Alice",
        "labels": [{"name": "backend", "color": "blue"}],
        "created": { "by": "Alice", "at": "2024-01-15T10:00:00Z" }
      }
    ]
  }],
  "settings": {
    "user": "Alice",
    "theme": "dark",
    "showIcons": true
  }
}
```

---

## 🎨 Customization

### Themes
Kanbee supports multiple color themes for different preferences and terminal environments.

### Icons
Customize card and column icons to match your workflow:
- Column icons: `○ ◐ ● ◇ ◈ ◆ ◎ ▣ ⬡ ✦`
- Card icons: `◇ ◈ ◆ ● ◎ ▣ ⬡ ✦ ⬢ ◉`

### Labels
Apply colored labels to cards for categorization:
- `red` `orange` `yellow` `green` `blue` `purple` `pink`

---

## 🛠️ Development

### Setup
```bash
npm install
npm run build
```

### Development Mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

---

## 🤝 Contributing

Technical contributions are welcome! Please refer to our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on the development workflow and coding standards.

We believe in:
- **Clear code** — Easy to understand and modify
- **Tested features** — Reliability matters
- **Respectful collaboration** — Everyone's input counts

---

## 📄 License

This software is distributed under the **MIT License**. Detailed terms are available in the [LICENSE](LICENSE) file.

---

## 🙋 Support & Feedback

Found a bug? Have a feature request? Open an issue on [GitHub](https://github.com/TheNeovimmer/kanbee/issues).

---

<div align="center">

**Made with ❤️ by developers, for developers**

Maintained by [TheNeovimmer](https://github.com/TheNeovimmer)

*Your terminal, your board, your workflow.*

</div>