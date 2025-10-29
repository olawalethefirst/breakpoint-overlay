import { afterEach, describe, expect, it, vi } from 'vitest';
import { initOverlay } from './api';
import { findByText } from '../test-utils/dom';

const FIXTURE_SNAPSHOT = {
  width: 1440,
  height: 900,
  devicePixelRatio: 1.5,
};

vi.mock('./core/viewport', () => {
  const createViewportTracker = (listener: (snapshot: typeof FIXTURE_SNAPSHOT) => void) => {
    return {
      start() {
        listener(FIXTURE_SNAPSHOT);
      },
      stop() {},
      getSnapshot() {
        return FIXTURE_SNAPSHOT;
      },
    };
  };

  return { createViewportTracker };
});

describe('Overlay badge integration', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders active breakpoint details in the badge UI', () => {
    const overlay = initOverlay({
      breakpoints: [
        { id: 'mobile', label: 'Mobile', maxWidth: 767 },
        { id: 'desktop', label: 'Desktop', minWidth: 1200 },
      ],
    });

    try {
      overlay.start();

      const host = document.body.firstElementChild as HTMLElement | null;
      expect(host).not.toBeNull();

      const shadow = host?.shadowRoot ?? null;
      expect(shadow).not.toBeNull();

      const headerLabel = findByText(shadow!, 'Desktop');
      expect(headerLabel).not.toBeNull();
      expect(headerLabel?.closest('button')).not.toBeNull();

      expect(findByText(shadow!, '1440×900')).not.toBeNull();
      expect(findByText(shadow!, '1.5')).not.toBeNull();

      const breakpointItems = shadow?.querySelectorAll('[role="listitem"]') ?? null;
      expect(breakpointItems?.length).toBe(2);

      expect(findByText(shadow!, 'Mobile')).not.toBeNull();
      const desktopListEntry = Array.from(breakpointItems ?? []).find((item) =>
        findByText(item, 'Desktop'),
      );
      expect(desktopListEntry).not.toBeUndefined();
      expect(findByText(shadow!, '≤767px')).not.toBeNull();
      expect(findByText(shadow!, '1200px+')).not.toBeNull();
    } finally {
      overlay.stop();
    }
  });
});
