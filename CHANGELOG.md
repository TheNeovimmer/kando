# Changelog

All notable changes to Kanbee are documented in this file.

## [1.1.0] - 2024-01-15

### Added

#### Advanced Theme Customization
- **Dark/Light Mode Support**: Automatically detect or manually override color mode (auto, light, dark)
  - Auto mode detects terminal background brightness
  - Light mode provides inverted colors for light terminals
  - Dark mode forces dark color palette with bright text
  - Toggle color modes in theme preview with `h`/`l` keys
  - Persistent color mode selection in settings

- **Custom Theme Creation**: Create and save personalized themes
  - Interactive theme editor with `c` key in theme selection
  - Base theme inheritance from existing themes
  - Per-color component editing with hex validation
  - Support for all 10 color components
  - Automatic persistence to `~/.kanflow/data.json`
  - Live color validation with user feedback

- **Per-Component Color Overrides**: Fine-grained color customization
  - Override individual color components without full theme recreation
  - Support for wildcard overrides
  - Proper merge order: base → custom → overrides → color mode
  - Stored in settings for persistent customization

- **Interactive Theme Preview**: Preview themes before applying
  - New `THEME_PREVIEW` mode with `p` key
  - Real-time color palette visualization with swatches
  - Toggle between all color modes during preview
  - Navigate themes and apply from preview
  - Hex color value display for reference

- **Color Scheme Import/Export**: Share and backup themes
  - Export custom themes as portable JSON files
  - Import themes from JSON with validation
  - Full metadata preservation (name, description, colors, overrides)
  - JSON format supports both custom and shared themes
  - Color validation ensures format compliance

#### UI Improvements
- **Theme Selection Interface Enhancements**
  - Added `p` key for quick preview
  - Added `c` key for custom theme creation
  - Status bar shows relevant help for each mode
  - Visual indicators for current and active themes

- **New Application Modes**
  - `THEME_SELECT` - Interactive theme selection (press `t`)
  - `THEME_EDITOR` - Custom theme color editor (press `c`)
  - `THEME_PREVIEW` - Theme preview with color mode toggle (press `p`)

- **Status Bar Updates**
  - Mode indicators: " THEME ", " EDITOR ", " PREVIEW "
  - Context-sensitive help text for each mode
  - Real-time feedback during theme operations

#### Keyboard Shortcuts
- `t` - Open theme selector (expanded functionality)
- `p` - Preview theme with color mode options (new)
- `c` - Create custom theme (new)
- `j`/`k` - Navigate in all theme modes
- `h`/`l` - Cycle color modes in preview (new)
- `Return`/`Space` - Apply selected theme
- `Escape` - Cancel theme operations

#### API Additions
- **theme.ts**
  - `applyColorMode()` - Apply dark/light mode adjustments
  - `getThemePreviewColors()` - Get colors with mode applied
  - `createCustomTheme()` - Create new custom theme
  - `updateCustomTheme()` - Update custom theme properties
  - `applyColorOverrides()` - Apply per-component overrides
  - `mergeThemeWithOverrides()` - Merge base with custom and overrides
  - `exportThemeAsJson()` - Export theme as portable JSON
  - `importThemeFromJson()` - Import theme from JSON string
  - `validateThemeColors()` - Validate color format and values
  - `cloneTheme()` - Clone theme with modifications

- **storage.ts**
  - `getCustomThemes()` - Retrieve all custom themes
  - `addCustomTheme()` - Add new custom theme
  - `updateCustomTheme()` - Update custom theme in storage
  - `deleteCustomTheme()` - Remove custom theme
  - `getCustomThemeById()` - Fetch specific custom theme
  - `exportCustomTheme()` - Export theme as JSON string
  - `importCustomTheme()` - Import and store theme from JSON

#### Type Definitions
- `ColorMode` type: "auto" | "light" | "dark"
- `CustomTheme` interface: Complete custom theme structure
- `ColorOverride` interface: Per-component color overrides
- `ThemePreset` interface: Theme metadata
- Extended `AppMode` with new modes
- Extended `AppState` with theme editor/preview state

#### Data Storage
- New `colorMode` setting (defaults to "auto")
- New `customThemes` array in settings
- New `themeOverrides` for global color overrides
- Backward compatible migration for existing data
- Automatic defaults for new installations

### Enhanced

#### Documentation
- **README.md**: Added comprehensive theme customization section
  - Dark/light mode guide
  - Custom theme creation walkthrough
  - Color override examples
  - Theme preview documentation
  - Import/export instructions
  - Keyboard shortcut tables

- **ADVANCED_THEME_FEATURES.md** (NEW): 638-line detailed guide
  - Dark/light mode technical details
  - Custom theme creation workflow
  - Per-component override strategies
  - Theme preview usage patterns
  - Import/export format specifications
  - Programmatic theme management
  - Color format reference
  - Best practices and troubleshooting
  - Color accessibility guidelines

- **IMPLEMENTATION_SUMMARY.md** (NEW): Technical implementation details
  - Feature-by-feature breakdown
  - File structure and modifications
  - API changes and new functions
  - Data storage format
  - Keyboard bindings reference
  - Backward compatibility notes
  - Performance analysis
  - Known limitations

#### Help Text
- Updated CLI help with new theme features
- Added theme preview instructions
- Added theme editor instructions
- Added color mode information

#### Color System
- Light mode color adjustments for all themes
- Automatic brightness detection for auto mode
- Color validation on import/edit
- Hex format validation (#RRGGBB)

### Changed

- Theme selection now supports preview before applying
- Color mode persisted across sessions
- Theme storage expanded to support custom themes
- Status bar hints context-sensitive to current mode
- Help text includes all new keyboard shortcuts

### Fixed

- Color mode selection properly saved
- Theme migration handles missing colorMode
- Custom themes properly initialized on first run

### Technical Details

- **Build**: TypeScript compilation verified
- **Compatibility**: All changes backward compatible
- **Performance**: Minimal impact, O(n) color operations
- **Testing**: All features verified functional
- **Type Safety**: Full TypeScript type coverage

### Migration Notes

Existing data automatically migrates:
- `colorMode` defaults to "auto"
- `customThemes` array initialized as empty
- All existing themes continue to work
- No manual migration required

### Known Limitations

- Theme preview overlay may overlap in very small terminals (< 80 cols)
- 256-color terminals may not render all colors accurately
- Light mode adjustment is automatic and not customizable per-theme
- Real-time theme application during creation only on final apply

## [1.0.0] - 2024-01-10

### Initial Release

- Terminal-native Kanban board interface
- Vim-inspired keyboard navigation
- Multiple column support with reordering
- Rich card management (create, edit, delete, move)
- Card detail view with metadata
- Built-in themes (Ghostty, iTerm2, Kitty, WezTerm, Alacritty, Default)
- Terminal auto-detection
- Local data persistence in JSON
- Git synchronization support
- Multi-board support
- Card labels and colors
- Customizable icons
- Dark theme by default
- Interactive TUI with prompt/confirm dialogs