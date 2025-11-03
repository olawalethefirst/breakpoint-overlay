import { createOverlayHandle } from './core/runtime';
import type { OverlayConfig, OverlayHandle } from './core/types';

let activeOverlay: OverlayHandle | null = null;

export function initOverlay(config?: OverlayConfig): OverlayHandle {
  if (activeOverlay) {
    activeOverlay.destroy();
    activeOverlay = null;
  }

  const handle = createOverlayHandle(config);
  const originalDestroy = handle.destroy.bind(handle);

  handle.destroy = () => {
    originalDestroy();
    if (activeOverlay === handle) {
      activeOverlay = null;
    }
  };

  activeOverlay = handle;

  return handle;
}
