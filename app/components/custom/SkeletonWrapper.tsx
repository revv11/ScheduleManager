"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SkeletonWrapperProps = {
  loading: boolean;
  error?: React.ReactNode | string;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
};

/**
 * SkeletonWrapper renders a loading skeleton while `loading` is true,
 * shows the provided `error` state if present, and otherwise renders children.
 */
export default function SkeletonWrapper({
  loading,
  error,
  children,
  skeleton,
  className,
}: SkeletonWrapperProps) {
  if (loading) {
    return (
      <div className={cn("w-full animate-pulse", className)}>
        {skeleton ?? (
          <div className="space-y-4">
            <div className="h-6 w-1/3 rounded bg-zinc-800" />
            <div className="h-10 w-full rounded bg-zinc-800" />
            <div className="h-10 w-11/12 rounded bg-zinc-800" />
            <div className="h-10 w-10/12 rounded bg-zinc-800" />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-md border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300", className)}>
        {typeof error === "string" ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <span>{error}</span>
          </div>
        ) : (
          error
        )}
      </div>
    );
  }

  return <div className={cn(className)}>{children}</div>;
}


