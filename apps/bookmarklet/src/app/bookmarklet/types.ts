import type { OverlayConfig } from "breakpoint-overlay";

export type BreakpointDraft = {
  id: string;
  label: string;
  minWidth: string;
  maxWidth: string;
};

export type MatchStrategy = "auto" | "min-width" | "max-width" | "range";

export type ConfigParseResult = {
  config: OverlayConfig;
  errors: string[];
};
