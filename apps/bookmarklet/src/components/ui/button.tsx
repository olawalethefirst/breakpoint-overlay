import * as React from "react";

import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "xs" | "sm";

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-[var(--card-text)] bg-[var(--card-text)] text-[var(--card-bg)] hover:opacity-90",
  secondary:
    "border border-[var(--card-panel-border)] text-[var(--card-muted)] hover:border-[var(--card-border)] hover:text-[var(--card-text)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-3 py-1 text-xs",
  sm: "px-4 py-2 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, type = "button", variant = "secondary", size = "sm", ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
