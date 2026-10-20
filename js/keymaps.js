/*
 * keymaps.js — data-driven keyboard layout.
 *
 * Every key is identified by its physical `KeyboardEvent.code` value
 * (e.g. "KeyA", "ShiftLeft", "Numpad1"). This is the modern replacement for
 * the deprecated `keyCode` numbers and, unlike `keyCode`, it cleanly
 * distinguishes left/right modifiers and the numeric keypad with no special
 * casing. The renderer in app.js turns this data into DOM.
 *
 * Key fields:
 *   code  — KeyboardEvent.code (also the data-code attribute / lookup key)
 *   label — primary glyph drawn on the cap
 *   sub   — optional secondary glyph (shifted character) drawn small
 *   w     — width in "units" (1u = one standard key). Defaults to 1.
 *   cls   — extra CSS class(es) for special caps (modifiers, spacers, …)
 */

/* A spacer occupies horizontal room without being a key. */
const spacer = (w) => ({ spacer: true, w });

/* The main alphanumeric block + function row — rendered as flex rows. */
const MAIN_ROWS_ANSI = [
  // Function row (15u, aligns above the main block)
  [
    { code: 'Escape', label: 'Esc', cls: 'mod' },
    spacer(1),
    { code: 'F1', label: 'F1', cls: 'fn' },
    { code: 'F2', label: 'F2', cls: 'fn' },
    { code: 'F3', label: 'F3', cls: 'fn' },
    { code: 'F4', label: 'F4', cls: 'fn' },
    spacer(0.5),
    { code: 'F5', label: 'F5', cls: 'fn' },
    { code: 'F6', label: 'F6', cls: 'fn' },
    { code: 'F7', label: 'F7', cls: 'fn' },
    { code: 'F8', label: 'F8', cls: 'fn' },
    spacer(0.5),
    { code: 'F9', label: 'F9', cls: 'fn' },
    { code: 'F10', label: 'F10', cls: 'fn' },
    { code: 'F11', label: 'F11', cls: 'fn' },
    { code: 'F12', label: 'F12', cls: 'fn' },
  ],
  // Number row
  [
    { code: 'Backquote', label: '`', sub: '~' },
    { code: 'Digit1', label: '1', sub: '!' },
    { code: 'Digit2', label: '2', sub: '@' },
    { code: 'Digit3', label: '3', sub: '#' },
    { code: 'Digit4', label: '4', sub: '$' },
    { code: 'Digit5', label: '5', sub: '%' },
    { code: 'Digit6', label: '6', sub: '^' },
    { code: 'Digit7', label: '7', sub: '&' },
    { code: 'Digit8', label: '8', sub: '*' },
    { code: 'Digit9', label: '9', sub: '(' },
    { code: 'Digit0', label: '0', sub: ')' },
    { code: 'Minus', label: '-', sub: '_' },
    { code: 'Equal', label: '=', sub: '+' },
    { code: 'Backspace', label: '⌫', w: 2, cls: 'mod' },
  ],
  // Tab row
  [
    { code: 'Tab', label: 'Tab ⇄', w: 1.5, cls: 'mod' },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '[', sub: '{' },
    { code: 'BracketRight', label: ']', sub: '}' },
    { code: 'Backslash', label: '\\', sub: '|', w: 1.5 },
  ],
  // Caps row
  [
    { code: 'CapsLock', label: 'Caps', w: 1.75, cls: 'mod' },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ';', sub: ':' },
    { code: 'Quote', label: "'", sub: '"' },
    { code: 'Enter', label: 'Enter ⏎', w: 2.25, cls: 'mod' },
  ],
  // Shift row
  [
    { code: 'ShiftLeft', label: 'Shift ⇧', w: 2.25, cls: 'mod' },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ',', sub: '<' },
    { code: 'Period', label: '.', sub: '>' },
    { code: 'Slash', label: '/', sub: '?' },
    { code: 'ShiftRight', label: 'Shift ⇧', w: 2.75, cls: 'mod' },
  ],
  // Bottom (modifier) row
  [
    { code: 'ControlLeft', label: 'Ctrl', w: 1.25, cls: 'mod' },
    { code: 'MetaLeft', label: '⊞', w: 1.25, cls: 'mod' },
    { code: 'AltLeft', label: 'Alt', w: 1.25, cls: 'mod' },
    { code: 'Space', label: '', w: 6.25 },
    { code: 'AltRight', label: 'Alt', w: 1.25, cls: 'mod' },
    { code: 'MetaRight', label: '⊞', w: 1.25, cls: 'mod' },
    { code: 'ContextMenu', label: '☰', w: 1.25, cls: 'mod' },
    { code: 'ControlRight', label: 'Ctrl', w: 1.25, cls: 'mod' },
  ],
];

