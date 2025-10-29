import { describe, expect, it } from 'vitest';

import { normalizeOverlayConfig } from './config';
import { DEFAULT_DEBOUNCE_MS, DEFAULT_HOTKEY } from './defaults';
import type { OverlayConfig } from './types';

describe('normalizeOverlayConfig', () => {
  it('returns defaults when no input is provided', () => {
    const result = normalizeOverlayConfig();

    expect(result.breakpoints).toEqual([]);
    expect(result.hotkey).toBe(DEFAULT_HOTKEY);
    expect(result.debounceMs).toBe(DEFAULT_DEBOUNCE_MS);
    expect(result.persistState).toBe(false);
  });

  it('normalizes breakpoints while preserving author order', () => {
    const config: OverlayConfig = {
      breakpoints: [
        { id: 'desktop', minWidth: 1280 },
        { id: 'tablet', minWidth: 768, maxWidth: 1279 },
        { id: 'mobile', maxWidth: 767 },
      ],
    };

    const result = normalizeOverlayConfig(config);

    expect(result.breakpoints.map((bp) => bp.id)).toEqual([
      'desktop',
      'tablet',
      'mobile',
    ]);
    expect(result.breakpoints[0].inferredStrategy).toBe('min-width');
    expect(result.breakpoints[1].inferredStrategy).toBe('range');
    expect(result.breakpoints[2].inferredStrategy).toBe('max-width');
    expect(result.breakpoints[1].minWidth).toBe(768);
    expect(result.breakpoints[1].maxWidth).toBe(1279);
  });

  it('throws when duplicate breakpoint ids are provided', () => {
    const config: OverlayConfig = {
      breakpoints: [
        { id: 'dup', minWidth: 0 },
        { id: 'dup', minWidth: 800 },
      ],
    };

    expect(() => normalizeOverlayConfig(config)).toThrow();
  });

  it('validates explicit match strategy against provided breakpoints', () => {
    const config = {
      matchStrategy: 'min-width',
      breakpoints: [{ id: 'invalid', maxWidth: 999 }],
    };

    expect(() => normalizeOverlayConfig(config as OverlayConfig)).toThrow();
  });

  it('rejects negative breakpoint values', () => {
    const config: OverlayConfig = {
      breakpoints: [{ id: 'bad', minWidth: -1 }],
    };

    expect(() => normalizeOverlayConfig(config)).toThrow();
  });

  it('rejects range breakpoints where minWidth exceeds maxWidth', () => {
    const config: OverlayConfig = {
      breakpoints: [{ id: 'bad-range', minWidth: 800, maxWidth: 600 }],
    };

    expect(() => normalizeOverlayConfig(config)).toThrow();
  });

});
