import type { ViewportSnapshot } from "../core/types";

const HOST_CLASS = "overlay-badge-host";
const CLASS_BADGE = "badge";
const CLASS_BADGE_EXPANDED = "badge--expanded";
const CLASS_PILL = "badge__pill";
const CLASS_INDICATOR = "badge__indicator";
const CLASS_INDICATOR_INACTIVE = "badge__indicator--inactive";
const CLASS_LABEL = "badge__label";
const CLASS_VIEWPORT = "badge__viewport";
const CLASS_DPR = "badge__dpr";
const CLASS_CHEVRON = "badge__chevron";
const CLASS_PANEL = "badge__panel";
const CLASS_BREAKPOINTS_CONTAINER = "panel-breakpoints";
const CLASS_PANEL_HEADING = "panel-heading";
const CLASS_BREAKPOINTS_EMPTY = "panel-breakpoints__empty";
const CLASS_BREAKPOINT_ITEM = "panel-breakpoints__item";
const CLASS_BREAKPOINT_ITEM_ACTIVE = "panel-breakpoints__item--active";
const CLASS_BREAKPOINT_RANGE = "panel-breakpoints__range";
const BADGE_STYLES = `
:host {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483647;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: #e5e7eb;
}
* {
  box-sizing: border-box;
}
.${CLASS_BADGE} {
  background: #151b24;
  border-radius: 12px;
  min-width: 200px;
  box-shadow: 0 12px 32px rgba(5, 10, 20, 0.45);
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.${CLASS_PILL} {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font: 600 13px/1.4 inherit;
  text-align: left;
  letter-spacing: 0.01em;
}
.${CLASS_PILL}:focus-visible {
  outline: 2px solid #34d399;
  outline-offset: 2px;
}
.${CLASS_INDICATOR} {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #34d399;
  flex-shrink: 0;
}
.${CLASS_INDICATOR}.${CLASS_INDICATOR_INACTIVE} {
  background: #6b7280;
}
.${CLASS_LABEL} {
  color: #34d399;
  text-transform: lowercase;
  flex-shrink: 0;
}
.${CLASS_VIEWPORT},
.${CLASS_DPR} {
  color: #cbd5f5;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.${CLASS_VIEWPORT} {
  flex-grow: 1;
}
.${CLASS_DPR}::after {
  content: 'x';
  margin-left: 1px;
}
.${CLASS_CHEVRON} {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #94a3b8;
  transition: transform 0.2s ease, border-top-color 0.2s ease;
  margin-left: 6px;
}
.${CLASS_BADGE_EXPANDED} .${CLASS_CHEVRON} {
  transform: rotate(180deg);
  border-top-color: #e5e7eb;
}
.${CLASS_PANEL} {
  display: none;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  background: #131923;
}
.${CLASS_BADGE_EXPANDED} .${CLASS_PANEL} {
  display: flex;
}
.${CLASS_PANEL_HEADING} {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #94a3b8;
  margin-bottom: 6px;
}
.${CLASS_BREAKPOINTS_CONTAINER} {
  display: grid;
  gap: 4px;
}
.${CLASS_BREAKPOINTS_EMPTY} {
  color: #64748b;
  font-size: 12px;
  padding: 4px 0;
}
.${CLASS_BREAKPOINT_ITEM} {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
  padding: 2px 0;
}
.${CLASS_BREAKPOINT_ITEM_ACTIVE} {
  color: #34d399;
  font-weight: 600;
}
.${CLASS_BREAKPOINT_RANGE} {
  font-size: 12px;
  color: #64748b;
  margin-left: 12px;
}
`;

export interface BadgeBreakpoint {
  id: string;
  label: string;
  minWidth: number | null;
  maxWidth: number | null;
}

export interface BadgeProps {
  layout: ViewportSnapshot;
  breakpoints: BadgeBreakpoint[];
  activeBreakpointId: string | null;
  expanded: boolean; // control expansion through state rather than internally.
}

