
## Breakpoint Overlay Bookmarklet

Use the bookmarklet to bootstrap `breakpoint-overlay` on any site without installing the package. Generate a bookmarklet from the live configurator, add it to your browser, and trigger the overlay instantly on whatever page you are testing.
Want to try it immediately? The demo page ships with a pre-installed overlay so you can see it working before adding any bookmarklet.

[Project overview](../../README.md) (back to the repo overview)

### Generate a bookmarklet
1. Open the live generator: [Bookmarklet generator](https://breakpoint-overlay-bookmarklet-n3dq.vercel.app)
2. Configure your breakpoints and options.
3. Create the bookmarklet and add it to your browser toolbar.

Each bookmarklet is locked to the configuration you used at creation time. If you need a different breakpoint set later, generate a new bookmarklet with the updated settings.

### Quick start (demo page)
The live generator includes a demo page with a pre-installed `breakpoint-overlay`, so you can see it working instantly without adding the bookmarklet or committing to a configuration. The local app ships with the same demo flow. If you do add the bookmarklet, it also works on the demo page like any other site.

### How to use it
- Open any page you want to inspect (including the demo page).
- Click the bookmarklet in your toolbar to start the overlay.
- The overlay loads immediately and tracks the current viewport.

### Run the app locally (optional)
This app lives inside the monorepo so it can link against the local `breakpoint-overlay` package.

#### Prerequisites
- Node.js ≥ 18
- [pnpm](https://pnpm.io/installation) installed globally

#### Setup
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
   pnpm --filter bookmarklet dev
   ```
4. Visit http://localhost:3000/demo, click **Toggle Overlay**, and resize the viewport (or use devtools emulation) to watch the badge update.
