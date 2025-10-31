import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findByText } from '../../test-utils/dom';
import { BadgeView } from './badge';
import type { BadgeProps, BadgeViewOptions } from './badge';

const createProps = (overrides: Partial<BadgeProps> = {}): BadgeProps => ({
  layout: { width: 1440, height: 900, devicePixelRatio: 1.5 },
  breakpoints: [
    { id: 'sm', label: 'Small', minWidth: 0, maxWidth: 639 },
    { id: 'lg', label: 'Large', minWidth: 1024, maxWidth: null },
  ],
  activeBreakpointId: 'lg',
  expanded: false,
  ...overrides,
});

describe('BadgeView', () => {
  let mountPoint: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
  });

  // helpers
  const setupView = (
    overrides: Partial<BadgeViewOptions> = {}
  ): {
    view: BadgeView;
    onToggleExpand: ReturnType<typeof vi.fn>;
  } => {
    const onToggleExpand = vi.fn();

    const view = new BadgeView({
      mountPoint,
      onToggleExpand,
      ...overrides,
    });

    return { view, onToggleExpand };
  };

  const getShadowRoot = (): ShadowRoot => {
    const host = mountPoint.firstElementChild as HTMLElement | null;
    if (!host || !host.shadowRoot) {
      throw new Error('Badge host was not mounted.');
    }
    return host.shadowRoot;
  };

  const getPill = (shadow: ShadowRoot): HTMLButtonElement => {
    const pill = shadow.querySelector('button[aria-expanded]');
    if (!(pill instanceof HTMLButtonElement)) {
      throw new Error('Badge pill button not found.');
    }
    return pill;
  };

  const getBreakpointsContainer = (shadow: ShadowRoot): HTMLElement => {
    const container = shadow.querySelector('[role="dialog"] [role="list"]');
    if (!(container instanceof HTMLElement)) {
      const panel = shadow.querySelector('[role="dialog"]');
      if (!(panel instanceof HTMLElement)) {
        throw new Error('Badge panel not found.');
      }
      throw new Error('Breakpoint container not found.');
    }
    return container;
  };

  const getHeaderReadout = (
    shadow: ShadowRoot,
    expectedTexts: { label: string; viewport: string; dpr: string }
  ): { label: HTMLElement; viewport: HTMLElement; dpr: HTMLElement } => {
    const label = findByText(shadow, expectedTexts.label);
    const viewport = findByText(shadow, expectedTexts.viewport);
    const dpr = findByText(shadow, expectedTexts.dpr);

    const missing: string[] = [];
    if ((label === null) || (viewport === null) || (dpr === null)) {
      if (!label) missing.push(`label "${expectedTexts.label}"`);
      if (!viewport) missing.push(`viewport "${expectedTexts.viewport}"`);
      if (!dpr) missing.push(`DPR "${expectedTexts.dpr}"`);
  
      throw new Error(
        `Failed to read badge header: ${missing.join(', ')} not found.`
      );
    }

    return {
      label,
      viewport,
      dpr,
    };
  };


  // Tests

  it('renders layout details for the active breakpoint', () => {
    const { view } = setupView();
    view.mount(createProps());

    const shadow = getShadowRoot();
    const { label, viewport, dpr } = getHeaderReadout(shadow, {
      label: 'Large',
      viewport: '1440×900',
      dpr: '1.5',
    });

    expect(label.textContent).toBe('Large');
    expect(viewport.textContent).toBe('1440×900');
    expect(dpr.textContent).toBe('1.5');

    view.unmount();
  });

  it('updates the viewport readout when props change', () => {
    const { view } = setupView();
    view.mount(createProps());

    view.update(
      createProps({
        layout: { width: 360, height: 640, devicePixelRatio: 3 },
        activeBreakpointId: 'sm',
      })
    );

    const shadow = getShadowRoot();
    const { label, viewport, dpr } = getHeaderReadout(shadow, {
      label: 'Small',
      viewport: '360×640',
      dpr: '3.0',
    });

    expect(label.textContent).toBe('Small');
    expect(viewport.textContent).toBe('360×640');
    expect(dpr.textContent).toBe('3.0');

    view.unmount();
  });

  it('reflects expansion state via aria-expanded', () => {
    const { view } = setupView();
    view.mount(createProps());

    const shadow = getShadowRoot();
    const pill = getPill(shadow);
    expect(pill.getAttribute('aria-expanded')).toBe('false');

    view.update(createProps({ expanded: true }));
    expect(pill.getAttribute('aria-expanded')).toBe('true');

    view.unmount();
  });

  it('renders breakpoint details and handles the empty state', () => {
    const { view } = setupView();
    view.mount(createProps());

    const shadow = getShadowRoot();
    const container = getBreakpointsContainer(shadow);
    expect(container.getAttribute('role')).toBe('list');

    const listItems = shadow.querySelectorAll('[role="listitem"]');
    expect(listItems).toHaveLength(2);

    expect(findByText(shadow, 'Small')).not.toBeNull();
    expect(findByText(shadow, '0px–639px')).not.toBeNull();
    expect(findByText(shadow, 'Large')).not.toBeNull();
    expect(findByText(shadow, '1024px+')).not.toBeNull();

    view.update(createProps({ breakpoints: [], activeBreakpointId: null }));

    expect(shadow.querySelector('[role="listitem"]')).toBeNull();
    const emptyState = findByText(container, 'No breakpoints configured');
    expect(emptyState).not.toBeNull();

    view.unmount();
  });

  it('invokes callback when the user toggles expansion', () => {
    const { view, onToggleExpand } = setupView();
    view.mount(createProps());

    const shadow = getShadowRoot();
    const pill = getPill(shadow);
    pill.click();
    expect(onToggleExpand).toHaveBeenCalledTimes(1);

    view.unmount();
  });

  it('remounts after being unmounted', () => {
    const { view } = setupView();

    view.mount(createProps());
    view.unmount();
    expect(mountPoint.firstElementChild).toBeNull();

    view.mount(
      createProps({
        layout: { width: 1280, height: 720, devicePixelRatio: 2 },
      })
    );

    const shadow = getShadowRoot();
    const { label, viewport, dpr } = getHeaderReadout(shadow, {
      label: 'Large',
      viewport: '1280×720',
      dpr: '2.0',
    });

    expect(label.textContent).toBe('Large');
    expect(viewport.textContent).toBe('1280×720');
    expect(dpr.textContent).toBe('2.0');

    view.unmount();
  });
});
