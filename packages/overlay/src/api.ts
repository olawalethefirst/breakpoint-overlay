import { createOverlayHandle } from './core/runtime';
import type { OverlayConfig, OverlayHandle } from './core/types';

export function initOverlay(config?: OverlayConfig): OverlayHandle {
  return createOverlayHandle(config);
}
