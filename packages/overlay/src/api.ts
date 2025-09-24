import { createStore } from './core/state';
import { normalizeOverlayConfig } from './core/config';
import {
  type OverlayHandle,
  type OverlayConfig,
  type OverlayContext,
  type ResolvedOverlayConfig,
} from './core/types';

export function initOverlay(config?: OverlayConfig): OverlayHandle {
  const resolvedConfig: ResolvedOverlayConfig = normalizeOverlayConfig(config);

  const store = createStore();

  const context: OverlayContext = {
    config: resolvedConfig,
    store,
  };

  const start = () => {
    store.setState((prev) => (prev.active ? prev : { ...prev, active: true }));
  };

  const stop = () => {
    store.setState((prev) => (prev.active ? { ...prev, active: false } : prev));
  };

  const toggle: OverlayHandle['toggle'] = (force) => {
    const shouldActivate =
      typeof force === 'boolean' ? force : !store.getState().active;
    if (shouldActivate) {
      start();
    } else {
      stop();
    }
  };

  const updateConfig: OverlayHandle['updateConfig'] = (patch) => {
    context.config = {
      ...context.config,
      hotkey: patch.hotkey ?? context.config.hotkey,
      overflow: {
        enabled: patch.overflow?.enabled ?? context.config.overflow.enabled,
        ignoreSelectors:
          patch.overflow?.ignoreSelectors ?? context.config.overflow.ignoreSelectors,
      },
      debounceMs: patch.debounceMs ?? context.config.debounceMs,
      persistState: patch.persistState ?? context.config.persistState,
      breakpoints: patch.breakpoints
        ? context.config.breakpoints
        : context.config.breakpoints,
    };
  };

  return {
    start,
    stop,
    toggle,
    updateConfig,
    getState: store.getState,
    subscribe: store.subscribe,
  };
}
