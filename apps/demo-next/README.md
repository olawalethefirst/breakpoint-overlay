
## Breakpoint Overlay Demo

This example lives inside the monorepo so it can link against the local `breakpoint-overlay` package. To run it, clone the repository root and follow the steps below.

### Prerequisites
- Node.js ≥ 18
- [pnpm](https://pnpm.io/installation) installed globally

### Setup
1. Install workspace dependencies from the repo root:
   ```bash
   pnpm install
   ```
2. Build the overlay package so its dist files (JS and d.ts) are available to the demo:
   ```bash
   pnpm --filter breakpoint-overlay build
   ```
3. Start the demo app with Turbopack:
   ```bash
   pnpm --filter demo-next dev
   ```
4. Visit [http://localhost:3000](http://localhost:3000), click **Start overlay**, and resize the viewport (or use devtools emulation) to watch the badge update.
