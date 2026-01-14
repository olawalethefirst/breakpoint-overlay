import * as React from "react";

import { cn } from "./utils";

export type LabelProps = React.ComponentPropsWithoutRef<"label">;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-xs font-semibold uppercase tracking-wide", className)}
      {...props}
    />
  )
);

Label.displayName = "Label";
