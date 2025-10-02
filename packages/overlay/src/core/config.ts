import {
  CONFIG_SCHEMA_VERSION,
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_HOTKEY,
  DEFAULT_OVERFLOW_ENABLED,
  DEFAULT_PERSIST_STATE,
  createDefaultBreakpoints,
  createDefaultOverflowIgnore,
} from './defaults';
import type {
  BreakpointMatchStrategy,
  MaxWidthBreakpoint,
  MinWidthBreakpoint,
  NormalizedBreakpoint,
  OverlayConfig,
  RangeBreakpoint,
  ResolvedOverlayConfig,
} from './types';

const toNumber = (value: number, field: string, id: string): number => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Breakpoint ${id} has an invalid ${field} value`);
  }

  return value;
};

// TODO: tesdetermineStrategy;
const determineStrategy = (
  breakpoint: MinWidthBreakpoint | MaxWidthBreakpoint | RangeBreakpoint,
): BreakpointMatchStrategy => {
  if (
    typeof (breakpoint as RangeBreakpoint).minWidth === 'number' &&
    typeof (breakpoint as RangeBreakpoint).maxWidth === 'number'
  ) {
    return 'range';
  }

  if (typeof (breakpoint as MinWidthBreakpoint).minWidth === 'number') {
    return 'min-width';
  }

  return 'max-width';
};


const normalizeBreakpoint = (
  breakpoint: MinWidthBreakpoint | MaxWidthBreakpoint | RangeBreakpoint,
  explicitStrategy?: BreakpointMatchStrategy,
): NormalizedBreakpoint => {
  const inferredStrategy = determineStrategy(breakpoint);

  if (explicitStrategy && explicitStrategy !== inferredStrategy) {
    throw new Error(`Breakpoint ${breakpoint.id} does not match required strategy ${explicitStrategy}`);
  }

  const minWidth =
    typeof (breakpoint as MinWidthBreakpoint).minWidth === 'number'
      ? toNumber((breakpoint as MinWidthBreakpoint).minWidth, 'minWidth', breakpoint.id)
      : null;

  const maxWidth =
    typeof (breakpoint as MaxWidthBreakpoint).maxWidth === 'number'
      ? toNumber((breakpoint as MaxWidthBreakpoint).maxWidth, 'maxWidth', breakpoint.id)
      : null;

  if (minWidth !== null && maxWidth !== null && minWidth > maxWidth) {
    throw new Error(`Breakpoint ${breakpoint.id} has minWidth greater than maxWidth`);
  }

  return {
    id: breakpoint.id,
    label: breakpoint.label ?? breakpoint.id,
    minWidth,
    maxWidth,
    inferredStrategy,
  };
};

export const normalizeOverlayConfig = (config?: OverlayConfig): ResolvedOverlayConfig => {
  const explicitStrategy = config?.matchStrategy;
  const providedBreakpoints = config?.breakpoints ?? [];

  const seen = new Set<string>();

  const normalizedInputs = providedBreakpoints.map((breakpoint) => {
    if (seen.has(breakpoint.id)) {
      throw new Error(`Duplicate breakpoint id detected: ${breakpoint.id}`);
    }

    seen.add(breakpoint.id);
    return normalizeBreakpoint(breakpoint, explicitStrategy);
  });

  const normalizedBreakpoints =
    normalizedInputs.length > 0
      ? normalizedInputs
      : createDefaultBreakpoints();

  const ignoreSelectorsSource =
    config?.overflow?.ignoreSelectors ?? createDefaultOverflowIgnore();

  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    breakpoints: normalizedBreakpoints,
    hotkey: config?.hotkey ?? DEFAULT_HOTKEY,
    overflow: {
      enabled: config?.overflow?.enabled ?? DEFAULT_OVERFLOW_ENABLED,
      ignoreSelectors: [...ignoreSelectorsSource],
    },
    debounceMs: config?.debounceMs ?? DEFAULT_DEBOUNCE_MS,
    persistState: config?.persistState ?? DEFAULT_PERSIST_STATE,
  };
};
