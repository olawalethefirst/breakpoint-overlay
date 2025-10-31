import { describe, expect, it } from 'vitest';
import { matchesHotkey, parseHotkey } from './hotkey';

describe('parseHotkey', () => {
  it('parses modifier and key tokens case-insensitively', () => {
    const binding = parseHotkey('Alt+Shift+O');
    expect(binding).not.toBeNull();
    expect(binding).toEqual({
      alt: true,
      ctrl: false,
      shift: true,
      meta: false,
      key: 'o',
      code: 'KeyO',
    });
  });

  it('recognizes command aliases as meta', () => {
    const binding = parseHotkey('cmd+k');
    expect(binding).toEqual({
      alt: false,
      ctrl: false,
      shift: false,
      meta: true,
      key: 'k',
      code: 'KeyK',
    });
  });

  it('returns null for empty strings', () => {
    expect(parseHotkey('')).toBeNull();
    expect(parseHotkey('   ')).toBeNull();
    expect(parseHotkey(undefined)).toBeNull();
  });

  it('throws when multiple non-modifier keys are provided', () => {
    expect(() => parseHotkey('ctrl+k+o')).toThrow();
  });

  it('throws when the key token is longer than one character', () => {
    expect(() => parseHotkey('ctrl+enter')).toThrow();
  });
});

describe('matchesHotkey', () => {
  it('matches when all modifiers and key align', () => {
    const binding = parseHotkey('alt+shift+o');
    const event = new KeyboardEvent('keydown', {
      altKey: true,
      shiftKey: true,
      key: 'O',
      code: 'KeyO',
    });

    expect(binding).not.toBeNull();
    expect(matchesHotkey(event, binding)).toBe(true);
  });

  it('rejects events with mismatched modifiers or key', () => {
    const binding = parseHotkey('alt+o');
    const event = new KeyboardEvent('keydown', {
      key: 'o',
      ctrlKey: true,
      code: 'KeyO',
    });

    expect(binding).not.toBeNull();
    expect(matchesHotkey(event, binding)).toBe(false);
  });

  it('falls back to event.code when event.key differs', () => {
    const binding = parseHotkey('alt+shift+o');
    const event = new KeyboardEvent('keydown', {
      altKey: true,
      shiftKey: true,
      key: 'Ø',
      code: 'KeyO',
    });

    expect(binding).not.toBeNull();
    expect(matchesHotkey(event, binding)).toBe(true);
  });
});
