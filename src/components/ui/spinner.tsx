import * as React from "react";

import { cn } from "@/utils";

const sizeMap = {
  sm: "size-4 border-2",
  md: "size-8 border-2",
  lg: "size-10 border-[3px]",
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof sizeMap;
}

/**
 * Tailwind-based loading indicator (border + animate-spin).
 */
function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-hidden
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-solid border-zinc-200 border-t-teal-600 dark:border-zinc-700 dark:border-t-teal-400",
        sizeMap[size],
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
