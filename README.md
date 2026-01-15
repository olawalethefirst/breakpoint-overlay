# breakpoint-overlay

Lightweight breakpoint badge for quickly seeing which responsive range is active in the browser.

## Project map

- [Package API reference](packages/overlay/README.md) — detailed usage and configuration.
- [Bookmarklet demo](apps/bookmarklet/README.md) — bootstrap `breakpoint-overlay` without package installation.

## Installation

```bash
# npm
npm install --save-dev breakpoint-overlay

# pnpm
pnpm add -D breakpoint-overlay

# yarn
yarn add -D breakpoint-overlay
```

## Quick start

```ts
import { initOverlay } from '@breakpoint-overlay';

const overlay = initOverlay({
  breakpoints: [
    { id: 'mobile', label: 'Mobile', maxWidth: 767 },
    { id: 'desktop', label: 'Desktop', minWidth: 1200 },
  ],
});
```

## Quick test

Try the live demo to see `breakpoint-overlay` in action:
[Live demo](https://breakpoint-overlay-bookmarklet-n3dq.vercel.app/demo)

## Why use it

- Validate responsive layouts while resizing or using device emulation.
- Keep a quick, always-visible indicator of the active breakpoint.

## Developing locally

```bash
pnpm install
pnpm --filter breakpoint-overlay build
pnpm --filter bookmarklet dev
```
