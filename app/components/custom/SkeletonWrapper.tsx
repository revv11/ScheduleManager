"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

type SkeletonWrapperProps = {
  loading: boolean;
  error?: React.ReactNode | string | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
  onRetry?: () => void;
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
  onRetry,
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
      <div className={cn("flex h-full w-full items-center justify-center p-6", className)}>
        <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-red-900/40 bg-red-950/20 p-6 text-center">
          <div className="rounded-full bg-red-950/50 p-3">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-red-200">Something went wrong</h3>
            <p className="text-sm text-red-300/80">
              {typeof error === "string" ? error : "An error occurred while loading data"}
            </p>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-2 border-red-800 bg-red-950/50 text-red-200 hover:bg-red-900/50 hover:text-red-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <div className={cn(className)}>{children}</div>;
}


