import { describe, expect, it } from 'vitest';

import { resolveBreakpoint } from './breakpoints';
import type { NormalizedBreakpoint, ViewportSnapshot } from './types';

const viewport = (width: number): ViewportSnapshot => ({
  width,
  height: 800,
  devicePixelRatio: 1,
});

const bp = (overrides: Partial<NormalizedBreakpoint> & Pick<NormalizedBreakpoint, 'id'>): NormalizedBreakpoint => ({
  id: overrides.id,
  label: overrides.label ?? overrides.id,
  minWidth: overrides.minWidth ?? null,
  maxWidth: overrides.maxWidth ?? null,
  inferredStrategy: overrides.inferredStrategy ?? 'min-width',
});

describe('resolveBreakpoint', () => {
  it('returns null when no breakpoints are provided', () => {
    expect(resolveBreakpoint(viewport(800), [])).toBeNull();
  });

  it('matches last satisfied breakpoint when multiple apply', () => {
    const breakpoints: NormalizedBreakpoint[] = [
      bp({ id: 'base', inferredStrategy: 'min-width', minWidth: 0 }),
      bp({ id: 'tablet', inferredStrategy: 'min-width', minWidth: 768 }),
      bp({ id: 'desktop', inferredStrategy: 'min-width', minWidth: 1200 }),
    ];

    expect(resolveBreakpoint(viewport(500), breakpoints)).toMatchObject({ id: 'base' });
    expect(resolveBreakpoint(viewport(900), breakpoints)).toMatchObject({ id: 'tablet' });
    expect(resolveBreakpoint(viewport(1440), breakpoints)).toMatchObject({ id: 'desktop' });
  });

  it('handles max-width breakpoints', () => {
    const breakpoints: NormalizedBreakpoint[] = [
      bp({ id: 'small-desktop', inferredStrategy: 'max-width', maxWidth: 1199 }),
      bp({ id: 'mobile', inferredStrategy: 'max-width', maxWidth: 767 }),
    ];

    expect(resolveBreakpoint(viewport(600), breakpoints)).toMatchObject({ id: 'mobile' });
    expect(resolveBreakpoint(viewport(1100), breakpoints)).toMatchObject({ id: 'small-desktop' });
    expect(resolveBreakpoint(viewport(1400), breakpoints)).toBeNull();
  });

  it('evaluates range breakpoints inclusively', () => {
    const breakpoints: NormalizedBreakpoint[] = [
      bp({ id: 'tablet', inferredStrategy: 'range', minWidth: 768, maxWidth: 1024 }),
    ];

    expect(resolveBreakpoint(viewport(768), breakpoints)).toMatchObject({ id: 'tablet' });
    expect(resolveBreakpoint(viewport(900), breakpoints)).toMatchObject({ id: 'tablet' });
    expect(resolveBreakpoint(viewport(1024), breakpoints)).toMatchObject({ id: 'tablet' });
    expect(resolveBreakpoint(viewport(1025), breakpoints)).toBeNull();
  });

  it('prefers later entries when breakpoints overlap across strategies', () => {
    const breakpoints: NormalizedBreakpoint[] = [
      bp({ id: 'tablet', inferredStrategy: 'min-width', minWidth: 768 }),
      bp({
        id: 'tablet-range',
        inferredStrategy: 'range',
        minWidth: 768,
        maxWidth: 1024,
      }),
      bp({ id: 'fallback', inferredStrategy: 'max-width', maxWidth: 2000 }),
    ];

    expect(resolveBreakpoint(viewport(900), breakpoints)).toMatchObject({ id: 'fallback' });
  });

  it('respects breakpoints with unbounded sides', () => {
    const breakpoints: NormalizedBreakpoint[] = [
      bp({ id: 'no-min', inferredStrategy: 'max-width', maxWidth: 500 }),
      bp({ id: 'no-max', inferredStrategy: 'min-width', minWidth: 300 }),
    ];

    expect(resolveBreakpoint(viewport(250), breakpoints)).toMatchObject({ id: 'no-min' });
    expect(resolveBreakpoint(viewport(800), breakpoints)).toMatchObject({ id: 'no-max' });
  });
});
