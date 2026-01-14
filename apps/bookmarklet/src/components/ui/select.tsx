import * as React from "react";

import { cn } from "./utils";

export type SelectProps = React.ComponentPropsWithoutRef<"select">;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40",
        className
      )}
      {...props}
    />
  )
);

Select.displayName = "Select";
