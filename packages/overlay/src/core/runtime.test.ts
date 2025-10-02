import { describe, expect, it } from 'vitest';

import { createRuntimeController } from './runtime';
import type { OverlayConfig, ViewportSnapshot } from './types';
import type {
  ViewportListener,
  ViewportTracker,
  ViewportTrackerFactory,
} from './viewport';

const snapshot = (overrides: Partial<ViewportSnapshot>): ViewportSnapshot => ({
  width: overrides.width ?? 0,
  height: overrides.height ?? 0,
  devicePixelRatio: overrides.devicePixelRatio ?? 1,
});

type MockTracker = ViewportTracker & {
  emit: (next: ViewportSnapshot) => void;
  started: boolean;
  stopped: boolean;
};

const createMockTrackerFactory = (
  initialSnapshot: ViewportSnapshot,
): {
  factory: ViewportTrackerFactory;
  tracker: MockTracker;
} => {
  let listener: ViewportListener | null = null;
  let currentSnapshot = initialSnapshot;
  let started = false;
  let stopped = false;

  const tracker: MockTracker = {
    start() {
      started = true;
      listener?.(currentSnapshot);
    },
    stop() {
      stopped = true;
    },
    getSnapshot() {
      return currentSnapshot;
    },
    emit(next: ViewportSnapshot) {
      currentSnapshot = next;
      listener?.(currentSnapshot);
    },
    get started() {
      return started;
    },
    get stopped() {
      return stopped;
    },
  };

  const factory: ViewportTrackerFactory = (incomingListener) => {
    listener = incomingListener;
    return tracker;
  };

  return { factory, tracker };
};

describe('createRuntimeController', () => {
  it('activates overlay and resolves breakpoint on start', () => {
    const config: OverlayConfig = {
      breakpoints: [
        { id: 'base', minWidth: 0 },
        { id: 'desktop', minWidth: 1200 },
      ],
    };

    const { factory, tracker } = createMockTrackerFactory(
      snapshot({ width: 1440, height: 900 }),
    );

    const runtime = createRuntimeController(config, factory);

    expect(runtime.store.getState().active).toBe(false);

    runtime.start();

    const state = runtime.store.getState();
    expect(state.active).toBe(true);
    expect(state.viewport.width).toBe(1440);
    expect(state.breakpoint?.id).toBe('desktop');
    expect(tracker.started).toBe(true);
  });

  it('recomputes breakpoint when config is updated', () => {
    const initialConfig: OverlayConfig = {
      breakpoints: [{ id: 'base', minWidth: 0 }],
    };

    const { factory, tracker } = createMockTrackerFactory(snapshot({ width: 900 }));

    const runtime = createRuntimeController(initialConfig, factory);
    runtime.start();

    expect(runtime.store.getState().breakpoint?.id).toBe('base');

    const updatedConfig: OverlayConfig = {
      breakpoints: [
        { id: 'tablet', minWidth: 768 },
        { id: 'desktop', minWidth: 1200 },
      ],
    };

    runtime.updateConfig(updatedConfig);

    expect(runtime.store.getState().breakpoint?.id).toBe('tablet');

    tracker.emit(snapshot({ width: 1300 }));
    expect(runtime.store.getState().breakpoint?.id).toBe('desktop');
  });

  it('stops tracker when overlay stops', () => {
    const config: OverlayConfig = {
      breakpoints: [{ id: 'base', minWidth: 0 }],
    };

    const { factory, tracker } = createMockTrackerFactory(
      snapshot({ width: 500 }),
    );

    const runtime = createRuntimeController(config, factory);
    runtime.start();
    runtime.stop();

    expect(tracker.stopped).toBe(true);
    expect(runtime.store.getState().active).toBe(false);
  });
});
