import * as React from "react";

import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end",
        className
      )}
      {...props}
    />
  );
}

function Field({ className, ...props }) {
  return (
    <div className={cn("min-w-0 flex flex-col gap-2", className)} {...props} />
  );
}

function FieldLabel({ className, ...props }) {
  return (
    <label
      className={cn("text-sm font-medium text-[#121C2D] dark:text-white", className)}
      {...props}
    />
  );
}

export { FieldGroup, Field, FieldLabel };
