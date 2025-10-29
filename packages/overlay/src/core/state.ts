import type { OverlayStore, RuntimeState, StateListener } from './types';

const createDefaultRuntimeState = (): RuntimeState => ({
  active: false,
  viewport: {
    width: 0,
    height: 0,
    devicePixelRatio: 1,
  },
  breakpoint: null,
  overflow: [],
  badge: {
    expanded: false,
  },
  timestamp: Date.now(),
});

export function createStore(initialState?: RuntimeState): OverlayStore {
  let state = initialState ?? createDefaultRuntimeState();
  const listeners = new Set<StateListener>();

  const getState = () => state;

  const setState: OverlayStore['setState'] = (updater) => {
    const next =
      typeof updater === 'function'
        ? (updater as (current: RuntimeState) => RuntimeState)(state)
        : updater;

    if (next === state) {
      return;
    }

    const withTimestamp =
      typeof next.timestamp !== 'number' || next.timestamp === state.timestamp
        ? { ...next, timestamp: Date.now() }
        : next;

    state = withTimestamp;
    listeners.forEach((listener) => listener(state));
  };

  const subscribe: OverlayStore['subscribe'] = (listener) => {
    listeners.add(listener);
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    setState,
    subscribe,
  };
}

export { createDefaultRuntimeState };