/* European/UK ISO Layout — featuring standard ISO Enter and IntlBackslash */
const MAIN_ROWS_ISO = [
  // Function row (same 15u)
  MAIN_ROWS_ANSI[0],
  // Number row
  MAIN_ROWS_ANSI[1],
  // Tab row (ends with top portion of ISO Enter)
  [
    { code: 'Tab', label: 'Tab ⇄', w: 1.5, cls: 'mod' },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '[', sub: '{' },
    { code: 'BracketRight', label: ']', sub: '}' },
    { code: 'Enter', label: 'Enter ⏎', w: 1.5, cls: 'mod iso-enter-top' },
  ],
  // Caps row (includes Backslash/# and bottom portion of ISO Enter)
  [
    { code: 'CapsLock', label: 'Caps', w: 1.75, cls: 'mod' },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ';', sub: ':' },
    { code: 'Quote', label: "'", sub: '"' },
    { code: 'Backslash', label: '#', sub: '~', w: 1 },
    { code: 'Enter', label: '⏎', w: 1.25, cls: 'mod iso-enter-bot' },
  ],
  // Shift row (includes 1.25u ShiftLeft + IntlBackslash)
  [
    { code: 'ShiftLeft', label: 'Shift ⇧', w: 1.25, cls: 'mod' },
    { code: 'IntlBackslash', label: '\\', sub: '|', w: 1 },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ',', sub: '<' },
    { code: 'Period', label: '.', sub: '>' },
    { code: 'Slash', label: '/', sub: '?' },
    { code: 'ShiftRight', label: 'Shift ⇧', w: 2.75, cls: 'mod' },
  ],
  // Bottom modifier row (same 15u)
  MAIN_ROWS_ANSI[5],
];

/* Standard Compact 75% Laptop Layout (13"-14" Laptops & Ultrabooks, 16u wide) */
const MAIN_ROWS_LAPTOP = [
  // Row 1: Function row (16u)
  [
    { code: 'Escape', label: 'Esc', cls: 'mod' },
    { code: 'F1', label: 'F1', cls: 'fn' },
    { code: 'F2', label: 'F2', cls: 'fn' },
    { code: 'F3', label: 'F3', cls: 'fn' },
    { code: 'F4', label: 'F4', cls: 'fn' },
    { code: 'F5', label: 'F5', cls: 'fn' },
    { code: 'F6', label: 'F6', cls: 'fn' },
    { code: 'F7', label: 'F7', cls: 'fn' },
    { code: 'F8', label: 'F8', cls: 'fn' },
    { code: 'F9', label: 'F9', cls: 'fn' },
    { code: 'F10', label: 'F10', cls: 'fn' },
    { code: 'F11', label: 'F11', cls: 'fn' },
    { code: 'F12', label: 'F12', cls: 'fn' },
    { code: 'PrintScreen', label: 'PrtSc', cls: 'fn' },
    { code: 'Insert', label: 'Ins', cls: 'fn' },
    { code: 'Delete', label: 'Del', cls: 'fn' },
  ],
  // Row 2: Number row (16u)
  [
    { code: 'Backquote', label: '`', sub: '~' },
    { code: 'Digit1', label: '1', sub: '!' },
    { code: 'Digit2', label: '2', sub: '@' },
    { code: 'Digit3', label: '3', sub: '#' },
    { code: 'Digit4', label: '4', sub: '$' },
    { code: 'Digit5', label: '5', sub: '%' },
    { code: 'Digit6', label: '6', sub: '^' },
    { code: 'Digit7', label: '7', sub: '&' },
    { code: 'Digit8', label: '8', sub: '*' },
    { code: 'Digit9', label: '9', sub: '(' },
    { code: 'Digit0', label: '0', sub: ')' },
    { code: 'Minus', label: '-', sub: '_' },
    { code: 'Equal', label: '=', sub: '+' },
    { code: 'Backspace', label: '⌫', w: 2, cls: 'mod' },
    { code: 'Home', label: 'Home', cls: 'mod' },
  ],
  // Row 3: Tab row (16u)
  [
    { code: 'Tab', label: 'Tab ⇄', w: 1.5, cls: 'mod' },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '[', sub: '{' },
    { code: 'BracketRight', label: ']', sub: '}' },
    { code: 'Backslash', label: '\\', sub: '|', w: 1.5 },
    { code: 'PageUp', label: 'PgUp', cls: 'mod' },
  ],
  // Row 4: Caps row (16u)
  [
    { code: 'CapsLock', label: 'Caps', w: 1.75, cls: 'mod' },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ';', sub: ':' },
    { code: 'Quote', label: "'", sub: '"' },
    { code: 'Enter', label: 'Enter ⏎', w: 2.25, cls: 'mod' },
    { code: 'PageDown', label: 'PgDn', cls: 'mod' },
  ],
  // Row 5: Shift row with tucked Up Arrow (16u)
  [
    { code: 'ShiftLeft', label: 'Shift ⇧', w: 2.25, cls: 'mod' },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ',', sub: '<' },
    { code: 'Period', label: '.', sub: '>' },
    { code: 'Slash', label: '/', sub: '?' },
    { code: 'ShiftRight', label: 'Shift ⇧', w: 1.75, cls: 'mod' },
    { code: 'ArrowUp', label: '↑', cls: 'arrow-key' },
    { code: 'End', label: 'End', cls: 'mod' },
  ],
  // Row 6: Modifier row with Fn and tucked Left/Down/Right arrows (16u)
  [
    { code: 'ControlLeft', label: 'Ctrl', w: 1.25, cls: 'mod' },
    { code: 'Fn', label: 'Fn', sub: 'EC', w: 1.25, cls: 'mod key-fn-hw' },
    { code: 'MetaLeft', label: '⊞', w: 1.25, cls: 'mod' },
    { code: 'AltLeft', label: 'Alt', w: 1.25, cls: 'mod' },
    { code: 'Space', label: '', w: 5.5 },
    { code: 'AltRight', label: 'Alt', w: 1.25, cls: 'mod' },
    { code: 'ControlRight', label: 'Ctrl', w: 1.25, cls: 'mod' },
    { code: 'ArrowLeft', label: '←', cls: 'arrow-key' },
    { code: 'ArrowDown', label: '↓', cls: 'arrow-key' },
    { code: 'ArrowRight', label: '→', cls: 'arrow-key' },
  ],
];

