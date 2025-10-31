import type { NormalizedBreakpoint } from './types';

export const CONFIG_SCHEMA_VERSION = 1;

export const DEFAULT_HOTKEY = 'alt+shift+o';
export const DEFAULT_DEBOUNCE_MS = 150;
export const DEFAULT_PERSIST_STATE = false;

export const createDefaultBreakpoints = (): NormalizedBreakpoint[] => [];
