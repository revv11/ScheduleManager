"use client";
import Prompt from "@/components/custom/Prompt";
import AIRec from "@/components/custom/AIRec";
import Progress from "@/components/custom/Progress";
import SkeletonWrapper from "@/components/custom/SkeletonWrapper";
import useSchedule from "@/zustand/useSchedule";
import { useEffect, useState } from "react";
import { ClipboardList, Sparkles, MessageSquare } from "lucide-react";

export default function Home() {
  const {
    taskLoading,
    msgLoading,
    globalLoading,
    taskError,
    msgError,
    fetchTasks,
    fetchMessages,
    fetchSubTasks,
  } = useSchedule();

  const [activeTab, setActiveTab] = useState<"progress" | "recommendations" | "chat">("progress");

  useEffect(() => {
    fetchTasks();
    fetchMessages(false);
    fetchSubTasks();
  }, [fetchTasks, fetchMessages, fetchSubTasks]);

  const tabs = [
    { id: "progress" as const, label: "Progress", icon: ClipboardList },
    { id: "recommendations" as const, label: "Tasks", icon: Sparkles },
    { id: "chat" as const, label: "AI Chat", icon: MessageSquare },
  ];

  return (
    <div className="h-full w-full flex flex-col">
      {/* Mobile Tabs - Only visible on small screens */}
      <div className="lg:hidden flex-shrink-0 border-b border-zinc-800 bg-zinc-950">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-purple-400 border-b-2 border-purple-400 bg-zinc-900"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Single component at a time */}
      <div className="lg:hidden flex-1 min-h-0 p-4">
        {activeTab === "progress" && (
          <SkeletonWrapper
            loading={globalLoading}
            error={taskError}
            onRetry={() => {
              fetchTasks();
              fetchSubTasks();
            }}
            className="h-full min-h-0"
            skeleton={
              <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
                  <div className="h-8 w-full animate-pulse rounded bg-zinc-800" />
                  <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-800" />
                </div>
              </div>
            }
          >
            <Progress />
          </SkeletonWrapper>
        )}

        {activeTab === "recommendations" && (
          <SkeletonWrapper
            loading={taskLoading}
            error={taskError}
            onRetry={fetchTasks}
            className="h-full min-h-0"
            skeleton={
              <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-4">
                  <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  <div className="border-b border-zinc-800/50 p-3">
                    <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-800" />
                  </div>
                </div>
              </div>
            }
          >
            <AIRec />
          </SkeletonWrapper>
        )}

        {activeTab === "chat" && (
          <SkeletonWrapper
            loading={msgLoading}
            error={msgError}
            onRetry={() => fetchMessages(false)}
            className="h-full min-h-0"
            skeleton={
              <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex-shrink-0 border-b border-zinc-800 p-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4">
                  <div className="flex items-start justify-start gap-2">
                    <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-zinc-800" />
                    <div className="h-16 w-3/4 animate-pulse rounded-lg bg-zinc-800" />
                  </div>
                </div>
                <div className="flex-shrink-0 border-t border-zinc-800 p-4">
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
        )}
      </div>

      {/* Desktop View - Grid with all 3 components */}
      <div className="hidden lg:block h-full w-full p-6">
        <div className="flex-1 min-h-0 h-full grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Progress Card */}
        <SkeletonWrapper
          loading={globalLoading}
          error={taskError}
          onRetry={() => {
            fetchTasks();
            fetchSubTasks();
          }}
          className="h-full min-h-0"
            skeleton={
              <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
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

        {/* AI Recommendations Card */}
        <SkeletonWrapper
          loading={taskLoading}
          error={taskError}
          onRetry={fetchTasks}
          className="h-full min-h-0"
            skeleton={
              <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-4">
                  <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  <div className="border-b border-zinc-800/50 p-3">
                    <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-800" />
                  </div>
                  <div className="border-b border-zinc-800/50 p-3">
                    <div className="mb-2 h-5 w-2/3 animate-pulse rounded bg-zinc-800" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-800" />
                  </div>
                </div>
              </div>
            }
        >
          <AIRec />
        </SkeletonWrapper>

        {/* Chat Interface Card */}
        <SkeletonWrapper
          loading={msgLoading}
          error={msgError}
          onRetry={() => fetchMessages(false)}
          className="h-full min-h-0"
            skeleton={
              <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex-shrink-0 border-b border-zinc-800 p-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4">
                  <div className="flex items-start justify-start gap-2">
                    <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-zinc-800" />
                    <div className="h-16 w-3/4 animate-pulse rounded-lg bg-zinc-800" />
                  </div>
                  <div className="flex items-start justify-end gap-2">
                    <div className="h-16 w-2/3 animate-pulse rounded-lg bg-zinc-800" />
                    <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-zinc-800" />
                  </div>
                </div>
                <div className="flex-shrink-0 border-t border-zinc-800 p-4">
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
        </div>
      </div>
    </div>
  );
}