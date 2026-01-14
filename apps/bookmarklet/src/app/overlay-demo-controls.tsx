"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OverlayHandle, RuntimeState } from "breakpoint-overlay";
import { initOverlay } from "breakpoint-overlay";

import { Button } from "@/components/ui/button";

const configs = [
  {
    breakpoints: [
      { id: "mobile", label: "Mobile", maxWidth: 767 },
      { id: "tablet", label: "Tablet", minWidth: 768, maxWidth: 1199 },
      { id: "desktop", label: "Desktop", minWidth: 1200 },
    ],
  },
  {
    breakpoints: [
      { id: "mb", label: "Mobile", maxWidth: 441 },
      { id: "tablet", label: "Tablet", minWidth: 442, },
      { id: "desktop", label: "Desktop", minWidth: 1000 },
    ],
  },
];

const placeholderState: RuntimeState = {
  active: false,
  viewport: { width: 0, height: 0, devicePixelRatio: 1 },
  breakpoint: null,
  badge: { expanded: false },
  timestamp: Date.now(),
};

export function OverlayDemoControls() {
  const mounted = useRef(false);
  const overlayRef = useRef<OverlayHandle | null>(null);
  const [overlayState, setOverlayState] =
  useState<RuntimeState>(placeholderState);
  const [config, setConfig] = useState(0);
  const configRef = useRef(config);

  const toggleOverlay = useCallback(() => {
    overlayRef.current?.toggle();
  }, []);

  useEffect(() => {
    const handler = initOverlay(configs[configRef.current]);
    const unsubscribe = handler.subscribe((state) => {
      setOverlayState(state);
    });
    overlayRef.current = handler;

    return () => {
      unsubscribe();
      handler.destroy();
    };
  }, []);
  useEffect(() => {
    if (mounted.current) {
      overlayRef.current?.updateConfig(configs[config]);
    }
    mounted.current = true;
  }, [config]);

  const breakpointLabel = overlayState.breakpoint?.label ?? "–";
  const viewportSummary = useMemo(() => {
    const { width, height } = overlayState.viewport;
    if (width === 0 && height === 0) return "Waiting for viewport…";
    return `${Math.round(width)} × ${Math.round(height)}`;
  }, [overlayState.viewport]);

  const dpr = overlayState.viewport.devicePixelRatio.toFixed(1);

  return (
    <section className="w-full max-w-xl rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-[var(--card-text)] shadow-[var(--card-shadow)] backdrop-blur">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Breakpoint Overlay</h2>
          <p className="text-sm text-[var(--card-muted)]">
            Toggle the overlay badge and verify the active breakpoint readout
            during manual testing.
          </p>
        </div>
        <Button
          onClick={toggleOverlay}
          variant="primary"
          size="sm"
        >
          Toggle Overlay
        </Button>
        <Button
          onClick={() => setConfig((config) => (config + 1) % 2)}
          variant="secondary"
          size="sm"
        >
          Toggle Config
        </Button>
      </header>

      <div className="grid gap-3 text-sm">
        <div className="rounded-lg border border-[var(--card-panel-border)] bg-[var(--card-panel-bg)] p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--card-muted)]">
            Current State
          </h3>
          <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-[var(--card-muted)]">Active</dt>
            <dd className="font-medium text-[var(--card-text)]">
              {overlayState.active ? "Yes" : "No"}
            </dd>
            <dt className="text-[var(--card-muted)]">Breakpoint</dt>
            <dd className="font-medium text-[var(--card-text)]">
              {breakpointLabel}
            </dd>
            <dt className="text-[var(--card-muted)]">Viewport</dt>
            <dd className="font-medium text-[var(--card-text)]">
              {viewportSummary}
            </dd>
            <dt className="text-[var(--card-muted)]">Device Pixel Ratio</dt>
            <dd className="font-medium text-[var(--card-text)]">{dpr}</dd>
          </dl>
        </div>

        <div className="rounded-lg border border-[var(--card-panel-border)] bg-[var(--card-panel-bg)] p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--card-muted)]">
            Demo Breakpoints
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--card-muted)]">
            {configs[config].breakpoints.map((bp) => {
              let range = "All widths";
              if (bp.minWidth != null && bp.maxWidth != null) {
                range = `${bp.minWidth}px – ${bp.maxWidth}px`;
              } else if (bp.minWidth != null) {
                range = `${bp.minWidth}px and up`;
              } else if (bp.maxWidth != null) {
                range = `Up to ${bp.maxWidth}px`;
              }

              const isActive = overlayState.breakpoint?.id === bp.id;
              return (
                <li
                  key={bp.id}
                  className={
                    isActive ? "font-semibold text-[var(--card-text)]" : undefined
                  }
                >
                  {bp.label} ·{" "}
                  <span className="text-[var(--card-muted)]">{range}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {overlayState.active && (
        <p className="mt-4 text-xs text-[var(--card-muted)]">
          Hint: resize the viewport or use the device toolbar to see the badge
          update in real time.
        </p>
      )}
    </section>
  );
}
