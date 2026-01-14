"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type BookmarkletOutputProps = {
  bookmarklet: string;
  hasWarnings: boolean;
};

export function BookmarkletOutput({ bookmarklet, hasWarnings }: BookmarkletOutputProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const dragLinkRef = useRef<HTMLAnchorElement | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookmarklet);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  useEffect(() => {
    if (!dragLinkRef.current) return;
    dragLinkRef.current.setAttribute("href", bookmarklet);
  }, [bookmarklet]);

  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] backdrop-blur">
      <h2 className="text-lg font-semibold text-[var(--page-heading)]">
        Bookmarklet Output
      </h2>
      <p className="mt-2 text-sm text-[var(--card-muted)]">
        Copy this URL into a new bookmark. Dragging this:{" "}
        <a
          className="inline-flex w-fit items-center rounded-full border border-[var(--card-panel-border)] bg-[var(--card-panel-bg)] px-3 py-1 text-[11px] font-medium text-[var(--card-text)] shadow-sm transition hover:border-[var(--card-border)] hover:bg-[var(--card-bg)]"
          ref={dragLinkRef}
          title="Breakpoint"
          draggable={true}
        >
          Breakpoint Overlay
        </a>{" "}
        into your bookmarks bar works too.
      </p>
      <Textarea
        className="mt-4 h-32 w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-xs text-[var(--input-text)]"
        value={bookmarklet}
        readOnly
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={handleCopy}
          variant="primary"
          size="xs"
        >
          {copyStatus === "copied"
            ? "Copied"
            : copyStatus === "error"
              ? "Copy failed"
              : "Copy"}
        </Button>
        <span className="text-xs text-[var(--card-muted)]">
          {hasWarnings
            ? "Fix warnings before use on critical pages."
            : "Ready to paste."}
        </span>
      </div>
    </div>
  );
}
