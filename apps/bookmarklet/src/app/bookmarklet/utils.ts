import type { OverlayConfig } from "breakpoint-overlay";
import type { BreakpointDraft, ConfigParseResult, MatchStrategy } from "./types";
import { MODIFIER_KEYS } from "./constants";

type BreakpointPayload = {
  id: string;
  label?: string;
  minWidth?: number;
  maxWidth?: number;
};

export const normalizeHotkey = (event: KeyboardEvent): string | null => {
  if (MODIFIER_KEYS.has(event.key)) return null;
  if (event.key.length !== 1) return null;

  const modifiers: string[] = [];
  if (event.ctrlKey) modifiers.push("ctrl");
  if (event.altKey) modifiers.push("alt");
  if (event.shiftKey) modifiers.push("shift");
  if (event.metaKey) modifiers.push("meta");

  modifiers.push(event.key.toLowerCase());
  return modifiers.join("+");
};

export const parseNumeric = (value: string): number | null => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
};

export const buildConfig = (
  breakpoints: BreakpointDraft[],
  matchStrategy: MatchStrategy,
  hotkey: string,
  debounceMs: string
): ConfigParseResult => {
  const errors: string[] = [];
  const seen = new Set<string>();

  const cleaned = breakpoints
    .map((bp, index) => {
      const id = bp.id.trim();
      const label = bp.label.trim();
      const minValue = parseNumeric(bp.minWidth);
      const maxValue = parseNumeric(bp.maxWidth);

      if (!id) {
        errors.push(`Breakpoint ${index + 1} needs an id.`);
      } else if (seen.has(id)) {
        errors.push(`Breakpoint id "${id}" is duplicated.`);
      }

      if (id) {
        seen.add(id);
      }

      if (bp.minWidth.trim() !== "" && minValue === null) {
        errors.push(`Breakpoint "${id || index + 1}" has invalid minWidth.`);
      }

      if (bp.maxWidth.trim() !== "" && maxValue === null) {
        errors.push(`Breakpoint "${id || index + 1}" has invalid maxWidth.`);
      }

      if (minValue !== null && maxValue !== null && minValue > maxValue) {
        errors.push(`Breakpoint "${id || index + 1}" has minWidth > maxWidth.`);
      }

      if (minValue === null && maxValue === null) {
        errors.push(`Breakpoint "${id || index + 1}" needs a min/max width.`);
      }

      if (matchStrategy === "min-width") {
        if (minValue === null) {
          errors.push(`Breakpoint "${id || index + 1}" requires minWidth.`);
        }
        if (maxValue !== null) {
          errors.push(`Breakpoint "${id || index + 1}" cannot include maxWidth.`);
        }
      }

      if (matchStrategy === "max-width") {
        if (maxValue === null) {
          errors.push(`Breakpoint "${id || index + 1}" requires maxWidth.`);
        }
        if (minValue !== null) {
          errors.push(`Breakpoint "${id || index + 1}" cannot include minWidth.`);
        }
      }

      if (matchStrategy === "range") {
        if (minValue === null || maxValue === null) {
          errors.push(`Breakpoint "${id || index + 1}" requires min and max.`);
        }
      }

      return {
        id,
        label: label || undefined,
        minWidth: minValue ?? undefined,
        maxWidth: maxValue ?? undefined,
      } satisfies BreakpointPayload;
    })
    .filter((bp) => bp.id);

  const config: OverlayConfig = matchStrategy !== "auto" ? { matchStrategy } : {};

  if (cleaned.length > 0) {
    config.breakpoints = cleaned as NonNullable<OverlayConfig["breakpoints"]>;
  }

  if (hotkey.trim() !== "") {
    config.hotkey = hotkey.trim();
  }

  const debounceValue = parseNumeric(debounceMs);
  if (debounceMs.trim() !== "" && debounceValue !== null) {
    config.debounceMs = debounceValue;
  }

  return { config, errors };
};

export const buildBookmarklet = (
  scriptUrl: string,
  config: OverlayConfig
): string => {
  const payload = JSON.stringify(config);
  const url = JSON.stringify(scriptUrl.trim());
  const snippet =
    `(function(){const url=${url};const config=${payload};` +
    "const run=function(){const api=window.BreakpointOverlay;" +
    "if(!api){return;}" +
    "if(!window.__bpOverlay){window.__bpOverlay=api.initOverlay(config);}" +
    "else{window.__bpOverlay.updateConfig(config);}" +
    "window.__bpOverlay.toggle();};" +
    "if(window.BreakpointOverlay){run();return;}" +
    "var script=document.createElement('script');" +
    "script.src=url;script.onload=run;" +
    "document.head.appendChild(script);})();";

  return `javascript:${snippet}`;
};

export const configFromJson = (value: string): OverlayConfig | null => {
  try {
    return JSON.parse(value) as OverlayConfig;
  } catch {
    return null;
  }
};
