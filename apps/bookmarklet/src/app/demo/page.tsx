import { OverlayDemoControls } from "../overlay-demo-controls";
import { PageShell } from "../components/page-shell";
import Link from "next/link";

export default function DemoPage() {
  return (
    <PageShell
      header={
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--page-muted)]">
            Breakpoint Overlay
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[var(--page-heading)] md:text-4xl">
            Live Demo
          </h1>
          <p className="mt-4 text-base text-[var(--page-text)]">
            Toggle the overlay and watch the badge respond as you resize the
            viewport.
          </p>
          <p className="mt-2 text-sm text-[var(--page-muted)]">
            Need the generator instead? Visit{" "}
            <Link className="underline underline-offset-4" href="/">
              /
            </Link>
            .
          </p>
        </header>
      }
    >
      <div className="flex">
        <OverlayDemoControls />
      </div>
    </PageShell>
  );
}
