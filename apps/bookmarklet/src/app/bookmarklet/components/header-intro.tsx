import Link from "next/link";

export function HeaderIntro() {
  return (
    <header className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--page-muted)]">
        Breakpoint Overlay
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-[var(--page-heading)] md:text-4xl">
        Bookmarklet Generator
      </h1>
      <p className="mt-4 text-base text-[var(--page-text)]">
        Configure your overlay, generate a bookmarklet, and drop it into your
        browser toolbar for instant breakpoint debugging.
      </p>
      <p className="mt-2 text-sm text-[var(--page-muted)]">
        Prefer the live demo? Visit{" "}
        <Link className="underline underline-offset-4" href="/demo">
          /demo
        </Link>
        .
      </p>
    </header>
  );
}
