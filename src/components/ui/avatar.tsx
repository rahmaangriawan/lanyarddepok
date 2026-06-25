"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AvatarProps = React.ComponentProps<"span"> & {
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)}
      {...props}
    />
  );
}

function AvatarImage({ className, alt = "", ...props }: React.ComponentProps<"img">) {
  return <img data-slot="avatar-image" alt={alt} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
