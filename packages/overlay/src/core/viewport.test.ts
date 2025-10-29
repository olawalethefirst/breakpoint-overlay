import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { createViewportTracker } from './viewport';
import type { ViewportSnapshot } from './types';

const updateLayout = (layout: Partial<ViewportSnapshot>) => {
  if (typeof window === 'undefined') return;
  if (layout.width != null) window.innerWidth = layout.width;
  if (layout.height != null) window.innerHeight = layout.height;
  if (layout.devicePixelRatio != null) {
    window.devicePixelRatio = layout.devicePixelRatio;
  }
};

const createResizeObserverAPI = () => {
  let running = false;
  let callback:
    | ((entries: ResizeObserverEntry[], observer: ResizeObserver) => void)
    | null = null;
  let instance: MockResizeObserver | null = null;

  class MockResizeObserver implements ResizeObserver {
    constructor(cb: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void) {
      callback = cb;
      instance = this;
    }

    observe(target: Element) {
      if (target && !running) {
        running = true;
      }
    }

    unobserve() {
      /* noop for tests */
    }

    disconnect() {
      if (running) {
        running = false;
      }
    }
  }

  const triggerLayoutUpdate = (applyLayout: () => void) => {
    if (!running || !callback || !instance) return;
    applyLayout();
    callback([], instance);
  };

  return { ResizeObserver: MockResizeObserver, triggerLayoutUpdate };
};

const createAnimationFrameAPI = () => {
  let rafCallback: FrameRequestCallback | null = null;
  let rafId = 0;

  const requestAnimationFrame: typeof window.requestAnimationFrame = (cb) => {
    rafCallback = cb;
    return ++rafId;
  };

  const cancelAnimationFrame = () => {
    rafCallback = null;
  };

  const triggerAnimationFrame = () => {
    if (rafCallback) {
      const cb = rafCallback;
      rafCallback = null;
      cb(0);
    }
  };

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    triggerAnimationFrame,
  };
};

describe('createViewportTracker - SSR fallback', () => {
  it('returns fallback snapshot when window is undefined', () => {
    const originalWindow = globalThis.window;
    delete (globalThis as any).window;

    const tracker = createViewportTracker(() => {});

    expect(tracker.getSnapshot()).toEqual({ width: 0, height: 0, devicePixelRatio: 1 });

    expect(() => {
      tracker.start();
      tracker.stop();
    }).not.toThrow();

    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    }
  });
});

describe('createViewportTracker - browser behaviour', () => {
  let originalViewport = { width: 0, height: 0, devicePixelRatio: 1 };
  let originalResizeObserver: typeof ResizeObserver | undefined;
  let originalRequestAnimationFrame: typeof window.requestAnimationFrame | undefined;
  let originalCancelAnimationFrame:
    | typeof window.cancelAnimationFrame
    | undefined;

  beforeEach(() => {
    if (typeof window !== 'undefined') {
      originalViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      };
      originalResizeObserver = globalThis.ResizeObserver;
      originalRequestAnimationFrame = window.requestAnimationFrame;
      originalCancelAnimationFrame = window.cancelAnimationFrame;
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      updateLayout(originalViewport);
      if (originalResizeObserver) {
        globalThis.ResizeObserver = originalResizeObserver;
      } else {
        delete (globalThis as any).ResizeObserver;
      }
      if (originalRequestAnimationFrame) {
        window.requestAnimationFrame = originalRequestAnimationFrame;
      } 
      if (originalCancelAnimationFrame) {
        window.cancelAnimationFrame = originalCancelAnimationFrame;
      }
    }
    vi.restoreAllMocks();
  });

  
  it("emits initial snapshot and responds to updates", () => {
    if (typeof window === "undefined") {
      return;
    }
    delete (globalThis as any).ResizeObserver;

    const raf = createAnimationFrameAPI();
    window.requestAnimationFrame = raf.requestAnimationFrame;
    window.cancelAnimationFrame = raf.cancelAnimationFrame;

    updateLayout({ width: 600, height: 400, devicePixelRatio: 1 });

    const listener = vi.fn();
    const tracker = createViewportTracker(listener);
    tracker.start();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      width: 600,
      height: 400,
      devicePixelRatio: 1,
    });

    updateLayout({ width: 720 });
    window.dispatchEvent(new Event("resize"));
    raf.triggerAnimationFrame();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({
      width: 720,
      height: 400,
      devicePixelRatio: 1,
    });

    tracker.stop();

    updateLayout({ width: 800 });
    window.dispatchEvent(new Event("resize"));
    raf.triggerAnimationFrame();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
