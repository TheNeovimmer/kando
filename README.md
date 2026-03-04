# Kando

Kando is a minimalist, terminal-native Kanban utility engineered for developers who value speed, precision, and local ownership of their workflow. It eliminates the cognitive overhead of web-based project management tools by providing an interface that resides directly within the development environment.

## Philosophy

Kando is built upon the principle that task management should be an extension of the development process, not a departure from it. By leveraging a local-first data model and seamless Git integration, Kando ensures that your project's progress is versioned alongside its source code.

## Core Features

- Terminal-Native Interface: A high-performance interactive text user interface (TUI) optimized for rapid data entry and manipulation.
- Git Synchronization: Integrated synchronization mechanisms that allow for automated tracking of project state across distributed teams.
- Local Sovereignty: All data is stored in standard JSON format within the repository, ensuring complete offline availability and data portability.
- Extensible Design: Modular architecture focused on simplicity and clarity, making it easy to integrate into custom development pipelines.

## Installation

Identify the project directory and install the package via the Node Package Manager:

```bash
npm install -g kando
```

## Operation

Enter the interactive TUI by executing the primary command:

```bash
kando
```

### Direct Command Interface

For non-interactive operations, Kando provides a suite of direct subcommands:

```bash
# Append a new card to the project backlog
kando add "Implement storage abstraction"

# Transition a card between workflow columns
kando move <card-id> <backlog | in-progress | done>

# Review board status in a structured list
kando list

# Synchronize local state with the remote repository
kando push
```

## Technical Reference

| Command               | Definition                                             |
| --------------------- | ------------------------------------------------------ |
| kando                 | Initializes the interactive management suite.          |
| kando add [title]     | Constructs a new card within the primary board.        |
| kando move [id] [col] | Displaces a card to the specified workflow pillar.     |
| kando delete [id]     | Removes a card from the persistent store.              |
| kando list            | Renders a summary of all active boards and cards.      |
| kando view            | Displays a static snapshot of the current board state. |
| kando boards          | Enumerates all initialized boards.                     |
| kando create-board    | Initializes a new board configuration.                 |
| kando push            | Executes the configured Git synchronization routine.   |

## Data Persistence

Kando maintains state within `./data/boards.json`. This approach ensures that your Kanban board follows the same branching and merging logic as your codebase, providing a unified history of both code and intent.

## Contributions

Technical contributions are welcome. Please refer to the formal contributing guidelines for details on the development workflow and coding standards.

## License

This software is distributed under the MIT License. Detailed terms are available in the LICENSE file.

---

Maintained by [TheNeovimmer](https://github.com/TheNeovimmer)
