import * as React from "react";

import { cn } from "./utils";

export type InputProps = React.ComponentPropsWithoutRef<"input">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
