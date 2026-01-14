"use client";

import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { DEFAULT_BREAKPOINTS } from "./constants";
import { buildConfig } from "./utils";
import type { BreakpointDraft, MatchStrategy } from "./types";

export type BookmarkletConfigState = {
  breakpoints: BreakpointDraft[];
  matchStrategy: MatchStrategy;
  hotkey: string;
  debounceMs: string;
};

export type BookmarkletConfigActions = {
  setBreakpoints: Dispatch<SetStateAction<BreakpointDraft[]>>;
  setMatchStrategy: Dispatch<SetStateAction<MatchStrategy>>;
  setHotkey: Dispatch<SetStateAction<string>>;
  setDebounceMs: Dispatch<SetStateAction<string>>;
  addBreakpoint: () => void;
  updateBreakpoint: (
    index: number,
    key: keyof BreakpointDraft,
    value: string
  ) => void;
  removeBreakpoint: (index: number) => void;
};

export type UseBookmarkletConfigResult = BookmarkletConfigState &
  BookmarkletConfigActions & {
    config: ReturnType<typeof buildConfig>["config"];
    errors: ReturnType<typeof buildConfig>["errors"];
  };

export const useBookmarkletConfig = (
  initialBreakpoints: BreakpointDraft[] = DEFAULT_BREAKPOINTS
): UseBookmarkletConfigResult => {
  const [breakpoints, setBreakpoints] = useState<BreakpointDraft[]>(
    initialBreakpoints
  );
  const [matchStrategy, setMatchStrategy] = useState<MatchStrategy>("auto");
  const [hotkey, setHotkey] = useState("alt+shift+o");
  const [debounceMs, setDebounceMs] = useState("150");

  const { config, errors } = useMemo(
    () => buildConfig(breakpoints, matchStrategy, hotkey, debounceMs),
    [breakpoints, matchStrategy, hotkey, debounceMs]
  );

  const addBreakpoint = () => {
    setBreakpoints((current) => [
      ...current,
      { id: "", label: "", minWidth: "", maxWidth: "" },
    ]);
  };

  const updateBreakpoint = (
    index: number,
    key: keyof BreakpointDraft,
    value: string
  ) => {
    setBreakpoints((current) =>
      current.map((bp, idx) =>
        idx === index
          ? {
              ...bp,
              [key]: value,
            }
          : bp
      )
    );
  };

  const removeBreakpoint = (index: number) => {
    setBreakpoints((current) => current.filter((_, idx) => idx !== index));
  };

  return {
    breakpoints,
    matchStrategy,
    hotkey,
    debounceMs,
    config,
    errors,
    setBreakpoints,
    setMatchStrategy,
    setHotkey,
    setDebounceMs,
    addBreakpoint,
    updateBreakpoint,
    removeBreakpoint,
  };
};