export interface BadgeViewOptions {
  mountPoint?: HTMLElement;
  onToggleExpand(): void;
}

interface BadgeElements {
  container: HTMLElement;
  pill: HTMLButtonElement;
  indicator: HTMLElement;
  label: HTMLElement;
  viewport: HTMLElement;
  dpr: HTMLElement;
  panel: HTMLElement;
  breakpoints: HTMLElement;
}

const formatViewport = (snapshot: ViewportSnapshot): string => {
  const w = Math.max(0, Math.round(snapshot.width));
  const h = Math.max(0, Math.round(snapshot.height));
  return `${w}×${h}`;
};

const formatDpr = (dpr: number): string => {
  if (!Number.isFinite(dpr)) return "1.0";
  return dpr.toFixed(1);
};

const formatBreakpointRange = (bp: BadgeBreakpoint): string => {
  const { minWidth, maxWidth } = bp;
  if (minWidth != null && maxWidth != null)
    return `${minWidth}px–${maxWidth}px`;
  if (minWidth != null) return `${minWidth}px+`;
  if (maxWidth != null) return `≤${maxWidth}px`;
  return "";
};

/**
 * Shallow compare references
 */
const isSameReference = (prop1: unknown, prop2: unknown) => prop1 === prop2;

export class BadgeView {
  private readonly options: BadgeViewOptions;
  private mounted: boolean;
  private host: HTMLDivElement | null = null;
  private shadow: ShadowRoot | null = null;
  private elements: BadgeElements | null = null;
  private props: BadgeProps | null = null;
  private oldProps: BadgeProps | null = null;

  constructor(options: BadgeViewOptions) {
    this.options = options;
    this.mounted = false;
  }

  mount(initialProps: BadgeProps): void {
    if (this.mounted) return;

    this.props = { ...initialProps };

    this.render();
    this.mounted = true;
  }

  update(props: BadgeProps): void {
    this.oldProps = this.props;
    this.props = props;
    this.render();
  }

  unmount(): void {
    if (this.host?.isConnected) {
      this.host.remove();
    }
    this.destroy();
  }

  private destroy(): void {
    this.unbindEvents();
    this.host = null;
    this.shadow = null;
    this.elements = null;
    this.oldProps = null;
    this.props = null;
    this.mounted = false;
  }

