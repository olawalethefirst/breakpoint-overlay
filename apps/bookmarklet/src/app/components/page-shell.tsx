import type { ReactNode } from "react";

import { ThemeToggle } from "./theme-toggle";

type PageShellProps = {
  header?: ReactNode;
  children: ReactNode;
};

export function PageShell({ header, children }: PageShellProps) {
  return (
    <main className="page-shell min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {header}
          <ThemeToggle />
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
