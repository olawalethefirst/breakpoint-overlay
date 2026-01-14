import * as React from "react";

import { cn } from "./utils";

export type TextareaProps = React.ComponentPropsWithoutRef<"textarea">;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
