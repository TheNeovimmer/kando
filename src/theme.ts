import { ThemeColors } from "./types";

export type TerminalName =
  | "ghostty"
  | "iterm2"
  | "kitty"
  | "wezterm"
  | "alacritty"
  | "default";

const THEMES: Record<TerminalName, ThemeColors> = {
  ghostty: {
    primary: "#7aa2f7",
    secondary: "#9ece6a",
    accent: "#e0af68",
    muted: "#565f89",
    border: "#3b4261",
    card: "#c0caf5",
    highlight: "#7aa2f7",
    bg: "#1a1b26",
    headerBg: "#24283b",
    statusBg: "#1f2335",
  },
  iterm2: {
    primary: "#bd93f9",
    secondary: "#50fa7b",
    accent: "#ffb86c",
    muted: "#6272a4",
    border: "#44475a",
    card: "#f8f8f2",
    highlight: "#bd93f9",
    bg: "#282a36",
    headerBg: "#343746",
    statusBg: "#21222c",
  },
  kitty: {
    primary: "#73daca",
    secondary: "#9ece6a",
    accent: "#ff9e64",
    muted: "#545c7e",
    border: "#3b4261",
    card: "#a9b1d6",
    highlight: "#73daca",
    bg: "#1a1b26",
    headerBg: "#24283b",
    statusBg: "#1f2335",
  },
  wezterm: {
    primary: "#f5a97f",
    secondary: "#a6da95",
    accent: "#eed49f",
    muted: "#6e738d",
    border: "#494d64",
    card: "#cad3f5",
    highlight: "#f5a97f",
    bg: "#24273a",
    headerBg: "#363a4f",
    statusBg: "#1e2030",
  },
  alacritty: {
    primary: "#89b4fa",
    secondary: "#a6e3a1",
    accent: "#fab387",
    muted: "#585b70",
    border: "#45475a",
    card: "#cdd6f4",
    highlight: "#89b4fa",
    bg: "#1e1e2e",
    headerBg: "#313244",
    statusBg: "#181825",
  },
  default: {
    primary: "#7aa2f7",
    secondary: "#9ece6a",
    accent: "#e0af68",
    muted: "#565f89",
    border: "#3b4261",
    card: "#c0caf5",
    highlight: "#7aa2f7",
    bg: "#1a1b26",
    headerBg: "#24283b",
    statusBg: "#1f2335",
  },
};

export function detectTerminal(): TerminalName {
  const env = process.env;

  if (env.GHOSTTY_RESOURCES_DIR || env.GHOSTTY_BIN_DIR) return "ghostty";
  if (env.TERM_PROGRAM === "iTerm.app") return "iterm2";
  if (env.TERM === "xterm-kitty" || env.KITTY_WINDOW_ID) return "kitty";
  if (env.TERM_PROGRAM === "WezTerm" || env.WEZTERM_PANE) return "wezterm";
  if (env.TERM === "alacritty" || env.ALACRITTY_LOG || env.ALACRITTY_SOCKET)
    return "alacritty";

  return "default";
}

export function getThemeColors(override?: string): ThemeColors {
  if (override && override in THEMES) {
    return THEMES[override as TerminalName];
  }
  const terminal = detectTerminal();
  return THEMES[terminal];
}

export function getTerminalLabel(): string {
  const name = detectTerminal();
  const labels: Record<TerminalName, string> = {
    ghostty: "Ghostty",
    iterm2: "iTerm2",
    kitty: "Kitty",
    wezterm: "WezTerm",
    alacritty: "Alacritty",
    default: "Terminal",
  };
  return labels[name];
}

export function getAvailableThemes(): TerminalName[] {
  return Object.keys(THEMES) as TerminalName[];
}

export function getThemeLabel(theme: TerminalName): string {
  const labels: Record<TerminalName, string> = {
    ghostty: "Ghostty",
    iterm2: "iTerm2",
    kitty: "Kitty",
    wezterm: "WezTerm",
    alacritty: "Alacritty",
    default: "Default",
  };
  return labels[theme];
}
