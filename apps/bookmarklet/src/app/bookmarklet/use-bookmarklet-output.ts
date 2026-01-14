"use client";

import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { OverlayConfig } from "breakpoint-overlay";

import { DEFAULT_CDN_BASE } from "./constants";
import { buildIifeUrl } from "./script-url";
import { buildBookmarklet } from "./utils";

export type UseBookmarkletOutputResult = {
  scriptBaseUrl: string;
  setScriptBaseUrl: Dispatch<SetStateAction<string>>;
  scriptSpecifier: string;
  setScriptSpecifier: Dispatch<SetStateAction<string>>;
  scriptUrl: string;
  bookmarklet: string;
  decodedSnippet: string;
};

export const useBookmarkletOutput = (
  config: OverlayConfig,
  initialBaseUrl: string = DEFAULT_CDN_BASE,
  initialSpecifier: string = ""
): UseBookmarkletOutputResult => {
  const [scriptBaseUrl, setScriptBaseUrl] = useState(initialBaseUrl);
  const [scriptSpecifier, setScriptSpecifier] = useState(initialSpecifier);

  const scriptUrl = useMemo(
    () => buildIifeUrl(scriptBaseUrl, scriptSpecifier),
    [scriptBaseUrl, scriptSpecifier]
  );

  const bookmarklet = useMemo(
    () => buildBookmarklet(scriptUrl, config),
    [scriptUrl, config]
  );

  const decodedSnippet = useMemo(
    () => bookmarklet.replace(/^javascript:/, ""),
    [bookmarklet]
  );

  return {
    scriptBaseUrl,
    setScriptBaseUrl,
    scriptSpecifier,
    setScriptSpecifier,
    scriptUrl,
    bookmarklet,
    decodedSnippet,
  };
};
