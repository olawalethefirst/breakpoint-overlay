export type BreakpointId = string;

/** Shared fields for author-supplied breakpoints. */
interface BaseBreakpoint {
  id: BreakpointId;
  label?: string;
}

/** Strategy-specific breakpoint shapes. */
export interface MinWidthBreakpoint extends BaseBreakpoint {
  minWidth: number;
  maxWidth?: never;
}

export interface MaxWidthBreakpoint extends BaseBreakpoint {
  maxWidth: number;
  minWidth?: never;
}

export interface RangeBreakpoint extends BaseBreakpoint {
  minWidth: number;
  maxWidth: number;
}

export type BreakpointMatchStrategy = "min-width" | "max-width" | "range";

type BreakpointsForStrategy<S extends BreakpointMatchStrategy> =
  S extends "min-width"
    ? MinWidthBreakpoint[]
    : S extends "max-width"
      ? MaxWidthBreakpoint[]
      : RangeBreakpoint[];

/**
 * Author-facing config. When `matchStrategy` is provided, TypeScript enforces
 * that every breakpoint matches the expected shape. Leaving it undefined
 * allows the normaliser to infer strategies per breakpoint.
 */
interface OverlayConfigBase {
  /**
   * Keyboard shortcut in `modifier+...+key` format (e.g. "alt+shift+o").
   * The final token must be a single character. Matching is case-insensitive
   * and also checks `event.code` for letters/digits so layouts that emit
   * alternate glyphs (such as "Ø") still work. Supported modifiers: alt,
   * ctrl, shift, meta (aliases cmd/command). Provide an empty string ("")
   * to disable the shortcut entirely.
   */
  hotkey?: string;
  debounceMs?: number;
}

export type OverlayConfig =
  | ({
      matchStrategy: "min-width";
      breakpoints?: BreakpointsForStrategy<"min-width">;
    } & OverlayConfigBase)
  | ({
      matchStrategy: "max-width";
      breakpoints?: BreakpointsForStrategy<"max-width">;
    } & OverlayConfigBase)
  | ({
      matchStrategy: "range";
      breakpoints?: BreakpointsForStrategy<"range">;
    } & OverlayConfigBase)
  | ({
      matchStrategy?: undefined;
      breakpoints?: (
        | MinWidthBreakpoint
        | MaxWidthBreakpoint
        | RangeBreakpoint
      )[];
    } & OverlayConfigBase);

/**
 * Normalised breakpoint stored at runtime—explicit bounds plus a hint about the
 * inferred strategy so the resolver can stay deterministic.
 */
export interface NormalizedBreakpoint {
  id: BreakpointId;
  label: string;
  minWidth: number | null;
  maxWidth: number | null;
  inferredStrategy: BreakpointMatchStrategy;
}

export interface ResolvedOverlayConfig {
  schemaVersion: number;
  breakpoints: NormalizedBreakpoint[];
  hotkey: string;
  debounceMs: number;
}

export interface ViewportSnapshot {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface BreakpointMatch {
  id: BreakpointId;
  label: string;
}

export interface BadgeUiState {
  expanded: boolean;
}

/**
 * Runtime overlay state: only values that change as the overlay runs.
 */
export interface RuntimeState {
  active: boolean;
  viewport: ViewportSnapshot;
  breakpoint: BreakpointMatch | null;
  badge: BadgeUiState;
  timestamp: number;
}

export type StateListener = (state: RuntimeState) => void;

export interface OverlayStore {
  getState(): RuntimeState;
  setState(
    updater: RuntimeState | ((state: RuntimeState) => RuntimeState)
  ): void;
  subscribe(listener: StateListener): () => void;
}

export interface OverlayHandle {
  /** Activate the overlay badge and begin viewport tracking. */
  start(): void;
  /**
   * Deactivate the overlay, collapse the badge, and stop viewport tracking.
   * Safe to call multiple times.
   */
  stop(): void;
  /** Convenience helper that toggles between `start()` and `stop()`. */
  toggle(): void;
  /**
   * Merge new configuration into the runtime. Updating the `hotkey` here
   * automatically rebinds the keyboard listener.
   */
  updateConfig(patch: OverlayConfig): void;
  /** Returns the latest runtime state snapshot. */
  getState(): RuntimeState;
  /**
   * Subscribe to state changes. Returns an unsubscribe function; listeners
   * fire whenever `RuntimeState` updates.
   */
  subscribe(listener: StateListener): () => void;
}

/**
 * Internal context shared across modules—combines the resolved config, store,
 * and optional persistence hooks (localStorage or noop).
 */
export interface OverlayContext {
  config: ResolvedOverlayConfig;
  store: OverlayStore;
  persist?: {
    load(): { config?: OverlayConfig; state?: RuntimeState } | undefined;
    save(config: ResolvedOverlayConfig, state: RuntimeState): void;
    clear(): void;
  };
}