const KEY_LAYOUTS = {
  ansi: MAIN_ROWS_ANSI,
  iso: MAIN_ROWS_ISO,
  laptop: MAIN_ROWS_LAPTOP,
};

const MAIN_ROWS = MAIN_ROWS_ANSI;

/* Navigation cluster — rendered row by row (3u wide). */
const NAV_ROWS = [
  [
    { code: 'PrintScreen', label: 'PrtSc', cls: 'mod' },
    { code: 'ScrollLock', label: 'ScrLk', cls: 'mod' },
    { code: 'Pause', label: 'Pause', cls: 'mod' },
  ],
  [
    { code: 'Insert', label: 'Ins', cls: 'mod' },
    { code: 'Home', label: 'Home', cls: 'mod' },
    { code: 'PageUp', label: 'PgUp', cls: 'mod' },
  ],
  [
    { code: 'Delete', label: 'Del', cls: 'mod' },
    { code: 'End', label: 'End', cls: 'mod' },
    { code: 'PageDown', label: 'PgDn', cls: 'mod' },
  ],
];

/* Arrow keys — a small inverted-T cluster. */
const ARROW_KEYS = {
  up: { code: 'ArrowUp', label: '↑' },
  left: { code: 'ArrowLeft', label: '←' },
  down: { code: 'ArrowDown', label: '↓' },
  right: { code: 'ArrowRight', label: '→' },
};

/* Numeric keypad — placed onto a 4-col × 5-row CSS grid.
 * gc/gr = grid-column / grid-row (with spans for the tall + / Enter / wide 0). */
const NUMPAD_KEYS = [
  { code: 'NumLock', label: 'Num', cls: 'mod', gc: '1', gr: '1' },
  { code: 'NumpadDivide', label: '/', gc: '2', gr: '1' },
  { code: 'NumpadMultiply', label: '*', gc: '3', gr: '1' },
  { code: 'NumpadSubtract', label: '−', gc: '4', gr: '1' },

  { code: 'Numpad7', label: '7', gc: '1', gr: '2' },
  { code: 'Numpad8', label: '8', gc: '2', gr: '2' },
  { code: 'Numpad9', label: '9', gc: '3', gr: '2' },
  { code: 'NumpadAdd', label: '+', gc: '4', gr: '2 / span 2' },

  { code: 'Numpad4', label: '4', gc: '1', gr: '3' },
  { code: 'Numpad5', label: '5', gc: '2', gr: '3' },
  { code: 'Numpad6', label: '6', gc: '3', gr: '3' },

  { code: 'Numpad1', label: '1', gc: '1', gr: '4' },
  { code: 'Numpad2', label: '2', gc: '2', gr: '4' },
  { code: 'Numpad3', label: '3', gc: '3', gr: '4' },
  { code: 'NumpadEnter', label: '⏎', cls: 'mod', gc: '4', gr: '4 / span 2' },

  { code: 'Numpad0', label: '0', gc: '1 / span 2', gr: '5' },
  { code: 'NumpadDecimal', label: '.', gc: '3', gr: '5' },
];

