import * as React from "react";

import { cn } from "@/lib/utils";

// Simple shadcn-style input that follows the FixMate blue/cyan theme.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-300 aria-invalid:focus:ring-red-100",
        className
      )}
      {...props}
    />
  );
}

export { Input };
