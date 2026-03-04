![Kando Banner](/home/neovimmer/.gemini/antigravity/brain/66dddaff-1fec-48f5-8527-6dd8ad00e53d/kando_banner_1772659579561.png)

# Kando

> A minimal, beautiful kanban CLI for developers and teams.

Kando is designed for developers who live in the terminal. No heavy web interfaces, no complex cloud setups—just a fast, intuitive, and Git-integrated kanban board that lives right alongside your code.

## ✨ Features

- ⚡️ **Lightweight & Fast**: Zero-latency interactions.
- 📋 **Intuitive TUI**: Interactive terminal interface for managing your flow.
- 🔄 **Git-Integrated**: Auto-commit and push your task changes to keep your team in sync.
- 🎨 **Beautiful Aesthetics**: Rich colors and a clean layout powered by `chalk` and `boxen`.
- 📦 **Simple Storage**: Local JSON-based data that you own.

## 🚀 Quick Start

### Installation

```bash
npm install -g kando
```

### Usage

Simply run `kando` to enter the interactive mode:

```bash
kando
```

Or use the CLI directly:

```bash
# Add a new task to the backlog
kando add "Refactor storage layer"

# Move a card to "in-progress"
kando move <card-id> in-progress

# List all cards on your board
kando list

# Push changes to your configured remote
kando push
```

## 🛠 Commands

| Command                     | Description                            |
| --------------------------- | -------------------------------------- |
| `kando`                     | Start interactive mode                 |
| `kando add "Task"`          | Add a card to the backlog              |
| `kando move <id> <col>`     | Move a card (backlog/in-progress/done) |
| `kando delete <id>`         | Delete a card                          |
| `kando list`                | List boards and current cards          |
| `kando view`                | Interactive board view                 |
| `kando boards`              | List all boards                        |
| `kando create-board "Name"` | Create a new board                     |
| `kando push`                | Sync changes to Git                    |

## ⚙️ Configuration

Kando stores your data in your project's local directory under `./data/boards.json`. This makes it easy to version control your tasks alongside your code.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Built with ☕️ by [TheNeovimmer](https://github.com/TheNeovimmer)