/*
 * Friendly names for the live readout. Anything not listed here falls back to
 * a value derived in app.js (letters, digits, numpad numbers, the event.key).
 */
const KEY_NAMES = {
  Escape: 'Escape',
  Backquote: 'Backtick `',
  Minus: 'Minus -',
  Equal: 'Equals =',
  Backspace: 'Backspace',
  Tab: 'Tab',
  BracketLeft: 'Open Bracket [',
  BracketRight: 'Close Bracket ]',
  Backslash: 'Backslash \\',
  IntlBackslash: 'Intl Backslash (\\ / <)',
  IntlHash: 'Intl Hash (# ~)',
  IntlRo: 'Intl Ro (\\)',
  IntlYen: 'Intl Yen (¥)',
  Fn: 'Fn (Hardware/Laptop)',
  AudioVolumeMute: 'Volume Mute (Fn combo)',
  AudioVolumeDown: 'Volume Down (Fn combo)',
  AudioVolumeUp: 'Volume Up (Fn combo)',
  MediaPlayPause: 'Media Play/Pause (Fn combo)',
  MediaTrackNext: 'Next Track (Fn combo)',
  MediaTrackPrevious: 'Prev Track (Fn combo)',
  MediaStop: 'Media Stop (Fn combo)',
  BrightnessUp: 'Brightness Up (Fn combo)',
  BrightnessDown: 'Brightness Down (Fn combo)',
  MonBrightnessUp: 'Brightness Up (Fn combo)',
  MonBrightnessDown: 'Brightness Down (Fn combo)',
  CapsLock: 'Caps Lock',
  Semicolon: 'Semicolon ;',
  Quote: 'Quote \'',
  Enter: 'Enter',
  ShiftLeft: 'Left Shift',
  ShiftRight: 'Right Shift',
  Comma: 'Comma ,',
  Period: 'Period .',
  Slash: 'Slash /',
  ControlLeft: 'Left Ctrl',
  ControlRight: 'Right Ctrl',
  MetaLeft: 'Left Meta / Win',
  MetaRight: 'Right Meta / Win',
  AltLeft: 'Left Alt',
  AltRight: 'Right Alt',
  ContextMenu: 'Context Menu',
  Space: 'Space',
  PrintScreen: 'Print Screen',
  ScrollLock: 'Scroll Lock',
  Pause: 'Pause / Break',
  Insert: 'Insert',
  Home: 'Home',
  PageUp: 'Page Up',
  Delete: 'Delete',
  End: 'End',
  PageDown: 'Page Down',
  ArrowUp: 'Arrow Up',
  ArrowDown: 'Arrow Down',
  ArrowLeft: 'Arrow Left',
  ArrowRight: 'Arrow Right',
  NumLock: 'Num Lock',
  NumpadDivide: 'Numpad /',
  NumpadMultiply: 'Numpad *',
  NumpadSubtract: 'Numpad −',
  NumpadAdd: 'Numpad +',
  NumpadEnter: 'Numpad Enter',
  NumpadDecimal: 'Numpad .',
};

/* Mouse buttons by MouseEvent.button index, used by the mouse tester. */
const MOUSE_BUTTONS = {
  0: 'Left Click',
  1: 'Middle Click',
  2: 'Right Click',
  3: 'Back (Button 4)',
  4: 'Forward (Button 5)',
};

/* Count of unique real, testable keys in a layout (excludes spacers). */
function getLayoutKeyCount(layoutName = 'ansi') {
  const rows = KEY_LAYOUTS[layoutName] || MAIN_ROWS_ANSI;
  const uniqueCodes = new Set();
  rows.forEach((row) => row.forEach((k) => { if (!k.spacer && k.code) uniqueCodes.add(k.code); }));
  // Laptop compact layout has its nav and arrows integrated; desktop layouts include separate clusters
  if (layoutName !== 'laptop') {
    NAV_ROWS.forEach((row) => row.forEach((k) => uniqueCodes.add(k.code)));
    Object.values(ARROW_KEYS).forEach((k) => uniqueCodes.add(k.code));
    NUMPAD_KEYS.forEach((k) => uniqueCodes.add(k.code));
  }
  return uniqueCodes.size;
}

const TOTAL_KEYS = getLayoutKeyCount('ansi');
