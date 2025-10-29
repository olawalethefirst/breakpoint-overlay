import { BadgeView } from './badge';
import type { BadgeBreakpoint, BadgeProps } from './badge';
import type {
  OverlayContext,
  ResolvedOverlayConfig,
  RuntimeState,
} from '../core/types';

export interface BadgeContainerOptions {
  mountPoint?: HTMLElement;
}

export class BadgeContainer {
  private readonly context: OverlayContext;
  private readonly view: BadgeView;
  private readonly domAvailable: boolean;

  private breakpoints: BadgeBreakpoint[];
  private unsubscribe: (() => void) | null = null;
  private viewMounted = false;

  constructor(context: OverlayContext, options: BadgeContainerOptions = {}) {
    this.context = context;
    this.domAvailable = typeof document !== 'undefined';
    this.breakpoints = this.mapBreakpoints(context.config.breakpoints);

    this.view = new BadgeView({
      mountPoint: options.mountPoint,
      onToggleExpand: this.handleToggleExpand,
    });

    this.subscribe();
  }

  updateConfig(nextConfig: ResolvedOverlayConfig): void {
    this.breakpoints = this.mapBreakpoints(nextConfig.breakpoints);
    if (!this.domAvailable) return;

    const currentState = this.context.store.getState();
    if (!currentState.active) {
      this.teardownView();
      return;
    }

    this.renderWithState(currentState);
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.teardownView();
  }

  private subscribe(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = this.context.store.subscribe(this.handleStateChange);
  }

  private handleStateChange = (state: RuntimeState): void => {
    if (!this.domAvailable) return;

    if (!state.active) {
      this.teardownView();
      return;
    }

    this.renderWithState(state);
  };

  private handleToggleExpand = (): void => {
    this.context.store.setState((current) => {
      return {
        ...current,
        badge: {
          ...current.badge,
          expanded: !current.badge.expanded,
        },
      };
    });
  };

  private mapBreakpoints(
    entries: ResolvedOverlayConfig['breakpoints'],
  ): BadgeBreakpoint[] {
    return entries.map(({ id, label, minWidth, maxWidth }) => ({
      id,
      label,
      minWidth,
      maxWidth,
    }));
  }

  private buildProps(state: RuntimeState): BadgeProps {
    return {
      layout: state.viewport,
      breakpoints: this.breakpoints,
      activeBreakpointId: state.breakpoint?.id ?? null,
      expanded: state.badge.expanded,
    };
  }

  private renderWithState(state: RuntimeState): void {
    if (!this.domAvailable) return;

    const props = this.buildProps(state);

    if (!this.viewMounted) {
      this.view.mount(props);
      this.viewMounted = true;
    } else {
      this.view.update(props);
    }
  }

  private teardownView(): void {
    if (!this.viewMounted) return;
    this.view.unmount();
    this.viewMounted = false;
  }
}
