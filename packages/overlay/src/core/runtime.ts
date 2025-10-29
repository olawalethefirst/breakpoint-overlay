import { resolveBreakpoint } from './breakpoints';
import { normalizeOverlayConfig } from './config';
import { createStore } from './state';
import { BadgeContainer } from '../ui/badge-container';
import type { ViewportTrackerFactory } from './viewport';
import { createViewportTracker } from './viewport';
import type {
  OverlayConfig,
  OverlayContext,
  OverlayHandle,
  OverlayStore,
  ResolvedOverlayConfig,
  ViewportSnapshot,
} from './types';

interface RuntimeController {
  store: OverlayStore;
  context: OverlayContext;
  viewportTracker: ReturnType<ViewportTrackerFactory> | null;
  badgeContainer: BadgeContainer;
  start(): void;
  stop(): void;
  updateConfig(config: OverlayConfig): void;
}

const updateRuntimeState = (
  store: OverlayStore,
  config: ResolvedOverlayConfig,
  snapshot: ViewportSnapshot,
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
  trackerFactory: ViewportTrackerFactory = createViewportTracker,
): RuntimeController => {
  const resolvedConfig = normalizeOverlayConfig(config);
  const store = createStore();

  const context: OverlayContext = {
    config: resolvedConfig,
    store,
  };

  let viewportTracker: ReturnType<ViewportTrackerFactory> | null = null;
  const badgeContainer = new BadgeContainer(context);

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
        : prev,
    );

    if (viewportTracker) {
      viewportTracker.stop();
    }
  };

  const updateConfig = (patch: OverlayConfig) => {
    const nextConfig = normalizeOverlayConfig(patch);
    context.config = nextConfig;
    badgeContainer.updateConfig(nextConfig);

    const snapshot = viewportTracker?.getSnapshot();
    if (snapshot) {
      updateRuntimeState(store, nextConfig, snapshot);
    }
  };

  return {
    store,
    context,
    viewportTracker,
    badgeContainer,
    start,
    stop,
    updateConfig,
  };
};

export const createOverlayHandle = (config?: OverlayConfig): OverlayHandle => {
  const runtime = createRuntimeController(config);

  return {
    start: runtime.start,
    stop: runtime.stop,
    toggle: () => {
      const { active } = runtime.store.getState();
      if (active) {
        runtime.stop();
      } else {
        runtime.start();
      }
    },
    updateConfig: runtime.updateConfig,
    getState: runtime.store.getState,
    subscribe: runtime.store.subscribe,
  };
};
