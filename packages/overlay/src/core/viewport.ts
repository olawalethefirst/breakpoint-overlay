import type { ViewportSnapshot } from "./types";

export type ViewportListener = (snapshot: ViewportSnapshot) => void;

const FALLBACK_SNAPSHOT: ViewportSnapshot = {
  width: 0,
  height: 0,
  devicePixelRatio: 1,
};

const readSnapshot = (): ViewportSnapshot => {
  if (typeof window === "undefined") {
    return FALLBACK_SNAPSHOT;
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio ?? 1,
  };
};

export interface ViewportTracker {
  start(): void;
  stop(): void;
  getSnapshot(): ViewportSnapshot;
}

export type ViewportTrackerFactory = (
  listener: ViewportListener
) => ViewportTracker;

export const createViewportTracker: ViewportTrackerFactory = (listener) => {
  let snapshot = readSnapshot();
  let handle: number | null = null;
  let resizeHandler: (() => void) | null = null;
  let running = false;

  const emit = () => {
    snapshot = readSnapshot();
    listener(snapshot);
  };

  const debouncedEmit = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (handle !== null) {
      window.cancelAnimationFrame(handle);
    }

    handle = window.requestAnimationFrame(() => {
      handle = null;
      emit();
    });
  };

  const start = () => {
    if (running) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    running = true;

    emit();
    resizeHandler = debouncedEmit;
    window.addEventListener("resize", resizeHandler, { passive: true });
  };

  const stop = () => {
    if (!running) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    running = false;

    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }

    if (handle !== null) {
      window.cancelAnimationFrame(handle);
      handle = null;
    }
  };

  return {
    start,
    stop,
    getSnapshot: () => snapshot,
  };
};
