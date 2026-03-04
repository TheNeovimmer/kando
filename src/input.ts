export function parseKeypress(buf: Buffer): string {
  // Ctrl+C
  if (buf[0] === 3) return 'C-c';
  // Tab
  if (buf[0] === 9) return 'tab';
  // Enter / Return
  if (buf[0] === 13) return 'return';
  // Backspace
  if (buf[0] === 127) return 'backspace';
  // Escape sequences
  if (buf[0] === 27) {
    if (buf.length === 1) return 'escape';
    if (buf[1] === 91) {
      switch (buf[2]) {
        case 65: return 'up';
        case 66: return 'down';
        case 67: return 'right';
        case 68: return 'left';
        case 72: return 'home';
        case 70: return 'end';
        case 51:
          if (buf[3] === 126) return 'delete';
          break;
      }
    }
    return '';
  }
  // Printable ASCII
  if (buf[0] >= 32 && buf[0] < 127) {
    return String.fromCharCode(buf[0]);
  }
  // Multi-byte UTF-8
  try {
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

export function isPrintable(key: string): boolean {
  return key.length === 1 && key.charCodeAt(0) >= 32;
}
