import { DEFAULT_CDN_BASE } from "./constants";

const PACKAGE_NAME = "breakpoint-overlay";
const IIFE_PATH = "dist/index.iife.js";

const normalizeBase = (value: string) => value.trim().replace(/\/+$/, "");

export const buildIifeUrl = (baseUrl: string, specifier?: string) => {
  const base = normalizeBase(baseUrl || DEFAULT_CDN_BASE);
  if (!specifier) {
    return `${base}/${PACKAGE_NAME}/${IIFE_PATH}`;
  }
  return `${base}/${PACKAGE_NAME}@${specifier}/${IIFE_PATH}`;
};