  private setupDom(): void {
    if ((this.shadow && this.host) || typeof document === "undefined") return;

    const host = document.createElement("div");
    host.className = HOST_CLASS;
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${BADGE_STYLES}</style>${this.generateTemplate()}`;

    this.host = host;
    this.shadow = shadow;
    this.cacheElements();
    this.bindEvents();

    const mountPoint = this.options.mountPoint ?? document.body;
    if (!this.host.isConnected) {
      mountPoint.appendChild(this.host);
    }
  }

  private cacheElements(): void {
    if (!this.shadow) return;
    this.elements = {
      container: this.shadow.querySelector(`.${CLASS_BADGE}`) as HTMLElement,
      pill: this.shadow.querySelector(`.${CLASS_PILL}`) as HTMLButtonElement,
      indicator: this.shadow.querySelector(
        `.${CLASS_INDICATOR}`
      ) as HTMLElement,
      label: this.shadow.querySelector(`.${CLASS_LABEL}`) as HTMLElement,
      viewport: this.shadow.querySelector(`.${CLASS_VIEWPORT}`) as HTMLElement,
      dpr: this.shadow.querySelector(`.${CLASS_DPR}`) as HTMLElement,
      panel: this.shadow.querySelector(`.${CLASS_PANEL}`) as HTMLElement,
      breakpoints: this.shadow.querySelector(
        `.${CLASS_BREAKPOINTS_CONTAINER}`
      ) as HTMLElement,
    };
  }

  private onPillClick = () => this.options.onToggleExpand();
  private bindEvents(): void {
    if (!this.elements) return;

    this.elements.pill.addEventListener("click", this.onPillClick);
  }
  private unbindEvents(): void {
    if (!this.elements) return;

    this.elements.pill.removeEventListener("click", this.onPillClick);
  }

  private generateTemplate(): string {
    return `
      <div class="${CLASS_BADGE}">
        <button class="${CLASS_PILL}" type="button" aria-expanded="false">
          <span class="${CLASS_INDICATOR}" aria-hidden="true"></span>
          <span class="${CLASS_LABEL}">–</span>
          <span class="${CLASS_VIEWPORT}">0×0</span>
          <span class="${CLASS_DPR}">1.0</span>
          <span class="${CLASS_CHEVRON}" aria-hidden="true"></span>
        </button>
        <div class="${CLASS_PANEL}" role="dialog" aria-label="Breakpoint details">
          <section>
            <div class="${CLASS_PANEL_HEADING}">BREAKPOINTS</div>
            <div class="${CLASS_BREAKPOINTS_CONTAINER}" role="list"></div>
          </section>
        </div>
      </div>
    `;
  }

  private render(): void {
    // mount only render
    if (!this.mounted) {
      this.setupDom();
    }

    this.renderHeader();
    this.renderBreakpoints();
    this.renderExpansion();
  }

  private renderHeader(): void {
    if (!this.elements || !this.props) return;

    const { breakpoints, activeBreakpointId, layout } = this.props;

    if (
      //checks if this is first render
      !this.oldProps ||
      //checks if its props has changed
      !isSameReference(layout, this.oldProps.layout) ||
      !isSameReference(breakpoints, this.oldProps.breakpoints) ||
      !isSameReference(activeBreakpointId, this.oldProps.activeBreakpointId)
    ) {
      const indicatorActive = activeBreakpointId !== null;
      this.elements.indicator.classList.toggle(
        CLASS_INDICATOR_INACTIVE,
        !indicatorActive
      );

      const active =
        breakpoints.find((bp) => bp.id === activeBreakpointId) ?? null;
      this.elements.label.textContent = active?.label ?? active?.id ?? "–";
      this.elements.viewport.textContent = formatViewport(layout);
      this.elements.dpr.textContent = formatDpr(layout.devicePixelRatio);
    }
  }

  private renderExpansion() {
    if (!this.elements || !this.props) return;

    const { expanded } = this.props;

    if (
      //checks if this is first render
      !this.oldProps ||
      //checks if its props has changed
      !isSameReference(expanded, this.oldProps.expanded)
    ) {
      this.elements.container.classList.toggle(CLASS_BADGE_EXPANDED, expanded);
      this.elements.pill.setAttribute("aria-expanded", String(expanded));
    }
  }

  private renderBreakpoints(): void {
    if (!this.props || !this.elements) return;

    const { breakpoints, activeBreakpointId } = this.props;
    if (
      // checks if this is first render
      !this.oldProps ||
      // checks if its props changed
      !isSameReference(breakpoints, this.oldProps.breakpoints) ||
      !isSameReference(activeBreakpointId, this.oldProps.activeBreakpointId)
    ) {
      const container = this.elements.breakpoints;
      container.innerHTML = "";

      if (!breakpoints.length) {
        const empty = document.createElement("div");
        empty.className = CLASS_BREAKPOINTS_EMPTY;
        empty.textContent = "No breakpoints configured";
        container.appendChild(empty);
        return;
      }

      for (const bp of breakpoints) {
        const item = document.createElement("div");
        item.className = CLASS_BREAKPOINT_ITEM;
        item.setAttribute("role", "listitem");
        if (bp.id === activeBreakpointId) {
          item.classList.add(CLASS_BREAKPOINT_ITEM_ACTIVE);
        }

        const name = document.createElement("span");
        name.textContent = bp.label;
        item.appendChild(name);

        const range = document.createElement("span");
        range.className = CLASS_BREAKPOINT_RANGE;
        range.textContent = formatBreakpointRange(bp);
        item.appendChild(range);

        container.appendChild(item);
      }
    }
  }

}
