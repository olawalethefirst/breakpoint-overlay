import { describe, expect, it } from "vitest";

import { buildBookmarklet, buildConfig, configFromJson } from "./utils";
import type { BreakpointDraft } from "./types";

describe("buildConfig", () => {
  it("validates breakpoints and reports warnings", () => {
    const breakpoints: BreakpointDraft[] = [
      { id: "", label: "Missing", minWidth: "", maxWidth: "" },
      { id: "mobile", label: "Mobile", minWidth: "", maxWidth: "767" },
      { id: "mobile", label: "Dup", minWidth: "768", maxWidth: "1199" },
      { id: "desktop", label: "Desktop", minWidth: "1200", maxWidth: "0" },
    ];

    const { errors } = buildConfig(breakpoints, "auto", "alt+o", "150");

    expect(errors).toEqual(
      expect.arrayContaining([
        "Breakpoint 1 needs an id.",
        'Breakpoint id "mobile" is duplicated.',
        'Breakpoint "desktop" has minWidth > maxWidth.',
      ])
    );
  });

  it("enforces match strategy rules", () => {
    const breakpoints: BreakpointDraft[] = [
      { id: "only-min", label: "Only", minWidth: "320", maxWidth: "" },
      { id: "has-max", label: "Has max", minWidth: "", maxWidth: "768" },
    ];

    const { errors } = buildConfig(breakpoints, "min-width", "", "");

    expect(errors).toEqual(
      expect.arrayContaining([
        'Breakpoint "has-max" requires minWidth.',
        'Breakpoint "has-max" cannot include maxWidth.',
      ])
    );
  });

  it("builds config when inputs are valid", () => {
    const breakpoints: BreakpointDraft[] = [
      { id: "mobile", label: "Mobile", minWidth: "", maxWidth: "767" },
    ];

    const { config, errors } = buildConfig(
      breakpoints,
      "max-width",
      "ctrl+k",
      "250"
    );

    expect(errors).toEqual([]);
    expect(config).toMatchObject({
      matchStrategy: "max-width",
      hotkey: "ctrl+k",
      debounceMs: 250,
      breakpoints: [{ id: "mobile", label: "Mobile", maxWidth: 767 }],
    });
  });
});

describe("buildBookmarklet", () => {
  it("creates a javascript bookmarklet with config payload", () => {
    const scriptUrl = "https://cdn.example.com/overlay.js";
    const bookmarklet = buildBookmarklet(scriptUrl, { hotkey: "alt+o" });

    expect(bookmarklet.startsWith("javascript:")).toBe(true);
    expect(bookmarklet).toContain(scriptUrl);
    expect(bookmarklet).toContain("BreakpointOverlay");
    expect(bookmarklet).toContain('"hotkey":"alt+o"');
  });
});

describe("configFromJson", () => {
  it("parses valid JSON configs", () => {
    const parsed = configFromJson(
      JSON.stringify({ hotkey: "ctrl+g", debounceMs: 200 })
    );

    expect(parsed).toEqual({ hotkey: "ctrl+g", debounceMs: 200 });
  });

  it("returns null for invalid JSON", () => {
    expect(configFromJson("{invalid")).toBeNull();
  });
});
