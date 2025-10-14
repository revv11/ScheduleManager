"use client";
import Prompt from "@/components/custom/Prompt";
import AIRec from "@/components/custom/AIRec";
import Progress from "@/components/custom/Progress";
import SkeletonWrapper from "@/components/custom/SkeletonWrapper";
import useSchedule from "@/zustand/useSchedule";
import { useEffect } from "react";

export default function Home() {
  const {
    taskLoading,
    msgLoading, // CHANGE: Added msgLoading for the chat component
    taskError,
    msgError,
    fetchTasks,
    fetchMessages,
  } = useSchedule();

  useEffect(() => {
    fetchTasks();
    fetchMessages();
  }, [fetchTasks, fetchMessages]);

  return (
    <div className="min-h-full bg-zinc-900 text-zinc-100">
      <main className="container mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-5 lg:grid-cols-3 ">
        {/* Today's Schedule */}
        <SkeletonWrapper
          loading={taskLoading}
          error={taskError}
          skeleton={

            <div className="h-[calc(100vh-140px)] rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="border-b border-zinc-800 p-4">
                <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
              </div>
              <div className="space-y-4 p-4">
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
                <div className="h-8 w-full animate-pulse rounded bg-zinc-800" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-800" />
                <div className="h-8 w-5/6 animate-pulse rounded bg-zinc-800" />
              </div>
            </div>
          }
        >
          <Progress />
        </SkeletonWrapper>

        {/* AI Recommendations */}
        <SkeletonWrapper
          loading={taskLoading}
          error={taskError}
          skeleton={
            // FIX: Unified height for consistency
            <div className="h-[calc(100vh-140px)] rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="border-b border-zinc-800 p-4">
                <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
              </div>
              <div className="space-y-3 p-4">
                <div className="border-b border-zinc-800/50 p-3">
                  <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="border-b border-zinc-800/50 p-3">
                  <div className="mb-2 h-5 w-2/3 animate-pulse rounded bg-zinc-800" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="border-b border-zinc-800/50 p-3">
                  <div className="mb-2 h-5 w-4/5 animate-pulse rounded bg-zinc-800" />
                  <div className="h-4 w-2/5 animate-pulse rounded bg-zinc-800" />
                </div>
              </div>
            </div>
          }
        >
          <AIRec />
        </SkeletonWrapper>

        {/* Chat Interface */}
        <SkeletonWrapper
          // CHANGE: Using msgLoading for the chat component's loading state
          loading={msgLoading}
          error={msgError}
          skeleton={
            // FIX: Unified height and restructured for a better chat UI skeleton
            <div className="flex h-[calc(100vh-140px)] flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-950">
              {/* Header */}
              <div className="border-b border-zinc-800 p-4">
                <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
              </div>
              {/* Messages Area */}
              <div className="flex-grow space-y-4 p-4">
                <div className="flex items-start justify-start gap-2">
                  <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-zinc-800" />
                  <div className="h-16 w-3/4 animate-pulse rounded-lg bg-zinc-800" />
                </div>
                <div className="flex items-start justify-end gap-2">
                  <div className="h-16 w-2/3 animate-pulse rounded-lg bg-zinc-800" />
                  <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-zinc-800" />
                </div>
                <div className="flex items-start justify-start gap-2">
                  <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-zinc-800" />
                  <div className="h-12 w-1/2 animate-pulse rounded-lg bg-zinc-800" />
                </div>
              </div>
              {/* Input Area */}
              <div className="border-t border-zinc-800 p-4">
                <div className="flex gap-2">
                  <div className="h-10 flex-1 animate-pulse rounded bg-zinc-800" />
                  <div className="h-10 w-10 animate-pulse rounded bg-zinc-800" />
                </div>
              </div>
            </div>
          }
        >
          <Prompt />
        </SkeletonWrapper>
      </main>
    </div>
  );
}