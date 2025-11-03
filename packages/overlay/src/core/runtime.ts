import { resolveBreakpoint } from "./breakpoints";
import { normalizeOverlayConfig } from "./config";
import { parseHotkey, matchesHotkey } from "./hotkey";
import { createStore } from "./state";
import { BadgeContainer } from "../ui/badge-container";
import type { ViewportTrackerFactory } from "./viewport";
import { createViewportTracker } from "./viewport";
import type {
  OverlayConfig,
  OverlayContext,
  OverlayHandle,
  OverlayStore,
  ResolvedOverlayConfig,
  ViewportSnapshot,
} from "./types";

interface RuntimeController {
  store: OverlayStore;
  context: OverlayContext;
  viewportTracker: ReturnType<ViewportTrackerFactory> | null;
  badgeContainer: BadgeContainer;
  start(): void;
  stop(): void;
  toggle(): void;
  updateConfig(config: OverlayConfig): void;
  destroy(): void;
}

const updateRuntimeState = (
  store: OverlayStore,
  config: ResolvedOverlayConfig,
  snapshot: ViewportSnapshot
) => {
  const breakpoint = resolveBreakpoint(snapshot, config.breakpoints);
  store.setState((state) => ({
    ...state,
    viewport: snapshot,
    breakpoint,
  }));
};

export const createRuntimeController = (
  config?: OverlayConfig,
  trackerFactory: ViewportTrackerFactory = createViewportTracker
): RuntimeController => {
  const resolvedConfig = normalizeOverlayConfig(config);
  const store = createStore();

  const context: OverlayContext = {
    config: resolvedConfig,
    store,
  };

  let viewportTracker: ReturnType<ViewportTrackerFactory> | null = null;
  const badgeContainer = new BadgeContainer(context);
  let hotkeyBinding = parseHotkey(resolvedConfig.hotkey);
  let removeHotkeyListener: (() => void) | null = null;

  const isEditableTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    if (target.isContentEditable) {
      return true;
    }

    const tag = target.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select";
  };

  const ensureViewportTracker = () => {
    if (viewportTracker) return viewportTracker;

    viewportTracker = trackerFactory((snapshot) => {
      updateRuntimeState(context.store, context.config, snapshot);
    });

    return viewportTracker;
  };

  const start = () => {
    store.setState((prev) => (prev.active ? prev : { ...prev, active: true }));

    const activeTracker = ensureViewportTracker();
    activeTracker.start();
    updateRuntimeState(store, context.config, activeTracker.getSnapshot());
  };

  const stop = () => {
    store.setState((prev) =>
      prev.active
        ? {
            ...prev,
            active: false,
            badge: {
              ...prev.badge,
              expanded: false,
            },
          }
        : prev
    );

    if (viewportTracker) {
      viewportTracker.stop();
    }
  };

  const toggle = () => {
    const { active } = store.getState();
    if (active) {
      stop();
    } else {
      start();
    }
  };

  const handleHotkey = (event: KeyboardEvent) => {
    if (!hotkeyBinding || !matchesHotkey(event, hotkeyBinding)) return;
    if (isEditableTarget(event.target)) return;

    event.preventDefault();
    toggle();
  };

  const setupHotkeyListener = () => {
    if (removeHotkeyListener) {
      removeHotkeyListener();
      removeHotkeyListener = null;
    }

    if (!hotkeyBinding) return;
    if (
      typeof window === "undefined" ||
      typeof window.addEventListener !== "function"
    )
      return;

    window.addEventListener("keydown", handleHotkey);
    removeHotkeyListener = () =>
      window.removeEventListener("keydown", handleHotkey);
  };

  const updateConfig = (patch: OverlayConfig) => {
    const nextConfig = normalizeOverlayConfig(patch);
    context.config = nextConfig;
    badgeContainer.updateConfig(nextConfig);
    hotkeyBinding = parseHotkey(nextConfig.hotkey);
    setupHotkeyListener();

    const snapshot = viewportTracker?.getSnapshot();
    if (snapshot) {
      updateRuntimeState(store, nextConfig, snapshot);
    }
  };

  const destroy = () => {
    stop();

    if (removeHotkeyListener) {
      removeHotkeyListener();
      removeHotkeyListener = null;
    }

    badgeContainer.destroy();

    if (viewportTracker) {
      viewportTracker.stop();
      viewportTracker = null;
    }

    hotkeyBinding = null;
  };

  setupHotkeyListener();

  return {
    store,
    context,
    viewportTracker,
    badgeContainer,
    start,
    stop,
    toggle,
    updateConfig,
    destroy,
  };
};

export const createOverlayHandle = (config?: OverlayConfig): OverlayHandle => {
  const runtime = createRuntimeController(config);

  return {
    start: runtime.start,
    stop: runtime.stop,
    toggle: runtime.toggle,
    updateConfig: runtime.updateConfig,
    getState: runtime.store.getState,
    subscribe: runtime.store.subscribe,
    destroy: runtime.destroy,
  };
};
