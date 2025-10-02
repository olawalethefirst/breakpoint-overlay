import type {
  BreakpointMatch,
  NormalizedBreakpoint,
  ViewportSnapshot,
} from './types';

const NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
const POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

const getMinBound = (breakpoint: NormalizedBreakpoint): number =>
  breakpoint.minWidth ?? NEGATIVE_INFINITY;

const getMaxBound = (breakpoint: NormalizedBreakpoint): number =>
  breakpoint.maxWidth ?? POSITIVE_INFINITY;

const matchesBreakpoint = (
  viewportWidth: number,
  breakpoint: NormalizedBreakpoint,
): boolean => {
  switch (breakpoint.inferredStrategy) {
    case 'min-width':
      return viewportWidth >= getMinBound(breakpoint);
    case 'max-width':
      return viewportWidth <= getMaxBound(breakpoint);
    case 'range': {
      const min = getMinBound(breakpoint);
      const max = getMaxBound(breakpoint);
      return viewportWidth >= min && viewportWidth <= max;
    }
    default:
      return false;
  }
};

export const resolveBreakpoint = (
  viewport: ViewportSnapshot,
  breakpoints: NormalizedBreakpoint[],
): BreakpointMatch | null => {
  let active: BreakpointMatch | null = null;

  for (const breakpoint of breakpoints) {
    if (matchesBreakpoint(viewport.width, breakpoint)) {
      active = { id: breakpoint.id, label: breakpoint.label };
    }
  }

  return active;
};
