export interface HotkeyBinding {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
  code: string | null;
}

const normalize = (token: string): string => token.trim().toLowerCase();

const MODIFIER_MAP = new Map<string, keyof HotkeyBinding>([
  ['alt', 'alt'],
  ['option', 'alt'],
  ['ctrl', 'ctrl'],
  ['control', 'ctrl'],
  ['shift', 'shift'],
  ['meta', 'meta'],
  ['cmd', 'meta'],
  ['command', 'meta'],
]);

const buildBinding = (tokens: string[]): HotkeyBinding => {
  const binding: HotkeyBinding = {
    alt: false,
    ctrl: false,
    shift: false,
    meta: false,
    key: '',
    code: null,
  };

  let keyToken: string | null = null;

  for (const raw of tokens) {
    const token = normalize(raw);
    if (!token) continue;

    const modifier = MODIFIER_MAP.get(token);
    if (modifier && modifier !== "key" && modifier !== "code") {
      binding[modifier] = true;
      continue;
    }

    if (keyToken) {
      throw new Error(`Hotkey contains multiple non-modifier keys: "${keyToken}" and "${token}"`);
    }

    keyToken = token;
  }

  if (!keyToken) {
    throw new Error('Hotkey must include a non-modifier key');
  }

  if (keyToken.length !== 1) {
    throw new Error('Hotkey key token must be a single character');
  }

  binding.key = keyToken;

  const char = keyToken.toLowerCase();
  if (char >= 'a' && char <= 'z') {
    binding.code = `Key${char.toUpperCase()}`;
  } else if (char >= '0' && char <= '9') {
    binding.code = `Digit${char}`;
  }

  return binding;
};

export const parseHotkey = (value: string | null | undefined): HotkeyBinding | null => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return buildBinding(trimmed.split('+'));
};

export const matchesHotkey = (event: KeyboardEvent, binding: HotkeyBinding | null): boolean => {
  if (!binding) return false;

  if (
    event.altKey !== binding.alt ||
    event.ctrlKey !== binding.ctrl ||
    event.shiftKey !== binding.shift ||
    event.metaKey !== binding.meta
  ) {
    return false;
  }

  if (binding.code && typeof event.code === 'string' && event.code === binding.code) {
    return true;
  }

  const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';
  return key === binding.key;
};
