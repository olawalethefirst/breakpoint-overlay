import type { BreakpointDraft } from "./types";

export const DEFAULT_CDN_BASE = "https://unpkg.com";

export const DEFAULT_BREAKPOINTS: BreakpointDraft[] = [
  { id: "mobile", label: "Mobile", minWidth: "", maxWidth: "767" },
  { id: "tablet", label: "Tablet", minWidth: "768", maxWidth: "1199" },
  { id: "desktop", label: "Desktop", minWidth: "1200", maxWidth: "" },
];

export const MODIFIER_KEYS = new Set(["Shift", "Alt", "Control", "Meta"]);
