'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OverlayHandle, RuntimeState } from 'breakpoint-overlay';
import { initOverlay } from 'breakpoint-overlay';

const DEMO_CONFIG = {
  breakpoints: [
    { id: 'mobile', label: 'Mobile', maxWidth: 767 },
    { id: 'tablet', label: 'Tablet', minWidth: 768, maxWidth: 1199 },
    { id: 'desktop', label: 'Desktop', minWidth: 1200 },
  ],
};

const placeholderState: RuntimeState = {
  active: false,
  viewport: { width: 0, height: 0, devicePixelRatio: 1 },
  breakpoint: null,
  badge: { expanded: false },
  timestamp: Date.now(),
};

export function OverlayDemoControls() {
  const overlayRef = useRef<OverlayHandle | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [overlayState, setOverlayState] = useState<RuntimeState>(placeholderState);

  const ensureOverlay = useCallback(() => {
    if (!overlayRef.current) {
      const handle = initOverlay(DEMO_CONFIG);
      overlayRef.current = handle;
      unsubscribeRef.current = handle.subscribe((state) => {
        setOverlayState(state);
      });
    }
    return overlayRef.current;
  }, []);

  const toggleOverlay = useCallback(() => {
    const overlay = ensureOverlay();
    if (!overlay) return;
    overlay.toggle();
  }, [ensureOverlay]);

  useEffect(
    () => {
      return () => {
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
        overlayRef.current?.stop();
        overlayRef.current = null;
      };
    },
    [],
  );

  const breakpointLabel = overlayState.breakpoint?.label ?? '–';
  const viewportSummary = useMemo(() => {
    const { width, height } = overlayState.viewport;
    if (width === 0 && height === 0) return 'Waiting for viewport…';
    return `${Math.round(width)} × ${Math.round(height)}`;
  }, [overlayState.viewport]);

  const dpr = overlayState.viewport.devicePixelRatio.toFixed(1);

  return (
    <section className="w-full max-w-xl rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 text-zinc-100 shadow-lg backdrop-blur">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Breakpoint Overlay</h2>
          <p className="text-sm text-zinc-400">
            Toggle the overlay badge and verify the active breakpoint readout during manual
            testing.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleOverlay}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400"
        >
          {overlayState.active ? 'Stop overlay' : 'Start overlay'}
        </button>
      </header>

      <div className="grid gap-3 text-sm">
        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/60 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Current State
          </h3>
          <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-zinc-500">Active</dt>
            <dd className="font-medium text-zinc-200">
              {overlayState.active ? 'Yes' : 'No'}
            </dd>
            <dt className="text-zinc-500">Breakpoint</dt>
            <dd className="font-medium text-zinc-200">{breakpointLabel}</dd>
            <dt className="text-zinc-500">Viewport</dt>
            <dd className="font-medium text-zinc-200">{viewportSummary}</dd>
            <dt className="text-zinc-500">Device Pixel Ratio</dt>
            <dd className="font-medium text-zinc-200">{dpr}</dd>
          </dl>
        </div>

        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/60 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Demo Breakpoints
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-300">
            {DEMO_CONFIG.breakpoints.map((bp) => {
              let range = 'All widths';
              if (bp.minWidth != null && bp.maxWidth != null) {
                range = `${bp.minWidth}px – ${bp.maxWidth}px`;
              } else if (bp.minWidth != null) {
                range = `${bp.minWidth}px and up`;
              } else if (bp.maxWidth != null) {
                range = `Up to ${bp.maxWidth}px`;
              }

              const isActive = overlayState.breakpoint?.id === bp.id;
              return (
                <li key={bp.id} className={isActive ? 'font-semibold text-emerald-400' : undefined}>
                  {bp.label} · <span className="text-zinc-500">{range}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {overlayState.active && (
        <p className="mt-4 text-xs text-zinc-500">
          Hint: resize the viewport or use the device toolbar to see the badge update in real time.
        </p>
      )}
    </section>
  );
}
