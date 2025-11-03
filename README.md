# breakpoint-overlay

## Installation

```bash
# npm
npm install --save-dev breakpoint-overlay

# pnpm
pnpm add -D breakpoint-overlay

# yarn
yarn add -D breakpoint-overlay
```

## Overlay API

### `initOverlay(config?)`

Creates the overlay runtime and returns an `OverlayHandle`. Call this once early in your app lifecycle—keyboard shortcuts only start working after `initOverlay` runs so the listener can register. Repeated calls automatically destroy the previous instance before creating a new one.

```ts
import { initOverlay } from '@breakpoint-overlay';

const overlay = initOverlay({
  breakpoints: [
    { id: 'mobile', label: 'Mobile', maxWidth: 767 },
    { id: 'desktop', label: 'Desktop', minWidth: 1200 },
  ],
});
```

### `OverlayConfig`

| Property        | Type                                                           | Default       | Description |
|-----------------|----------------------------------------------------------------|---------------|-------------|
| `breakpoints`   | `Array<{ id: string; label?: string } & ({ minWidth: number; maxWidth?: never } \| { maxWidth: number; minWidth?: never } \| { minWidth: number; maxWidth: number })>` | `[]`        | Author-supplied breakpoint definitions. Leave empty to defer configuration until a later `updateConfig` call. |
| `matchStrategy` | `'min-width' \| 'max-width' \| 'range'`                        | _inferred_    | Forces a specific matching strategy; when omitted, each breakpoint is inferred individually. |
| `hotkey`        | `string`                                                       | `alt+shift+o` | Keyboard shortcut in `modifier+...+key` form (e.g. `ctrl+shift+k`, `alt+o`). Supported modifiers: `alt`, `ctrl`, `shift`, `meta` (aliases `cmd`/`command`). The final token must be a single character. Matching is case-insensitive and also checks `event.code` for letters/digits, so layouts that emit `Ø` for `Alt+Shift+O` still work. Use an empty string (`""`) to disable the shortcut entirely. |
| `debounceMs`    | `number`                                                       | `150`         | Debounce interval (ms) between viewport samples from the tracker. |

### `OverlayHandle`

`initOverlay` returns an object with the following methods:

- `start()` – Activate the overlay badge and begin viewport tracking.
- `stop()` – Deactivate the overlay and reset the badge’s expanded state.
- `toggle()` – Convenience wrapper that switches between `start()` and `stop()`.
- `destroy()` – Fully tear down the overlay: removes keyboard listeners, stops tracking, and unmounts the badge.
- `updateConfig(patch)` – Merge new configuration; updates listeners and recomputes state when properties like `hotkey` or `breakpoints` change.
- `getState()` – Returns the current runtime `RuntimeState`.
- `subscribe(listener)` – Registers a store subscriber; returns an unsubscribe function.

### Keyboard shortcut behaviour

- The listener registers when `initOverlay` creates the runtime; shortcuts do nothing until the handle exists.
- Key events with editable targets (`input`, `textarea`, `select`, or `contenteditable` elements) are ignored to avoid injecting characters while the user types.
- When the overlay handles the shortcut it calls `event.preventDefault()` but still leaves the event bubbling so other listeners can observe it.
- Updating `config.hotkey` via `updateConfig` automatically tears down the previous listener and attaches the new binding.
